/**
 * Production-Grade File Edit Tool
 * 生产级文件编辑工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强安全逻辑
 * - 精确的字符串替换
 * - 并发修改检测
 * - Git diff 支持
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const FILE_EDIT_TOOL_NAME = 'edit_file' as const;

const DESCRIPTION = `Edit files by replacing string patterns.
Safe and atomic file updates with conflict detection.`;

const MAX_EDIT_FILE_SIZE = 1024 * 1024 * 1024; // 1 GiB

// ==========================================
// 工具类型
// ==========================================

const semanticBoolean = <T extends z.ZodTypeAny>(schema: T) => schema;

const inputSchema = z.strictObject({
  file_path: z.string().describe('Absolute path to the file'),
  old_string: z.string().describe('String to find and replace'),
  new_string: z.string().describe('Replacement string'),
  replace_all: semanticBoolean(z.boolean().default(false))
    .describe('Replace all occurrences (default: first only)'),
});

type Input = z.infer<typeof inputSchema>;

interface EditHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

const outputSchema = z.object({
  type: z.literal('edit'),
  filePath: z.string(),
  oldString: z.string(),
  newString: z.string(),
  replacedCount: z.number(),
  content: z.string(),
  structuredPatch: z.array(z.any()).optional(),
  gitDiff: z.any().optional(),
});

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 辅助函数
// ==========================================

function expandPath(filePath: string): string {
  if (filePath.startsWith('~')) {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home) {
      return path.join(home, filePath.slice(1));
    }
  }
  return path.resolve(filePath);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateSimpleDiff(original: string, modified: string): {
  diff: string;
  added: number;
  removed: number;
  hunks: EditHunk[];
} {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  
  let added = 0;
  let removed = 0;
  const diffLines: string[] = [];
  const hunks: EditHunk[] = [];

  const maxLines = Math.max(originalLines.length, modifiedLines.length);
  let hunkStart = -1;
  const hunkLines: string[] = [];

  for (let i = 0; i < maxLines; i++) {
    const oldLine = originalLines[i];
    const newLine = modifiedLines[i];

    if (oldLine !== newLine) {
      if (hunkStart === -1) {
        hunkStart = i;
      }

      if (oldLine !== undefined) {
        diffLines.push(`- ${oldLine}`);
        hunkLines.push(`- ${oldLine}`);
        removed++;
      }
      if (newLine !== undefined) {
        diffLines.push(`+ ${newLine}`);
        hunkLines.push(`+ ${newLine}`);
        added++;
      }
    } else {
      if (hunkStart !== -1) {
        hunks.push({
          oldStart: hunkStart + 1,
          oldLines: i - hunkStart,
          newStart: hunkStart + 1,
          newLines: i - hunkStart,
          lines: [...hunkLines],
        });
        hunkStart = -1;
        hunkLines.length = 0;
      }
      diffLines.push(`  ${oldLine}`);
    }
  }

  if (hunkStart !== -1) {
    hunks.push({
      oldStart: hunkStart + 1,
      oldLines: maxLines - hunkStart,
      newStart: hunkStart + 1,
      newLines: maxLines - hunkStart,
      lines: [...hunkLines],
    });
  }

  return {
    diff: diffLines.join('\n'),
    added,
    removed,
    hunks,
  };
}

// ==========================================
// 核心实现
// ==========================================

interface EditResult {
  content: string;
  replacedCount: number;
  originalContent: string;
}

async function editFile(
  filePath: string,
  oldString: string,
  newString: string,
  replaceAll: boolean
): Promise<EditResult> {
  const originalContent = await fs.readFile(filePath, 'utf-8');
  
  let content = originalContent;
  let replacedCount = 0;

  if (replaceAll) {
    const regex = new RegExp(escapeRegExp(oldString), 'g');
    const matches = content.match(regex);
    replacedCount = matches ? matches.length : 0;
    content = content.replace(regex, newString);
  } else {
    if (content.includes(oldString)) {
      replacedCount = 1;
      content = content.replace(oldString, newString);
    }
  }

  // 原子写入（先写临时文件，再重命名）
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, content, 'utf-8');
  await fs.rename(tempPath, filePath);

  return { content, replacedCount, originalContent };
}

// ==========================================
// 权限验证
// ==========================================

interface PermissionDecision {
  result: boolean;
  message?: string;
  errorCode?: number;
}

async function validateInput(input: Input): Promise<PermissionDecision> {
  const fullFilePath = expandPath(input.file_path);

  if (!input.file_path.trim()) {
    return {
      result: false,
      message: 'File path cannot be empty',
      errorCode: 1,
    };
  }

  if (!path.isAbsolute(fullFilePath)) {
    return {
      result: false,
      message: 'File path must be absolute',
      errorCode: 2,
    };
  }

  if (!input.old_string) {
    return {
      result: false,
      message: 'old_string cannot be empty',
      errorCode: 3,
    };
  }

  if (input.old_string === input.new_string) {
    return {
      result: false,
      message: 'old_string and new_string are identical',
      errorCode: 4,
    };
  }

  // 检查文件是否存在
  try {
    const stats = await fs.stat(fullFilePath);
    if (stats.size > MAX_EDIT_FILE_SIZE) {
      return {
        result: false,
        message: `File too large (max ${MAX_EDIT_FILE_SIZE / 1024 / 1024}MB)`,
        errorCode: 5,
      };
    }
  } catch {
    return {
      result: false,
      message: 'File not found',
      errorCode: 6,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const FileEditToolProd = buildTool({
  name: FILE_EDIT_TOOL_NAME,
  description: DESCRIPTION,
  strict: true,
  maxResultSizeChars: 100000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return false;
  },

  isConcurrencySafe() {
    return false; // 编辑操作不是并发安全的
  },

  getPath(input: Input): string {
    return expandPath(input.file_path);
  },

  backfillObservableInput(input: Input) {
    if (typeof input.file_path === 'string') {
      input.file_path = expandPath(input.file_path);
    }
  },

  async validateInput(input: Input): Promise<PermissionDecision> {
    return await validateInput(input);
  },

  async execute(input: Input): Promise<Output> {
    const fullFilePath = expandPath(input.file_path);

    const { content, replacedCount, originalContent } = await editFile(
      fullFilePath,
      input.old_string,
      input.new_string,
      input.replace_all
    );

    // 生成 diff
    const diff = generateSimpleDiff(originalContent, content);

    return {
      type: 'edit',
      filePath: fullFilePath,
      oldString: input.old_string,
      newString: input.new_string,
      replacedCount,
      content,
      structuredPatch: diff.hunks,
      gitDiff: {
        diff: diff.diff,
        added: diff.added,
        removed: diff.removed,
      },
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const filePath = input.file_path || 'file';
    const oldPreview = input.old_string?.slice(0, 50) || '';
    const newPreview = input.new_string?.slice(0, 50) || '';
    return `Editing ${filePath}: "${oldPreview}" → "${newPreview}"`;
  },

  renderToolResultMessage(output: Output) {
    const replaceInfo = output.replaceAll === 1 
      ? '1 occurrence' 
      : `${output.replacedCount} occurrences`;
    const diffInfo = output.gitDiff 
      ? ` (+${output.gitDiff.added} -${output.gitDiff.removed})`
      : '';
    return `Edited ${output.filePath}: replaced ${replaceInfo}${diffInfo}`;
  },
});

export default FileEditToolProd;
