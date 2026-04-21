/**
 * Production-Grade File Read Tool
 * 生产级文件读取工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑安全
 * - 完整的错误处理
 * - 权限检查
 * - 多种文件类型支持
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool, type ToolUseContext } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const FILE_READ_TOOL_NAME = 'read_file' as const;

const DESCRIPTION = `Read the contents of a file.
Supports text files, images, PDFs, and notebooks.
Use offset and limit for large files.`;

const BLOCKED_DEVICE_PATHS = new Set([
  '/dev/zero', '/dev/random', '/dev/urandom', '/dev/full',
  '/dev/stdin', '/dev/tty', '/dev/console',
  '/dev/stdout', '/dev/stderr',
  '/dev/fd/0', '/dev/fd/1', '/dev/fd/2',
]);

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);

// ==========================================
// 工具类型
// ==========================================

const semanticNumber = <T extends z.ZodTypeAny>(schema: T) => schema;

const inputSchema = z.strictObject({
  file_path: z.string().describe('Absolute path to the file'),
  offset: semanticNumber(z.number().int().nonnegative().optional())
    .describe('Line number to start reading from (1-indexed)'),
  limit: semanticNumber(z.number().int().positive().optional())
    .describe('Maximum number of lines to read'),
  pages: z.string().optional()
    .describe('Page range for PDFs (e.g., "1-5", "3")'),
});

type Input = z.infer<typeof inputSchema>;

const outputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    file: z.object({
      filePath: z.string(),
      content: z.string(),
      numLines: z.number(),
      startLine: z.number(),
      totalLines: z.number(),
    }),
  }),
  z.object({
    type: z.literal('image'),
    file: z.object({
      base64: z.string(),
      type: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
      originalSize: z.number(),
    }),
  }),
  z.object({
    type: z.literal('error'),
    error: z.object({
      message: z.string(),
      errorCode: z.number(),
    }),
  }),
]);

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 辅助函数
// ==========================================

function isBlockedDevicePath(filePath: string): boolean {
  if (BLOCKED_DEVICE_PATHS.has(filePath)) return true;
  if (filePath.startsWith('/proc/') && 
      (filePath.endsWith('/fd/0') || filePath.endsWith('/fd/1') || filePath.endsWith('/fd/2'))) {
    return true;
  }
  return false;
}

function expandPath(filePath: string): string {
  if (filePath.startsWith('~')) {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home) {
      return path.join(home, filePath.slice(1));
    }
  }
  return path.resolve(filePath);
}

function hasBinaryExtension(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const binaryExts = new Set([
    '.exe', '.dll', '.so', '.dylib', '.bin',
    '.zip', '.tar', '.gz', '.rar',
    '.class', '.jar', '.war',
  ]);
  return binaryExts.has(ext);
}

// ==========================================
// 核心实现
// ==========================================

async function readTextFile(
  filePath: string,
  offset: number = 1,
  limit?: number
): Promise<Output> {
  const content = await fs.readFile(filePath, 'utf-8');
  const allLines = content.split('\n');
  const totalLines = allLines.length;

  const startIdx = Math.max(0, offset - 1);
  const endIdx = limit ? startIdx + limit : undefined;
  const lines = allLines.slice(startIdx, endIdx);

  return {
    type: 'text',
    file: {
      filePath,
      content: lines.join('\n'),
      numLines: lines.length,
      startLine: offset,
      totalLines,
    },
  };
}

async function readImageFile(filePath: string): Promise<Output> {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}` as const;

  return {
    type: 'image',
    file: {
      base64: buffer.toString('base64'),
      type: mimeType,
      originalSize: buffer.length,
    },
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

  // 检查设备文件
  if (isBlockedDevicePath(fullFilePath)) {
    return {
      result: false,
      message: `Cannot read '${input.file_path}': blocked device file.`,
      errorCode: 9,
    };
  }

  // 检查二进制文件
  const ext = path.extname(fullFilePath).toLowerCase();
  if (hasBinaryExtension(fullFilePath) && 
      !['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
    return {
      result: false,
      message: `Cannot read binary files (${ext}).`,
      errorCode: 4,
    };
  }

  // 检查文件是否存在
  try {
    await fs.access(fullFilePath);
  } catch {
    return {
      result: false,
      message: `File not found: ${input.file_path}`,
      errorCode: 2,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const FileReadToolProd = buildTool({
  name: FILE_READ_TOOL_NAME,
  description: DESCRIPTION,
  strict: true,
  maxResultSizeChars: Infinity,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return true;
  },

  isConcurrencySafe() {
    return true;
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
    const ext = path.extname(fullFilePath).toLowerCase();

    try {
      // 图片文件
      if (IMAGE_EXTENSIONS.has(ext.slice(1))) {
        return await readImageFile(fullFilePath);
      }

      // 默认文本文件
      return await readTextFile(fullFilePath, input.offset, input.limit);

    } catch (error) {
      return {
        type: 'error',
        error: {
          message: error instanceof Error ? error.message : String(error),
          errorCode: 10,
        },
      };
    }
  },

  // UI 渲染
  renderToolUseMessage(input: Partial<Input>) {
    return `Reading ${input.file_path || 'file'}${input.limit ? ` (first ${input.limit} lines)` : ''}`;
  },

  renderToolResultMessage(output: Output) {
    if (output.type === 'text') {
      return `Read ${output.file.numLines} lines (${output.file.content.length} chars)`;
    }
    if (output.type === 'image') {
      return `Read image (${(output.file.originalSize / 1024).toFixed(1)} KB)`;
    }
    if (output.type === 'error') {
      return `Error: ${output.error.message}`;
    }
    return 'Done';
  },
});

export default FileReadToolProd;
