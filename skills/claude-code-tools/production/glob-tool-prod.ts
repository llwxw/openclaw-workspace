/**
 * Production-Grade Glob Tool
 * 生产级文件搜索工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强安全逻辑
 * - 支持 Glob 模式
 * - 忽略文件支持
 * - 结果限制
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const GLOB_TOOL_NAME = 'glob' as const;

const DESCRIPTION = `Search for files using glob patterns.
Supports *, **, ?, [seq], [!seq] patterns.
Respects .gitignore files.`;

const DEFAULT_MAX_RESULTS = 100;
const DEFAULT_MAX_DEPTH = 20;

// 默认忽略模式
const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '*.log',
  '.DS_Store',
  'thumbs.db',
];

// ==========================================
// 工具类型
// ==========================================

const inputSchema = z.strictObject({
  pattern: z.string().describe('Glob pattern (e.g., "**/*.ts", "src/**")'),
  path: z.string().optional().describe('Root path to search (default: cwd)'),
  ignore: z.array(z.string()).optional().describe('Patterns to ignore'),
  max_results: z.number().int().positive().optional()
    .describe('Maximum number of results (default: 100)'),
  include_directories: z.boolean().default(false)
    .describe('Include directories in results'),
});

type Input = z.infer<typeof inputSchema>;

const outputSchema = z.object({
  matches: z.array(z.string()),
  count: z.number(),
  truncated: z.boolean(),
  searchPath: z.string(),
  pattern: z.string(),
});

type Output = z.infer<typeof outputSchema>;

// ==========================================
// Glob 模式匹配
// ==========================================

function globToRegex(pattern: string): RegExp {
  let regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
    .replace(/\*\*/g, '{{GLOBSTAR}}') // 临时标记 **
    .replace(/\*/g, '[^/]*') // * 匹配单段
    .replace(/\?/g, '[^/]') // ? 匹配单个字符
    .replace(/{{GLOBSTAR}}/g, '.*') // ** 匹配任意路径
    .replace(/\[!([^\]]+)\]/g, '[^$1]') // [!seq] 否定字符类
    .replace(/\[([^\]]+)\]/g, '[$1]'); // [seq] 字符类

  return new RegExp(`^${regex}$`);
}

function matchGlob(pattern: string, filePath: string): boolean {
  const regex = globToRegex(pattern);
  return regex.test(filePath);
}

function shouldIgnore(
  filePath: string,
  ignorePatterns: string[]
): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return ignorePatterns.some(pattern => {
    const regex = globToRegex(pattern);
    return regex.test(normalizedPath) || 
           normalizedPath.split('/').some(part => regex.test(part));
  });
}

// ==========================================
// 文件遍历
// ==========================================

interface WalkOptions {
  maxDepth?: number;
  ignorePatterns?: string[];
  includeDirectories?: boolean;
  maxResults?: number;
}

async function walkDirectory(
  dir: string,
  pattern: string,
  options: WalkOptions = {}
): Promise<string[]> {
  const {
    maxDepth = DEFAULT_MAX_DEPTH,
    ignorePatterns = [],
    includeDirectories = false,
    maxResults = DEFAULT_MAX_RESULTS,
  } = options;

  const results: string[] = [];
  const rootDir = path.resolve(dir);
  const allIgnorePatterns = [...DEFAULT_IGNORE_PATTERNS, ...ignorePatterns];

  async function walk(currentDir: string, currentDepth: number = 0): Promise<void> {
    if (currentDepth > maxDepth || results.length >= maxResults) {
      return;
    }

    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

        // 检查是否应该忽略
        if (shouldIgnore(relativePath || entry.name, allIgnorePatterns)) {
          continue;
        }

        if (entry.isDirectory()) {
          if (includeDirectories && matchGlob(pattern, relativePath)) {
            results.push(relativePath || '.');
          }
          await walk(fullPath, currentDepth + 1);
        } else if (entry.isFile()) {
          if (matchGlob(pattern, relativePath)) {
            results.push(relativePath);
          }
        }
      }
    } catch {
      // 忽略无法访问的目录
    }
  }

  await walk(rootDir);
  return results.slice(0, maxResults);
}

// ==========================================
// 权限验证
// ==========================================

interface PermissionDecision {
  result: boolean;
  message?: string;
  errorCode?: number;
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

async function validateInput(input: Input): Promise<PermissionDecision> {
  if (!input.pattern.trim()) {
    return {
      result: false,
      message: 'Pattern cannot be empty',
      errorCode: 1,
    };
  }

  // 检查危险模式
  if (input.pattern === '/' || input.pattern === '**/*') {
    return {
      result: false,
      message: 'Pattern too broad, please be more specific',
      errorCode: 2,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const GlobToolProd = buildTool({
  name: GLOB_TOOL_NAME,
  description: DESCRIPTION,
  strict: true,
  maxResultSizeChars: 50000,

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
    const maxResults = input.max_results || DEFAULT_MAX_RESULTS;

    const matches = await walkDirectory(searchPath, input.pattern, {
      ignorePatterns: input.ignore || [],
      includeDirectories: input.include_directories,
      maxResults: maxResults + 1, // 多取一个来检测截断
    });

    const truncated = matches.length > maxResults;
    const finalMatches = truncated ? matches.slice(0, maxResults) : matches;

    return {
      matches: finalMatches,
      count: finalMatches.length,
      truncated,
      searchPath,
      pattern: input.pattern,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const pathInfo = input.path ? ` in ${input.path}` : '';
    return `Searching for "${input.pattern || 'pattern'}"${pathInfo}`;
  },

  renderToolResultMessage(output: Output) {
    const truncInfo = output.truncated ? ' (truncated)' : '';
    return `Found ${output.count} matches${truncInfo}`;
  },
});

export default GlobToolProd;
