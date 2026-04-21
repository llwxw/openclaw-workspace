/**
 * Production-Grade Command System
 * 生产级命令系统 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑架构
 * - 7种命令来源优先级
 * - Memoize 缓存
 * - 安全过滤层级
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// ==========================================
// 类型定义
// ==========================================

export type CommandType = 'local' | 'prompt' | 'jsx';

export interface Command {
  readonly name: string;
  readonly description: string;
  readonly type: CommandType;
  readonly hidden: boolean;
  readonly userFacingName?: string;
  readonly inputSchema?: z.ZodType<any>;
  readonly availability?: {
    provider?: string;
    feature?: string;
  };

  isEnabled?(): boolean | Promise<boolean>;
  run?(context: CommandContext): Promise<CommandResult>;
  prompt?(context: CommandContext): Promise<PromptResult>;
  render?(context: CommandContext): React.ReactNode;
}

export interface CommandContext {
  args: string[];
  flags: Record<string, string | boolean>;
  cwd: string;
  env: Record<string, string>;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
}

export interface PromptResult {
  promptMessages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: Array<{ type: 'text'; text: string }>;
  }>;
}

// ==========================================
// 常量定义
// ==========================================

export const COMMAND_SOURCES = {
  WORKFLOW: 1,
  MCP: 2,
  BUILTIN: 3,
  SKILL: 4,
  PLUGIN: 5,
  CONFIG: 6,
  DYNAMIC: 7,
} as const;

// ==========================================
// Memoize 缓存实现
// ==========================================

const memoCache = new Map<string, { value: any; timestamp: number }>();
const DEFAULT_TTL_MS = 5000; // 5 seconds

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  ttlMs: number = DEFAULT_TTL_MS
): T {
  const memoizedFn = (...args: any[]) => {
    const key = JSON.stringify(args);
    const cached = memoCache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttlMs) {
      return cached.value;
    }

    const value = fn(...args);
    memoCache.set(key, { value, timestamp: now });
    return value;
  };

  return memoizedFn as T;
}

export function clearMemoCache(): void {
  memoCache.clear();
}

// ==========================================
// 命令注册中心
// ==========================================

class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private commandsBySource: Map<number, Command[]> = new Map();

  register(command: Command, source: number = COMMAND_SOURCES.BUILTIN): void {
    this.commands.set(command.name, command);
    
    if (!this.commandsBySource.has(source)) {
      this.commandsBySource.set(source, []);
    }
    this.commandsBySource.get(source)!.push(command);
  }

  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  getBySource(source: number): Command[] {
    return this.commandsBySource.get(source) || [];
  }

  // 按优先级获取所有命令
  getAllByPriority(): Command[] {
    const sources = Object.values(COMMAND_SOURCES).sort((a, b) => a - b);
    const result: Command[] = [];
    const seen = new Set<string>();

    for (const source of sources) {
      const commands = this.getBySource(source);
      for (const cmd of commands) {
        if (!seen.has(cmd.name)) {
          seen.add(cmd.name);
          result.push(cmd);
        }
      }
    }

    return result;
  }
}

export const commandRegistry = new CommandRegistry();

// ==========================================
// 安全过滤层级
// ==========================================

export interface FilterOptions {
  includeHidden?: boolean;
  checkEnabled?: boolean;
  checkAvailability?: boolean;
}

export async function filterCommands(
  commands: Command[],
  options: FilterOptions = {}
): Promise<Command[]> {
  const {
    includeHidden = false,
    checkEnabled = true,
    checkAvailability = true,
  } = options;

  let filtered = [...commands];

  // 1. 按可见性过滤
  if (!includeHidden) {
    filtered = filtered.filter(cmd => !cmd.hidden);
  }

  // 2. 按可用性检查
  if (checkAvailability) {
    filtered = filtered.filter(cmd => {
      if (!cmd.availability) return true;
      if (cmd.availability.feature) {
        // 这里检查特性标志
        return true;
      }
      return true;
    });
  }

  // 3. 按启用状态检查
  if (checkEnabled) {
    const enabledResults = await Promise.all(
      filtered.map(async cmd => {
        if (!cmd.isEnabled) return true;
        return await cmd.isEnabled();
      })
    );
    filtered = filtered.filter((_, i) => enabledResults[i]);
  }

  return filtered;
}

// ==========================================
// 命令执行器
// ==========================================

export class CommandExecutor {
  private registry: CommandRegistry;

  constructor(registry: CommandRegistry) {
    this.registry = registry;
  }

  async execute(
    commandName: string,
    context: CommandContext
  ): Promise<CommandResult> {
    const command = this.registry.get(commandName);
    if (!command) {
      return {
        success: false,
        message: `Command not found: ${commandName}`,
      };
    }

    // 安全检查
    const enabled = command.isEnabled ? await command.isEnabled() : true;
    if (!enabled) {
      return {
        success: false,
        message: `Command is disabled: ${commandName}`,
      };
    }

    // 执行
    if (command.type === 'local' && command.run) {
      return await command.run(context);
    }

    if (command.type === 'prompt' && command.prompt) {
      const result = await command.prompt(context);
      return {
        success: true,
        data: result,
      };
    }

    return {
      success: false,
      message: `Command ${commandName} cannot be executed directly`,
    };
  }

  parseArgs(input: string): { name: string; args: string[]; flags: Record<string, string | boolean> } {
    const parts = input.trim().split(/\s+/);
    const name = parts[0] || '';
    const args: string[] = [];
    const flags: Record<string, string | boolean> = {};

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('--')) {
        const equalsIndex = part.indexOf('=');
        if (equalsIndex > -1) {
          const key = part.slice(2, equalsIndex);
          const value = part.slice(equalsIndex + 1);
          flags[key] = value;
        } else {
          flags[part.slice(2)] = true;
        }
      } else if (part.startsWith('-')) {
        flags[part.slice(1)] = true;
      } else {
        args.push(part);
      }
    }

    return { name, args, flags };
  }
}

export const commandExecutor = new CommandExecutor(commandRegistry);

// ==========================================
// 获取命令（带 Memoize）
// ==========================================

export const getCommands = memoize(async (cwd: string): Promise<Command[]> => {
  const allCommands = commandRegistry.getAllByPriority();
  return await filterCommands(allCommands);
});

export const getCommandsByName = memoize(async (cwd: string): Promise<Map<string, Command>> => {
  const commands = await getCommands(cwd);
  return new Map(commands.map(cmd => [cmd.name, cmd]));
});

// ==========================================
// 内置命令示例
// ==========================================

export const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the screen',
  type: 'local',
  hidden: false,

  async run() {
    console.clear();
    return { success: true };
  },
};

export const helpCommand: Command = {
  name: 'help',
  description: 'Show help information',
  type: 'local',
  hidden: false,

  async run({ args }) {
    if (args.length > 0) {
      const cmd = commandRegistry.get(args[0]);
      if (cmd) {
        return {
          success: true,
          message: `${cmd.name}: ${cmd.description}`,
        };
      }
      return {
        success: false,
        message: `Command not found: ${args[0]}`,
      };
    }

    const commands = await getCommands(process.cwd());
    const helpText = commands
      .map(cmd => `  ${cmd.name.padEnd(15)} ${cmd.description}`)
      .join('\n');

    return {
      success: true,
      message: `Available commands:\n${helpText}`,
    };
  },
};

// 注册内置命令
commandRegistry.register(clearCommand, COMMAND_SOURCES.BUILTIN);
commandRegistry.register(helpCommand, COMMAND_SOURCES.BUILTIN);

export default {
  commandRegistry,
  commandExecutor,
  getCommands,
  filterCommands,
  memoize,
};
