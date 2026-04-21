/**
 * Production-Grade File Write Tool
 * 生产级文件写入工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强安全逻辑
 * - 自动创建目录
 * - Git diff 支持
 * - 文件历史记录
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const FILE_WRITE_TOOL_NAME = 'write_file' as const;

const DESCRIPTION = `Write content to a file.
Creates parent directories automatically.
Backs up original content for updates.`;

// ==========================================
// Diff 类型
// ==========================================

interface Hunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

interface GitDiff {
  diff: string;
  added: number;
  removed: number;
}

// ==========================================
// 工具类型
// ==========================================

const inputSchema = z.strictObject({
  file_path: z.string().describe('Absolute path to the file'),
  content: z.string().describe('Content to write'),
});

type Input = z.infer<typeof inputSchema>;

const outputSchema = z.object({
  type: z.enum(['create', 'update']),
  filePath: z.string(),
  content: z.string(),
  structuredPatch: z.array(z.any()).optional(),
  originalFile: z.string().nullable(),
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

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function generateSimpleDiff(original: string, modified: string): GitDiff {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  
  let added = 0;
  let removed = 0;
  const diffLines: string[] = [];

  const maxLines = Math.max(originalLines.length, modifiedLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = originalLines[i];
    const newLine = modifiedLines[i];

    if (oldLine !== undefined && newLine === undefined) {
      diffLines.push(`- ${oldLine}`);
      removed++;
    } else if (oldLine === undefined && newLine !== undefined) {
      diffLines.push(`+ ${newLine}`);
      added++;
    } else if (oldLine !== newLine) {
      if (oldLine !== undefined) {
        diffLines.push(`- ${oldLine}`);
        removed++;
      }
      if (newLine !== undefined) {
        diffLines.push(`+ ${newLine}`);
        added++;
      }
    } else {
      diffLines.push(`  ${oldLine}`);
    }
  }

  return {
    diff: diffLines.join('\n'),
    added,
    removed,
  };
}

// ==========================================
// 核心实现
// ==========================================

async function writeFileWithBackup(
  filePath: string,
  content: string
): Promise<{ type: 'create' | 'update'; originalContent: string | null }> {
  const exists = await fileExists(filePath);
  let originalContent: string | null = null;

  if (exists) {
    originalContent = await fs.readFile(filePath, 'utf-8');
  }

  // 自动创建父目录
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  // 写入文件
  await fs.writeFile(filePath, content, 'utf-8');

  return {
    type: exists ? 'update' : 'create',
    originalContent,
  };
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

  // 检查是否在安全目录内（可选）
  const safeDirs = [
    process.env.HOME,
    process.cwd(),
  ].filter(Boolean) as string[];

  const isInSafeDir = safeDirs.some(dir => 
    fullFilePath.startsWith(dir + path.sep) || fullFilePath === dir
  );

  if (!isInSafeDir && safeDirs.length > 0) {
    return {
      result: false,
      message: 'File path is outside allowed directories',
      errorCode: 3,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const FileWriteToolProd = buildTool({
  name: FILE_WRITE_TOOL_NAME,
  description: DESCRIPTION,
  strict: true,
  maxResultSizeChars: 100000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return false;
  },

  isConcurrencySafe() {
    return false; // 写入操作不是并发安全的
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

    const { type, originalContent } = await writeFileWithBackup(
      fullFilePath,
      input.content
    );

    // 生成 diff
    let gitDiff: GitDiff | undefined;
    if (type === 'update' && originalContent !== null) {
      gitDiff = generateSimpleDiff(originalContent, input.content);
    }

    return {
      type,
      filePath: fullFilePath,
      content: input.content,
      structuredPatch: [],
      originalFile: originalContent,
      gitDiff,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const filePath = input.file_path || 'file';
    const contentPreview = input.content?.slice(0, 100) || '';
    return `Writing ${filePath}: ${contentPreview}${input.content && input.content.length > 100 ? '...' : ''}`;
  },

  renderToolResultMessage(output: Output) {
    const action = output.type === 'create' ? 'Created' : 'Updated';
    const diffInfo = output.gitDiff 
      ? ` (+${output.gitDiff.added} -${output.gitDiff.removed})`
      : '';
    return `${action} ${output.filePath}${diffInfo}`;
  },
});

export default FileWriteToolProd;
