/**
 * Production-Grade Enter Plan Mode Tool
 * 生产级进入计划模式工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 状态保存
 * - 上下文管理
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const ENTER_PLAN_MODE_TOOL_NAME = 'enter_plan_mode' as const;

const DESCRIPTION = `Enter plan mode for batch operations.
Plan mode allows you to preview and approve multiple changes before execution.`;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  description: z.string()
    .describe('Description of the plan'),
  maxSteps: z.number()
    .optional()
    .describe('Maximum number of steps in the plan'),
  autoApprove: z.boolean()
    .default(false)
    .describe('Whether to auto-approve safe operations'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  success: z.boolean(),
  planId: z.string(),
  description: z.string(),
  maxSteps: z.number().optional(),
  enteredAt: z.string(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 计划模式状态
// ==========================================

interface PlanModeState {
  isActive: boolean;
  planId?: string;
  description?: string;
  maxSteps?: number;
  autoApprove?: boolean;
  startedAt?: string;
  steps: PlanStep[];
}

interface PlanStep {
  id: string;
  description: string;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  tool?: string;
  input?: any;
}

let planModeState: PlanModeState = {
  isActive: false,
  steps: [],
};

function generatePlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
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
  if (!input.description || !input.description.trim()) {
    return {
      result: false,
      message: 'Plan description is required',
      errorCode: 1,
    };
  }

  if (input.maxSteps !== undefined && input.maxSteps <= 0) {
    return {
      result: false,
      message: 'maxSteps must be a positive number',
      errorCode: 2,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const EnterPlanModeToolProd = buildTool({
  name: ENTER_PLAN_MODE_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'enter plan mode for batch operations',
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

  validateInput(input: Input): PermissionDecision {
    return validateInput(input);
  },

  execute(input: Input): Output {
    const planId = generatePlanId();
    const now = new Date().toISOString();

    // 设置计划模式状态
    planModeState = {
      isActive: true,
      planId,
      description: input.description,
      maxSteps: input.maxSteps,
      autoApprove: input.autoApprove,
      startedAt: now,
      steps: [],
    };

    return {
      success: true,
      planId,
      description: input.description,
      maxSteps: input.maxSteps,
      enteredAt: now,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const desc = input.description?.slice(0, 30) || '';
    return `Entering plan mode: "${desc}..."`;
  },

  renderToolResultMessage(output: Output) {
    return `Entered plan mode (${output.planId})`;
  },
});

// 导出状态管理函数
export function isInPlanMode(): boolean {
  return planModeState.isActive;
}

export function getPlanModeState(): PlanModeState {
  return { ...planModeState };
}

export function addPlanStep(step: Omit<PlanStep, 'id'>): string {
  const stepId = `step_${planModeState.steps.length + 1}`;
  planModeState.steps.push({
    ...step,
    id: stepId,
  });
  return stepId;
}

export function exitPlanMode(): void {
  planModeState = {
    isActive: false,
    steps: [],
  };
}

export default EnterPlanModeToolProd;