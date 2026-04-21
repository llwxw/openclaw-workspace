/**
 * Production-Grade Notebook Edit Tool
 * 生产级笔记本编辑工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - Jupyter notebook 编辑
 * - 单元格管理
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const NOTEBOOK_EDIT_TOOL_NAME = 'notebook_edit' as const;

const DESCRIPTION = `Edit Jupyter notebook cells.
Add, modify, or remove cells in a Jupyter notebook.`;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  path: z.string()
    .describe('Path to the notebook file (.ipynb)'),
  operation: z.enum(['add', 'update', 'delete', 'insert'])
    .describe('Operation to perform'),
  cell_type: z.enum(['code', 'markdown', 'raw'])
    .optional()
    .describe('Cell type'),
  content: z.string()
    .optional()
    .describe('Cell content'),
  cell_index: z.number()
    .optional()
    .describe('Cell index for update/delete/insert'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  success: z.boolean(),
  path: z.string(),
  operation: z.string(),
  cell_count: z.number(),
  message: z.string(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// Notebook 结构
// ==========================================

interface NotebookCell {
  cell_type: 'code' | 'markdown' | 'raw';
  source: string[];
  metadata: Record<string, any>;
  outputs?: any[];
  execution_count?: number | null;
}

interface Notebook {
  nbformat: number;
  nbformat_minor: number;
  metadata: Record<string, any>;
  cells: NotebookCell[];
}

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

function createEmptyNotebook(): Notebook {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3',
      },
    },
    cells: [],
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
  if (!input.path) {
    return { result: false, message: 'path is required', errorCode: 1 };
  }

  if (!input.operation) {
    return { result: false, message: 'operation is required', errorCode: 2 };
  }

  if (['add', 'insert', 'update'].includes(input.operation) && !input.content) {
    return { result: false, message: 'content is required for add/insert/update', errorCode: 3 };
  }

  const fullPath = expandPath(input.path);
  
  if (input.operation !== 'add') {
    try {
      await fs.access(fullPath);
    } catch {
      return { result: false, message: 'Notebook file does not exist', errorCode: 4 };
    }
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const NotebookEditToolProd = buildTool({
  name: NOTEBOOK_EDIT_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'edit Jupyter notebook cells',
  strict: true,
  maxResultSizeChars: 100000,

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
    const fullPath = expandPath(input.path);
    let notebook: Notebook;

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      notebook = JSON.parse(content);
    } catch {
      notebook = createEmptyNotebook();
    }

    const cellCount = notebook.cells.length;

    switch (input.operation) {
      case 'add': {
        const newCell: NotebookCell = {
          cell_type: input.cell_type || 'code',
          source: (input.content || '').split('\n'),
          metadata: {},
        };
        if (input.cell_type === 'code') {
          newCell.outputs = [];
          newCell.execution_count = null;
        }
        notebook.cells.push(newCell);
        break;
      }

      case 'insert': {
        const idx = input.cell_index ?? 0;
        const newCell: NotebookCell = {
          cell_type: input.cell_type || 'code',
          source: (input.content || '').split('\n'),
          metadata: {},
        };
        notebook.cells.splice(idx, 0, newCell);
        break;
      }

      case 'update': {
        const idx = input.cell_index ?? 0;
        if (idx >= 0 && idx < notebook.cells.length) {
          if (input.content !== undefined) {
            notebook.cells[idx].source = input.content.split('\n');
          }
          if (input.cell_type !== undefined) {
            notebook.cells[idx].cell_type = input.cell_type;
          }
        } else {
          return {
            success: false,
            path: fullPath,
            operation: input.operation,
            cell_count: notebook.cells.length,
            message: `Invalid cell index: ${idx}`,
          };
        }
        break;
      }

      case 'delete': {
        const idx = input.cell_index ?? 0;
        if (idx >= 0 && idx < notebook.cells.length) {
          notebook.cells.splice(idx, 1);
        } else {
          return {
            success: false,
            path: fullPath,
            operation: input.operation,
            cell_count: notebook.cells.length,
            message: `Invalid cell index: ${idx}`,
          };
        }
        break;
      }
    }

    // 保存 notebook
    await fs.writeFile(fullPath, JSON.stringify(notebook, null, 2), 'utf-8');

    return {
      success: true,
      path: fullPath,
      operation: input.operation,
      cell_count: notebook.cells.length,
      message: `Notebook ${input.operation} successful (${notebook.cells.length} cells)`,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    return `Notebook ${input.operation}: ${input.path}`;
  },

  renderToolResultMessage(output: Output) {
    return output.message;
  },
});

export default NotebookEditToolProd;