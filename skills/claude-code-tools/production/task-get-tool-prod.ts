/**
 * Production-Grade Task Get Tool
 * 生产级任务获取工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 任务详情获取
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const TASK_GET_TOOL_NAME = 'task_get' as const;

const DESCRIPTION = `Get details of a specific task by ID.
Retrieves full task information including status, priority, and metadata.`;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  taskId: z.string()
    .describe('ID of the task to retrieve'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  taskId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  message: z.string(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 任务存储（模拟）
// ==========================================

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

const taskStore = new Map<string, Task>();

// ==========================================
// 工具定义
// ==========================================

export const TaskGetToolProd = buildTool({
  name: TASK_GET_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'get task details by ID',
  strict: true,
  maxResultSizeChars: 10000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return true;
  },

  isConcurrencySafe() {
    return true;
  },

  execute(input: Input): Output {
    const task = taskStore.get(input.taskId);
    
    if (!task) {
      return {
        taskId: input.taskId,
        message: `Task not found: ${input.taskId}`,
      };
    }

    return {
      taskId: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      message: `Found task: ${task.title}`,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    return `Getting task: ${input.taskId}`;
  },

  renderToolResultMessage(output: Output) {
    if (output.title) {
      return `Task: ${output.title} (${output.status})`;
    }
    return output.message;
  },
});

export function registerTask(task: Task): void {
  taskStore.set(task.id, task);
}

export default TaskGetToolProd;