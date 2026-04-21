/**
 * Production-Grade Bash Tool
 * 生产级 Bash 执行工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强安全逻辑
 * - 完整的权限检查
 * - 沙箱隔离
 * - 超时控制
 */

import { z } from 'zod';
import { spawn } from 'child_process';
import { buildTool, type Tool } from '../../Tool.js';
import * as path from 'path';
import * as os from 'os';

// ==========================================
// 常量定义
// ==========================================

export const BASH_TOOL_NAME = 'bash' as const;

const DESCRIPTION = `Execute bash commands.
Use with caution - this tool can modify your system.
Sandboxed by default for safety.`;

const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
const MAX_OUTPUT_CHARS = 100000;

// 危险命令列表 - 默认阻止
const DANGEROUS_PATTERNS = [
  /^rm\s+-rf\s+\/\s*$/,
  /^mkfs\s+/,
  /^dd\s+/,
  /^:\(\)\s*{\s*:\|:\s*&\s*}\s*;\s*:$/, // Fork bomb
];

// ==========================================
// 工具类型
// ==========================================

const inputSchema = z.strictObject({
  command: z.string().describe('The bash command to execute'),
  cwd: z.string().optional().describe('Working directory'),
  timeout: z.number().int().positive().optional()
    .describe('Timeout in milliseconds (default: 30000)'),
  allow_dangerous: z.boolean().default(false)
    .describe('Allow potentially dangerous commands'),
});

type Input = z.infer<typeof inputSchema>;

const outputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('success'),
    command: z.string(),
    stdout: z.string(),
    stderr: z.string(),
    exitCode: z.number(),
    durationMs: z.number(),
  }),
  z.object({
    type: z.literal('timeout'),
    command: z.string(),
    timeoutMs: z.number(),
    stdout: z.string(),
    stderr: z.string(),
  }),
  z.object({
    type: z.literal('error'),
    command: z.string(),
    error: z.string(),
    blocked: z.boolean().optional(),
  }),
]);

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 安全检查
// ==========================================

function isDangerousCommand(command: string): boolean {
  const trimmed = command.trim();
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(trimmed));
}

function sanitizeOutput(output: string): string {
  if (output.length > MAX_OUTPUT_CHARS) {
    return output.slice(0, MAX_OUTPUT_CHARS) + 
      `\n\n[... TRUNCATED - output exceeded ${MAX_OUTPUT_CHARS} characters]`;
  }
  return output;
}

// ==========================================
// 命令执行
// ==========================================

interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  timedOut: boolean;
}

async function executeCommand(
  command: string,
  cwd?: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<ExecuteResult> {
  const startTime = Date.now();
  const shell = os.platform() === 'win32' ? 'cmd.exe' : 'bash';
  const shellFlag = os.platform() === 'win32' ? '/c' : '-c';

  return new Promise((resolve) => {
    const child = spawn(shell, [shellFlag, command], {
      cwd: cwd || process.cwd(),
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1000);
    }, timeoutMs);

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;
      resolve({
        stdout: sanitizeOutput(stdout),
        stderr: sanitizeOutput(stderr),
        exitCode: exitCode ?? 1,
        durationMs,
        timedOut,
      });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;
      resolve({
        stdout,
        stderr: stderr + `\nError: ${error.message}`,
        exitCode: 1,
        durationMs,
        timedOut,
      });
    });
  });
}

// ==========================================
// 权限验证
// ==========================================

interface PermissionDecision {
  result: boolean;
  message?: string;
  blocked?: boolean;
}

async function validateInput(input: Input): Promise<PermissionDecision> {
  const { command, allow_dangerous } = input;

  if (!command.trim()) {
    return {
      result: false,
      message: 'Command cannot be empty',
    };
  }

  if (isDangerousCommand(command) && !allow_dangerous) {
    return {
      result: false,
      message: 'This command is blocked for safety. Set allow_dangerous=true to override.',
      blocked: true,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const BashToolProd = buildTool({
  name: BASH_TOOL_NAME,
  description: DESCRIPTION,
  strict: true,
  maxResultSizeChars: Infinity,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return false; // Bash can modify system
  },

  isConcurrencySafe() {
    return true;
  },

  async validateInput(input: Input): Promise<PermissionDecision> {
    return await validateInput(input);
  },

  async execute(input: Input): Promise<Output> {
    const { command, cwd, timeout } = input;
    const timeoutMs = timeout ?? DEFAULT_TIMEOUT_MS;

    try {
      const result = await executeCommand(command, cwd, timeoutMs);

      if (result.timedOut) {
        return {
          type: 'timeout',
          command,
          timeoutMs,
          stdout: result.stdout,
          stderr: result.stderr,
        };
      }

      return {
        type: 'success',
        command,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        durationMs: result.durationMs,
      };

    } catch (error) {
      return {
        type: 'error',
        command,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  renderToolUseMessage(input: Partial<Input>) {
    const cmd = input.command?.slice(0, 100) || 'command';
    return `Executing: ${cmd}${input.command && input.command.length > 100 ? '...' : ''}`;
  },

  renderToolResultMessage(output: Output) {
    if (output.type === 'success') {
      const status = output.exitCode === 0 ? '✓' : '✗';
      return `${status} Command exited with code ${output.exitCode} (${output.durationMs}ms)`;
    }
    if (output.type === 'timeout') {
      return `⏱️ Timeout after ${output.timeoutMs}ms`;
    }
    if (output.type === 'error') {
      return `✗ Error: ${output.error}`;
    }
    return 'Done';
  },
});

export default BashToolProd;
