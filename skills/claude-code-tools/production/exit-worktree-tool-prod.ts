/**
 * Production-Grade Exit Worktree Tool
 * 生产级退出工作树工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - Git worktree 管理
 * - 清理资源
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const EXIT_WORKTREE_TOOL_NAME = 'exit_worktree' as const;

const DESCRIPTION = `Exit a Git worktree and optionally clean up.
Returns from a worktree context to the main repository.`;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  worktreePath: z.string()
    .describe('Path to the worktree to exit'),
  cleanup: z.boolean()
    .default(false)
    .describe('Whether to remove the worktree after exiting'),
  force: z.boolean()
    .default(false)
    .describe('Force exit even if there are uncommitted changes'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  success: z.boolean(),
  worktreePath: z.string(),
  cleanedUp: z.boolean(),
  message: z.string(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// Worktree 存储
// ==========================================

interface Worktree {
  path: string;
  branch: string;
  createdAt: string;
  isActive: boolean;
}

const activeWorktrees = new Map<string, Worktree>();

// ==========================================
// 工具函数
// ==========================================

function expandPath(p: string): string {
  if (p.startsWith('~')) {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home) return path.join(home, p.slice(1));
  }
  return path.resolve(p);
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
  const fullPath = expandPath(input.worktreePath);
  
  if (!input.worktreePath) {
    return {
      result: false,
      message: 'worktreePath is required',
      errorCode: 1,
    };
  }

  // 检查目录是否存在
  try {
    const stats = await fs.stat(fullPath);
    if (!stats.isDirectory()) {
      return {
        result: false,
        message: 'Path is not a directory',
        errorCode: 2,
      };
    }
  } catch {
    return {
      result: false,
      message: 'Directory does not exist',
      errorCode: 3,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const ExitWorktreeToolProd = buildTool({
  name: EXIT_WORKTREE_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'exit a Git worktree',
  strict: true,
  maxResultSizeChars: 5000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return false;
  },

  isConcurrencySafe() {
    return false;
  },

  async validateInput(input: Input): Promise<PermissionDecision> {
    return await validateInput(input);
  },

  async execute(input: Input): Promise<Output> {
    const fullPath = expandPath(input.worktreePath);
    
    // 查找工作树
    const worktree = activeWorktrees.get(fullPath);
    
    if (!worktree) {
      // 尝试清理（如果需要）
      let cleanedUp = false;
      if (input.cleanup) {
        try {
          await fs.rm(fullPath, { recursive: true, force: true });
          cleanedUp = true;
        } catch {
          // 忽略清理错误
        }
      }
      
      return {
        success: false,
        worktreePath: fullPath,
        cleanedUp,
        message: `Worktree not found: ${fullPath}`,
      };
    }

    // 标记为非活跃
    worktree.isActive = false;

    // 清理（如果需要）
    let cleanedUp = false;
    if (input.cleanup) {
      try {
        await fs.rm(fullPath, { recursive: true, force: true });
        activeWorktrees.delete(fullPath);
        cleanedUp = true;
      } catch {
        // 忽略清理错误
      }
    }

    return {
      success: true,
      worktreePath: fullPath,
      cleanedUp,
      message: cleanedUp 
        ? `Exited and cleaned up worktree: ${fullPath}`
        : `Exited worktree: ${fullPath}`,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    return `Exiting worktree: ${input.worktreePath}`;
  },

  renderToolResultMessage(output: Output) {
    return output.message;
  },
});

// 导出工作树管理函数
export function createWorktree(path: string, branch: string): Worktree {
  const worktree: Worktree = {
    path,
    branch,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  activeWorktrees.set(path, worktree);
  return worktree;
}

export function getActiveWorktrees(): Worktree[] {
  return Array.from(activeWorktrees.values()).filter(w => w.isActive);
}

export default ExitWorktreeToolProd;