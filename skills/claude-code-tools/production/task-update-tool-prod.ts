/**
 * Production-Grade Task Update Tool
 * 生产级任务更新工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 任务状态更新
 * - 字段修改
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const TASK_UPDATE_TOOL_NAME = 'task_update' as const;

const DESCRIPTION = `Update an existing task.
Modify task properties like status, priority, or description.`;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  taskId: z.string()
    .describe('ID of the task to update'),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'stopped'])
    .optional()
    .describe('New status'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
    .optional()
    .describe('New priority'),
  title: z.string()
    .optional()
    .describe('New title'),
  description: z.string()
    .optional()
    .describe('New description'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  success: z.boolean(),
  taskId: z.string(),
  updatedFields: z.array(z.string()),
  message: z.string(),
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
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'stopped';
  updatedAt: string;
}

const taskStore = new Map<string, Task>();

// ==========================================
// 工具定义
// ==========================================

export const TaskUpdateToolProd = buildTool({
  name: TASK_UPDATE_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'update task properties',
  strict: true,
  maxResultSizeChars: 5000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return false;
  },

  isConcurrencySafe() {
    return true;
  },

  execute(input: Input): Output {
    const task = taskStore.get(input.taskId);
    
    if (!task) {
      return {
        success: false,
        taskId: input.taskId,
        updatedFields: [],
        message: `Task not found: ${input.taskId}`,
      };
    }

    const updatedFields: string[] = [];
    
    if (input.status !== undefined) {
      task.status = input.status;
      updatedFields.push('status');
    }
    
    if (input.priority !== undefined) {
      task.priority = input.priority;
      updatedFields.push('priority');
    }
    
    if (input.title !== undefined) {
      task.title = input.title;
      updatedFields.push('title');
    }
    
    if (input.description !== undefined) {
      task.description = input.description;
      updatedFields.push('description');
    }

    task.updatedAt = new Date().toISOString();
    taskStore.set(input.taskId, task);

    return {
      success: true,
      taskId: input.taskId,
      updatedFields,
      message: `Updated task ${input.taskId}: ${updatedFields.join(', ')}`,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    return `Updating task: ${input.taskId}`;
  },

  renderToolResultMessage(output: Output) {
    return output.message;
  },
});

// 导出任务管理函数
export function registerTask(task: Task): void {
  taskStore.set(task.id, task);
}

export function getTask(taskId: string): Task | undefined {
  return taskStore.get(taskId);
}

export default TaskUpdateToolProd;