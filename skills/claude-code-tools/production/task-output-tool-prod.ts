/**
 * Production-Grade Task Output Tool
 * 生产级任务输出工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 任务输出获取
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const TASK_OUTPUT_TOOL_NAME = 'task_output' as const;

const DESCRIPTION = `Get the output of a completed task.
Retrieves results, logs, and artifacts from task execution.`;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  taskId: z.string()
    .describe('ID of the task'),
  format: z.enum(['text', 'json', 'html'])
    .default('text')
    .describe('Output format'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  taskId: z.string(),
  output: z.string(),
  format: z.string(),
  size: z.number(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 任务输出存储
// ==========================================

interface TaskOutput {
  taskId: string;
  output: string;
  format: string;
  createdAt: string;
}

const outputStore = new Map<string, TaskOutput>();

// ==========================================
// 工具定义
// ==========================================

export const TaskOutputToolProd = buildTool({
  name: TASK_OUTPUT_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'get task output results',
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

  execute(input: Input): Output {
    const taskOutput = outputStore.get(input.taskId);
    
    if (!taskOutput) {
      return {
        taskId: input.taskId,
        output: `No output found for task: ${input.taskId}`,
        format: input.format,
        size: 0,
      };
    }

    let output = taskOutput.output;
    
    // 格式转换
    if (input.format === 'json' && taskOutput.format !== 'json') {
      try {
        output = JSON.stringify({ output: taskOutput.output }, null, 2);
      } catch {
        output = taskOutput.output;
      }
    }

    return {
      taskId: input.taskId,
      output,
      format: input.format,
      size: output.length,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    return `Getting output for task: ${input.taskId}`;
  },

  renderToolResultMessage(output: Output) {
    return `Task output: ${output.size} bytes (${output.format})`;
  },
});

export function saveTaskOutput(taskId: string, output: string, format: string = 'text'): void {
  outputStore.set(taskId, {
    taskId,
    output,
    format,
    createdAt: new Date().toISOString(),
  });
}

export default TaskOutputToolProd;