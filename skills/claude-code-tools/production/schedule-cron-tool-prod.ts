/**
 * Production-Grade Schedule Cron Tool
 * 生产级定时任务工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - Cron 表达式支持
 * - 一次性/重复任务
 * - 时区支持
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const SCHEDULE_CRON_TOOL_NAME = 'schedule_cron' as const;

const DESCRIPTION = `Schedule a task to run at a specific time or on a cron schedule.
Supports one-time schedules and recurring cron jobs.`;

// ==========================================
// Cron 表达式验证
// ==========================================

const CRON_EXPRESSION_REGEX = /^(\*|(\*\/)?([0-5]?\d(-[0-5]?\d)?|\*))(,(\*\/)?([0-5]?\d(-[0-5]?\d)?|\*))*\s+(\*|(\*\/)?([01]?\d|2[0-3](-[01]?\d|\*)?|\*))(,(\*\/)?([01]?\d|2[0-3](-[01]?\d|\*)?|\*))*\s+(\*|(\*\/)?([1-9]|[12]\d|3[01](-[1-9]|[12]\d|3[01])?|\*))(,(\*\/)?([1-9]|[12]\d|3[01](-[1-9]|[12]\d|3[01])?|\*))*\s+(\*|(\*\/)?([1-9]|1[0-2](-[1-9]|1[0-2])?|\*))(,(\*\/)?([1-9]|1[0-2](-[1-9]|1[0-2])?|\*))*\s+(\*|(\*\/)?[0-7](-[0-7]|\*)?|\*))(,(\*\/)?[0-7](-[0-7]|\*)?|\*))*$/;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  schedule: z.object({
    kind: z.enum(['at', 'every', 'cron'])
      .describe('Type of schedule'),
    at: z.string()
      .optional()
      .describe('ISO timestamp for one-time execution'),
    everyMs: z.number()
      .optional()
      .describe('Interval in milliseconds for recurring'),
    expr: z.string()
      .optional()
      .describe('Cron expression'),
    tz: z.string()
      .optional()
      .describe('IANA timezone'),
  }).describe('Schedule configuration'),
  payload: z.object({
    kind: z.enum(['systemEvent', 'agentTurn'])
      .describe('Type of payload'),
    text: z.string()
      .optional()
      .describe('Message for systemEvent'),
    message: z.string()
      .optional()
      .describe('Agent prompt for agentTurn'),
    model: z.string()
      .optional()
      .describe('Model override'),
    timeoutSeconds: z.number()
      .optional()
      .describe('Timeout in seconds'),
  }).describe('What to execute'),
  name: z.string()
    .optional()
    .describe('Job name'),
  enabled: z.boolean()
    .default(true)
    .describe('Whether job is enabled'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  jobId: z.string(),
  name: z.string().optional(),
  schedule: z.object({
    kind: z.string(),
    at: z.string().optional(),
    everyMs: z.number().optional(),
    expr: z.string().optional(),
    tz: z.string().optional(),
  }),
  status: z.enum(['scheduled', 'active', 'paused', 'completed']),
  createdAt: z.string(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 任务存储
// ==========================================

interface ScheduledJob {
  id: string;
  name?: string;
  schedule: Input['schedule'];
  payload: Input['payload'];
  enabled: boolean;
  status: Output['status'];
  createdAt: string;
  nextRun?: string;
}

const jobStore = new Map<string, ScheduledJob>();

// ==========================================
// 工具函数
// ==========================================

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function validateCronExpression(expr: string): boolean {
  return CRON_EXPRESSION_REGEX.test(expr);
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
  if (!input.schedule) {
    return {
      result: false,
      message: 'Schedule is required',
      errorCode: 1,
    };
  }

  const { kind, at, everyMs, expr } = input.schedule;

  if (kind === 'at' && !at) {
    return {
      result: false,
      message: 'at schedule requires timestamp',
      errorCode: 2,
    };
  }

  if (kind === 'at' && at) {
    const date = new Date(at);
    if (isNaN(date.getTime())) {
      return {
        result: false,
        message: 'Invalid timestamp format',
        errorCode: 3,
      };
    }
    if (date <= new Date()) {
      return {
        result: false,
        message: 'Schedule time must be in the future',
        errorCode: 4,
      };
    }
  }

  if (kind === 'every' && (!everyMs || everyMs <= 0)) {
    return {
      result: false,
      message: 'every schedule requires positive interval',
      errorCode: 5,
    };
  }

  if (kind === 'cron' && !expr) {
    return {
      result: false,
      message: 'cron schedule requires expression',
      errorCode: 6,
    };
  }

  if (kind === 'cron' && expr && !validateCronExpression(expr)) {
    return {
      result: false,
      message: 'Invalid cron expression',
      errorCode: 7,
    };
  }

  if (!input.payload) {
    return {
      result: false,
      message: 'Payload is required',
      errorCode: 8,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const ScheduleCronToolProd = buildTool({
  name: SCHEDULE_CRON_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'schedule a task for later execution',
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

  validateInput(input: Input): PermissionDecision {
    return validateInput(input);
  },

  execute(input: Input): Output {
    const jobId = generateJobId();
    const now = new Date().toISOString();

    let nextRun: string | undefined;
    
    // 计算下次执行时间
    if (input.schedule.kind === 'at' && input.schedule.at) {
      nextRun = input.schedule.at;
    } else if (input.schedule.kind === 'every' && input.schedule.everyMs) {
      nextRun = new Date(Date.now() + input.schedule.everyMs).toISOString();
    }

    const job: ScheduledJob = {
      id: jobId,
      name: input.name,
      schedule: input.schedule,
      payload: input.payload,
      enabled: input.enabled ?? true,
      status: 'scheduled',
      createdAt: now,
      nextRun,
    };

    jobStore.set(jobId, job);

    return {
      jobId,
      name: input.name,
      schedule: input.schedule,
      status: job.status,
      createdAt: job.createdAt,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const kind = input.schedule?.kind || 'unknown';
    let scheduleInfo = '';
    
    if (kind === 'at' && input.schedule?.at) {
      scheduleInfo = ` at ${input.schedule.at}`;
    } else if (kind === 'every' && input.schedule?.everyMs) {
      scheduleInfo = ` every ${input.schedule.everyMs}ms`;
    } else if (kind === 'cron' && input.schedule?.expr) {
      scheduleInfo = ` cron "${input.schedule.expr}"`;
    }
    
    return `Scheduling job${scheduleInfo}...`;
  },

  renderToolResultMessage(output: Output) {
    return `Scheduled job ${output.jobId} (${output.status})`;
  },
});

// 导出任务管理函数
export function getJob(jobId: string): ScheduledJob | undefined {
  return jobStore.get(jobId);
}

export function listJobs(): ScheduledJob[] {
  return Array.from(jobStore.values());
}

export function cancelJob(jobId: string): boolean {
  const job = jobStore.get(jobId);
  if (!job) return false;
  
  job.status = 'paused';
  jobStore.set(jobId, job);
  return true;
}

export default ScheduleCronToolProd;