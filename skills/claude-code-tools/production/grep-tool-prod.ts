/**
 * Production-Grade Grep Tool
 * 生产级代码搜索工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强安全逻辑
 * - 高性能搜索（使用 Node.js 内置）
 * - 多种输出模式
 * - 结果限制
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const GREP_TOOL_NAME = 'grep' as const;

const DESCRIPTION = `Search file contents using regular expressions.
Supports multiple output modes and result limiting.`;

const DEFAULT_HEAD_LIMIT = 250;
const VCS_DIRECTORIES = new Set(['.git', '.svn', '.hg', '.bzr']);
const DEFAULT_IGNORE_PATTERNS = ['node_modules/**', 'dist/**', 'build/**', '.git/**'];

// ==========================================
// 工具类型
// ==========================================

const semanticNumber = <T extends z.ZodTypeAny>(schema: T) => schema;
const semanticBoolean = <T extends z.ZodTypeAny>(schema: T) => schema;

const inputSchema = z.strictObject({
  pattern: z.string().describe('Regular expression pattern'),
  path: z.string().optional().describe('File or directory to search'),
  glob: z.string().optional().describe('Glob pattern to filter files'),
  output_mode: z.enum(['content', 'files_with_matches', 'count']).default('files_with_matches')
    .describe('Output mode'),
  '-n': semanticBoolean(z.boolean().default(true)).describe('Show line numbers'),
  '-i': semanticBoolean(z.boolean().default(false)).describe('Case insensitive'),
  '-C': semanticNumber(z.number().optional()).describe('Context lines'),
  context: semanticNumber(z.number().optional()).describe('Context lines (alias for -C)'),
  head_limit: semanticNumber(z.number().optional()).describe('Limit results'),
  offset: semanticNumber(z.number().default(0)).describe('Skip N results'),
});

type Input = z.infer<typeof inputSchema>;

interface GrepMatch {
  file: string;
  line: number;
  content: string;
  before?: string[];
  after?: string[];
}

const outputSchema = z.object({
  mode: z.enum(['content', 'files_with_matches', 'count']),
  numFiles: z.number(),
  filenames: z.array(z.string()),
  content: z.string().optional(),
  numLines: z.number().optional(),
  limitInfo: z.string().optional(),
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

function globToRegex(pattern: string): RegExp {
  const regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '{{GLOBSTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/{{GLOBSTAR}}/g, '.*');
  return new RegExp(`^${regex}$`);
}

function matchGlob(pattern: string, filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const regex = globToRegex(pattern);
  return regex.test(normalizedPath);
}

function shouldIgnore(filePath: string, ignorePatterns: string[]): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const basename = path.basename(filePath);
  return [...DEFAULT_IGNORE_PATTERNS, ...ignorePatterns].some(pattern => {
    const regex = globToRegex(pattern);
    return regex.test(normalizedPath) || 
           normalizedPath.split('/').some(part => regex.test(part)) ||
           VCS_DIRECTORIES.has(basename);
  });
}

function applyHeadLimit<T>(
  items: T[],
  limit: number | undefined,
  offset: number = 0
): { items: T[]; appliedLimit: number | undefined } {
  if (limit === 0) {
    return { items: items.slice(offset), appliedLimit: undefined };
  }
  const effectiveLimit = limit ?? DEFAULT_HEAD_LIMIT;
  const sliced = items.slice(offset, offset + effectiveLimit);
  const wasTruncated = items.length - offset > effectiveLimit;
  return {
    items: sliced,
    appliedLimit: wasTruncated ? effectiveLimit : undefined,
  };
}

function formatLimitInfo(appliedLimit: number | undefined, appliedOffset: number): string {
  const parts: string[] = [];
  if (appliedLimit !== undefined) parts.push(`limit: ${appliedLimit}`);
  if (appliedOffset > 0) parts.push(`offset: ${appliedOffset}`);
  return parts.join(', ');
}

// ==========================================
// 搜索实现
// ==========================================

async function findFiles(
  dir: string,
  globPattern?: string,
  ignorePatterns: string[] = []
): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(dir, fullPath).replace(/\\/g, '/');

        if (shouldIgnore(relativePath || entry.name, ignorePatterns)) {
          continue;
        }

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile()) {
          if (!globPattern || matchGlob(globPattern, relativePath || entry.name)) {
            results.push(fullPath);
          }
        }
      }
    } catch {
      // 忽略无法访问的目录
    }
  }

  await walk(dir);
  return results;
}

async function searchFile(
  filePath: string,
  regex: RegExp,
  contextLines: number = 0
): Promise<GrepMatch[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const matches: GrepMatch[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        const match: GrepMatch = {
          file: filePath,
          line: i + 1,
          content: lines[i],
        };

        if (contextLines > 0) {
          match.before = lines.slice(Math.max(0, i - contextLines), i);
          match.after = lines.slice(i + 1, i + 1 + contextLines);
        }

        matches.push(match);
      }
    }

    return matches;
  } catch {
    return [];
  }
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
  if (!input.pattern.trim()) {
    return {
      result: false,
      message: 'Pattern cannot be empty',
      errorCode: 1,
    };
  }

  try {
    new RegExp(input.pattern, input['-i'] ? 'i' : '');
  } catch (e) {
    return {
      result: false,
      message: `Invalid regular expression: ${(e as Error).message}`,
      errorCode: 2,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const GrepToolProd = buildTool({
  name: GREP_TOOL_NAME,
  description: DESCRIPTION,
  strict: true,
  maxResultSizeChars: 100000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return true;
  },

  isConcurrencySafe() {
    return true;
  },

  getPath(input: Input): string {
    return input.path ? expandPath(input.path) : process.cwd();
  },

  async validateInput(input: Input): Promise<PermissionDecision> {
    return await validateInput(input);
  },

  async execute(input: Input): Promise<Output> {
    const searchPath = input.path ? expandPath(input.path) : process.cwd();
    const contextLines = input['-C'] ?? input.context ?? 0;
    const flags = input['-i'] ? 'i' : '';
    const regex = new RegExp(input.pattern, flags);

    // 查找文件
    const files = await findFiles(searchPath, input.glob);

    // 搜索每个文件
    const allMatches: GrepMatch[] = [];
    const filesWithMatches: string[] = [];
    const fileCounts: Record<string, number> = {};

    for (const file of files) {
      const matches = await searchFile(file, regex, contextLines);
      if (matches.length > 0) {
        allMatches.push(...matches);
        filesWithMatches.push(file);
        fileCounts[file] = matches.length;
      }
    }

    // 应用限制
    const { items: limitedMatches, appliedLimit } = applyHeadLimit(
      allMatches,
      input.head_limit,
      input.offset
    );

    const { items: limitedFiles, appliedLimit: appliedFileLimit } = applyHeadLimit(
      filesWithMatches,
      input.head_limit,
      input.offset
    );

    // 根据输出模式格式化
    if (input.output_mode === 'content') {
      const contentLines: string[] = [];
      const showLineNumbers = input['-n'] ?? true;

      for (const match of limitedMatches) {
        const relativePath = path.relative(searchPath, match.file);
        if (match.before) {
          for (let i = 0; i < match.before.length; i++) {
            const lineNum = match.line - match.before.length + i;
            const prefix = showLineNumbers ? `${relativePath}:${lineNum}- ` : '';
            contentLines.push(prefix + match.before[i]);
          }
        }
        const prefix = showLineNumbers ? `${relativePath}:${match.line}: ` : '';
        contentLines.push(prefix + match.content);
        if (match.after) {
          for (let i = 0; i < match.after.length; i++) {
            const lineNum = match.line + 1 + i;
            const prefix = showLineNumbers ? `${relativePath}:${lineNum}- ` : '';
            contentLines.push(prefix + match.after[i]);
          }
        }
      }

      return {
        mode: 'content',
        numFiles: new Set(limitedMatches.map(m => m.file)).size,
        filenames: [...new Set(limitedMatches.map(m => m.file))],
        content: contentLines.join('\n'),
        numLines: contentLines.length,
        limitInfo: formatLimitInfo(appliedLimit, input.offset),
      };
    }

    if (input.output_mode === 'count') {
      const countLines = limitedFiles.map(file => {
        const relativePath = path.relative(searchPath, file);
        return `${relativePath}: ${fileCounts[file]}`;
      });

      return {
        mode: 'count',
        numFiles: limitedFiles.length,
        filenames: limitedFiles,
        content: countLines.join('\n'),
        numLines: countLines.length,
        limitInfo: formatLimitInfo(appliedFileLimit, input.offset),
      };
    }

    // files_with_matches
    const relativeFiles = limitedFiles.map(file => 
      path.relative(searchPath, file)
    );

    return {
      mode: 'files_with_matches',
      numFiles: limitedFiles.length,
      filenames: limitedFiles,
      content: relativeFiles.join('\n'),
      numLines: relativeFiles.length,
      limitInfo: formatLimitInfo(appliedFileLimit, input.offset),
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const pathInfo = input.path ? ` in ${input.path}` : '';
    const modeInfo = input.output_mode ? ` (${input.output_mode})` : '';
    return `Grep for "${input.pattern || 'pattern'}"${pathInfo}${modeInfo}`;
  },

  renderToolResultMessage(output: Output) {
    const limitInfo = output.limitInfo ? ` [${output.limitInfo}]` : '';
    return `Found matches in ${output.numFiles} files${limitInfo}`;
  },
});

export default GrepToolProd;
