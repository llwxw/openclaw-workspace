/**
 * Production-Grade Task Create Tool
 * 生产级任务创建工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 任务优先级
 * - 状态管理
 * - 异步任务支持
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const TASK_CREATE_TOOL_NAME = 'task_create' as const;

const DESCRIPTION = `Create a new task in the task list.
Tasks can be scheduled for immediate or future execution.`;

const MAX_TASK_TITLE_LENGTH = 500;
const MAX_TASK_DESCRIPTION_LENGTH = 10000;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  title: z.string()
    .min(1)
    .max(MAX_TASK_TITLE_LENGTH)
    .describe('Title of the task'),
  description: z.string()
    .optional()
    .max(MAX_TASK_DESCRIPTION_LENGTH)
    .describe('Detailed description of the task'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
    .default('medium')
    .describe('Task priority level'),
  scheduledTime: z.string()
    .optional()
    .describe('ISO timestamp for scheduled execution'),
  agentId: z.string()
    .optional()
    .describe('Agent ID to run this task'),
  model: z.string()
    .optional()
    .describe('Model to use for this task'),
  timeout: z.number()
    .optional()
    .describe('Timeout in seconds'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  taskId: z.string(),
  title: z.string(),
  status: z.enum(['pending', 'scheduled', 'running', 'completed', 'failed']),
  priority: z.string(),
  scheduledTime: z.string().optional(),
  createdAt: z.string(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 任务存储
// ==========================================

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'scheduled' | 'running' | 'completed' | 'failed';
  scheduledTime?: string;
  agentId?: string;
  model?: string;
  timeout?: number;
  createdAt: string;
  updatedAt: string;
}

// 内存存储（生产环境应该用数据库）
const taskStore = new Map<string, Task>();

// ==========================================
// 工具函数
// ==========================================

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function getPriorityWeight(priority: string): number {
  const weights: Record<string, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return weights[priority] || 2;
}

// ==========================================
// 权限验证
// ==========================================

interface PermissionDecision {
  result: boolean;
  message?: string;
  errorCode?: number;
}

function validateInput(input: Input): PermissionDecision {
  if (!input.title || !input.title.trim()) {
    return {
      result: false,
      message: 'Task title cannot be empty',
      errorCode: 1,
    };
  }

  if (input.title.length > MAX_TASK_TITLE_LENGTH) {
    return {
      result: false,
      message: `Task title too long (max ${MAX_TASK_TITLE_LENGTH} characters)`,
      errorCode: 2,
    };
  }

  if (input.description && input.description.length > MAX_TASK_DESCRIPTION_LENGTH) {
    return {
      result: false,
      message: `Task description too long (max ${MAX_TASK_DESCRIPTION_LENGTH} characters)`,
      errorCode: 3,
    };
  }

  if (input.scheduledTime) {
    const scheduled = new Date(input.scheduledTime);
    const now = new Date();
    if (scheduled <= now) {
      return {
        result: false,
        message: 'Scheduled time must be in the future',
        errorCode: 4,
      };
    }
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const TaskCreateToolProd = buildTool({
  name: TASK_CREATE_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'create a new background task',
  strict: true,
  maxResultSizeChars: 10000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return false;
  },

  isConcurrencySafe() {
    return true; // 使用 Map 可以安全并发
  },

  validateInput(input: Input): PermissionDecision {
    return validateInput(input);
  },

  execute(input: Input): Output {
    const now = new Date().toISOString();
    
    // 确定状态
    let status: Output['status'] = 'pending';
    if (input.scheduledTime) {
      status = 'scheduled';
    }

    // 创建任务
    const task: Task = {
      id: generateTaskId(),
      title: input.title.trim(),
      description: input.description?.trim(),
      priority: input.priority || 'medium',
      status,
      scheduledTime: input.scheduledTime,
      agentId: input.agentId,
      model: input.model,
      timeout: input.timeout,
      createdAt: now,
      updatedAt: now,
    };

    // 存储任务
    taskStore.set(task.id, task);

    return {
      taskId: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      scheduledTime: task.scheduledTime,
      createdAt: task.createdAt,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const title = input.title?.slice(0, 50) || '';
    const priority = input.priority || 'medium';
    return `Creating task: "${title}" [${priority}]`;
  },

  renderToolResultMessage(output: Output) {
    const statusText = output.scheduledTime 
      ? `scheduled for ${new Date(output.scheduledTime).toLocaleString()}`
      : output.status;
    return `Created task "${output.title}" (${output.taskId}) - ${statusText}`;
  },
});

// 导出任务管理函数
export function getTask(taskId: string): Task | undefined {
  return taskStore.get(taskId);
}

export function listTasks(): Task[] {
  return Array.from(taskStore.values());
}

export function updateTaskStatus(taskId: string, status: Task['status']): boolean {
  const task = taskStore.get(taskId);
  if (!task) return false;
  
  task.status = status;
  task.updatedAt = new Date().toISOString();
  taskStore.set(taskId, task);
  return true;
}

export default TaskCreateToolProd;