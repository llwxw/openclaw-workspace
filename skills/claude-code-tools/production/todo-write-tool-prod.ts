/**
 * Production-Grade Todo Write Tool
 * 生产级待办事项写入工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 完整的状态管理
 * - 持久化支持
 * - 验证和错误处理
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const TODO_WRITE_TOOL_NAME = 'todo_write' as const;

const DESCRIPTION = `Write a todo item to the todo list.
Manages a persistent todo list for tracking tasks and reminders.`;

const MAX_TODO_CONTENT_LENGTH = 10000;
const TODO_FILE_NAME = '.claude-todos.json';

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  todo: z.string()
    .min(1)
    .max(MAX_TODO_CONTENT_LENGTH)
    .describe('The todo item to add'),
  activeForm: z.string()
    .optional()
    .describe('Active form display text'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  todos: z.array(z.object({
    content: z.string(),
    activeForm: z.string().optional(),
    status: z.enum(['pending', 'completed']),
  })),
  addedTodo: z.string(),
  totalCount: z.number(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// Todo 存储接口
// ==========================================

interface TodoItem {
  content: string;
  activeForm?: string;
  status: 'pending' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

interface TodoStore {
  version: number;
  todos: TodoItem[];
}

// ==========================================
// 工具函数
// ==========================================

function getTodoFilePath(): string {
  const cwd = process.cwd();
  return path.join(cwd, TODO_FILE_NAME);
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

// ==========================================
// Todo 存储操作
// ==========================================

async function loadTodos(): Promise<TodoItem[]> {
  const filePath = getTodoFilePath();
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const store: TodoStore = JSON.parse(content);
    return store.todos || [];
  } catch {
    // 文件不存在或解析失败，返回空列表
    return [];
  }
}

async function saveTodos(todos: TodoItem[]): Promise<void> {
  const filePath = getTodoFilePath();
  const store: TodoStore = {
    version: 1,
    todos,
  };
  
  // 确保目录存在
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  await fs.writeFile(filePath, JSON.stringify(store, null, 2), 'utf-8');
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
  if (!input.todo || !input.todo.trim()) {
    return {
      result: false,
      message: 'Todo content cannot be empty',
      errorCode: 1,
    };
  }

  if (input.todo.length > MAX_TODO_CONTENT_LENGTH) {
    return {
      result: false,
      message: `Todo content too long (max ${MAX_TODO_CONTENT_LENGTH} characters)`,
      errorCode: 2,
    };
  }

  // 检查工作目录可写性
  const cwd = process.cwd();
  try {
    await fs.access(cwd, fs.constants.W_OK);
  } catch {
    return {
      result: false,
      message: 'Working directory is not writable',
      errorCode: 3,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const TodoWriteToolProd = buildTool({
  name: TODO_WRITE_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'add a task to the todo list',
  strict: true,
  maxResultSizeChars: 10000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return false; // 写入操作
  },

  isConcurrencySafe() {
    return false; // 写入操作不是并发安全的
  },

  getPath(): string | undefined {
    return getTodoFilePath();
  },

  async validateInput(input: Input): Promise<PermissionDecision> {
    return await validateInput(input);
  },

  async execute(input: Input): Promise<Output> {
    const todos = await loadTodos();
    
    // 创建新待办项
    const newTodo: TodoItem = {
      content: input.todo.trim(),
      activeForm: input.activeForm?.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 添加到列表
    todos.push(newTodo);
    
    // 保存
    await saveTodos(todos);

    return {
      todos,
      addedTodo: input.todo,
      totalCount: todos.length,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const todoText = input.todo?.slice(0, 50) || '';
    return `Adding todo: "${todoText}${input.todo && input.todo.length > 50 ? '...' : ''}"`;
  },

  renderToolResultMessage(output: Output) {
    return `Added todo: "${output.addedTodo.slice(0, 30)}..." (${output.totalCount} total)`;
  },
});

export default TodoWriteToolProd;