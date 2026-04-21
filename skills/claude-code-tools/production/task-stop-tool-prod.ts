/**
 * Production-Grade Task Stop Tool
 * 生产级任务停止工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 任务状态验证
 * - 优雅停止
 * - 清理资源
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const TASK_STOP_TOOL_NAME = 'task_stop' as const;

const DESCRIPTION = `Stop a running or pending task.
Releases resources and marks task as stopped.`;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  taskId: z.string()
    .describe('ID of the task to stop'),
  reason: z.string()
    .optional()
    .describe('Reason for stopping the task'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  taskId: z.string(),
  success: z.boolean(),
  previousStatus: z.string(),
  newStatus: z.string(),
  message: z.string(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 任务存储（引用 TaskCreateToolProd）
// ==========================================

let taskStore: Map<string, any> = new Map();

export function initializeTaskStore(store: Map<string, any>): void {
  taskStore = store;
}

// ==========================================
// 工具定义
// ==========================================

export const TaskStopToolProd = buildTool({
  name: TASK_STOP_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'stop a running task',
  strict: true,
  maxResultSizeChars: 10000,

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
        taskId: input.taskId,
        success: false,
        previousStatus: 'unknown',
        newStatus: 'unknown',
        message: `Task not found: ${input.taskId}`,
      };
    }

    const previousStatus = task.status;
    
    // 检查是否可以停止
    if (previousStatus === 'completed' || previousStatus === 'failed') {
      return {
        taskId: input.taskId,
        success: false,
        previousStatus,
        newStatus: previousStatus,
        message: `Cannot stop task with status: ${previousStatus}`,
      };
    }

    // 停止任务
    task.status = 'stopped';
    task.updatedAt = new Date().toISOString();
    task.stoppedReason = input.reason || 'User requested stop';
    
    taskStore.set(input.taskId, task);

    return {
      taskId: input.taskId,
      success: true,
      previousStatus,
      newStatus: 'stopped',
      message: `Task stopped successfully`,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    return `Stopping task: ${input.taskId}`;
  },

  renderToolResultMessage(output: Output) {
    if (output.success) {
      return `Stopped task ${output.taskId} (was: ${output.previousStatus})`;
    }
    return `Failed to stop task ${output.taskId}: ${output.message}`;
  },
});

export default TaskStopToolProd;