/**
 * Production-Grade Task List Tool
 * 生产级任务列表工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 完整的状态过滤
 * - 阻塞任务追踪
 * - 所有者信息
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const TASK_LIST_TOOL_NAME = 'task_list' as const;

const DESCRIPTION = `List all tasks in the task list.
Shows task status, owners, and blocking relationships.`;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'all'])
    .default('all')
    .describe('Filter tasks by status'),
  owner: z.string()
    .optional()
    .describe('Filter tasks by owner'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  tasks: z.array(z.object({
    id: z.string(),
    subject: z.string(),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
    owner: z.string().optional(),
    blockedBy: z.array(z.string()),
  })),
  totalCount: z.number(),
  filteredCount: z.number(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 任务存储（使用 TaskCreateToolProd 的存储）
// ==========================================

// 引用 TaskCreateToolProd 的存储
let taskStore: Map<string, any> = new Map();

// 初始化存储（模拟从 TaskCreateToolProd 加载）
export function initializeTaskStore(store: Map<string, any>): void {
  taskStore = store;
}

// ==========================================
// 工具定义
// ==========================================

export const TaskListToolProd = buildTool({
  name: TASK_LIST_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'list all tasks',
  strict: true,
  maxResultSizeChars: 100000,
  shouldDefer: true,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return true;
  },

  isConcurrencySafe() {
    return true;
  },

  execute(input: Input): Output {
    const allTasks = Array.from(taskStore.values());
    
    // 过滤任务
    let filtered = allTasks;
    
    if (input.status && input.status !== 'all') {
      filtered = filtered.filter(t => t.status === input.status);
    }
    
    if (input.owner) {
      filtered = filtered.filter(t => t.owner === input.owner);
    }

    // 映射任务
    const tasks = filtered.map(task => ({
      id: task.id,
      subject: task.title,
      status: task.status as Output['tasks'][0]['status'],
      owner: task.owner,
      blockedBy: task.blockedBy || [],
    }));

    return {
      tasks,
      totalCount: allTasks.length,
      filteredCount: tasks.length,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const status = input.status || 'all';
    return `Listing tasks (status: ${status})`;
  },

  renderToolResultMessage(output: Output) {
    return `Found ${output.filteredCount} task(s) out of ${output.totalCount} total`;
  },
});

export default TaskListToolProd;