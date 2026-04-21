/**
 * Production-Grade Config Tool
 * 生产级配置工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 配置读取/写入
 * - 多层级配置
 * - 验证和默认值
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const CONFIG_TOOL_NAME = 'config' as const;

const DESCRIPTION = `Read or modify Claude Code configuration.
Access and update various settings and preferences.`;

const MAX_CONFIG_VALUE_LENGTH = 100000;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  operation: z.enum(['get', 'set', 'list', 'delete'])
    .describe('Configuration operation'),
  key: z.string()
    .describe('Configuration key (dot notation supported, e.g., "theme.color")'),
  value: z.any()
    .optional()
    .describe('Value to set (for set operation)'),
  scope: z.enum(['global', 'project', 'local'])
    .default('project')
    .describe('Configuration scope'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  operation: z.string(),
  key: z.string().optional(),
  value: z.any().optional(),
  scope: z.string(),
  success: z.boolean(),
  message: z.string().optional(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 配置存储
// ==========================================

interface ConfigStore {
  global: Record<string, any>;
  project: Record<string, any>;
  local: Record<string, any>;
}

const configStore: ConfigStore = {
  global: {
    'model': 'claude-sonnet-4-20250514',
    'maxTokens': 4096,
    'theme': 'dark',
  },
  project: {
    'autoSave': true,
    'enableTools': true,
  },
  local: {},
};

// ==========================================
// 工具函数
// ==========================================

function getNestedValue(obj: any, key: string): any {
  const keys = key.split('.');
  let current = obj;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  
  return current;
}

function setNestedValue(obj: any, key: string, value: any): void {
  const keys = key.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current) || typeof current[k] !== 'object') {
      current[k] = {};
    }
    current = current[k];
  }
  
  current[keys[keys.length - 1]] = value;
}

function deleteNestedValue(obj: any, key: string): boolean {
  const keys = key.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current) || typeof current[k] !== 'object') {
      return false;
    }
    current = current[k];
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  
  return false;
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
  if (!input.operation) {
    return {
      result: false,
      message: 'Operation is required',
      errorCode: 1,
    };
  }

  if (!input.key && input.operation !== 'list') {
    return {
      result: false,
      message: 'Key is required for get/set/delete operations',
      errorCode: 2,
    };
  }

  if (input.operation === 'set' && input.value === undefined) {
    return {
      result: false,
      message: 'Value is required for set operation',
      errorCode: 3,
    };
  }

  const valueStr = JSON.stringify(input.value);
  if (valueStr && valueStr.length > MAX_CONFIG_VALUE_LENGTH) {
    return {
      result: false,
      message: `Config value too large (max ${MAX_CONFIG_VALUE_LENGTH} chars)`,
      errorCode: 4,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const ConfigToolProd = buildTool({
  name: CONFIG_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'get or set configuration values',
  strict: true,
  maxResultSizeChars: 100000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    // false because set/delete operations modify state
    return false;
  },

  isConcurrencySafe() {
    return true;
  },

  validateInput(input: Input): PermissionDecision {
    return validateInput(input);
  },

  execute(input: Input): Output {
    const scope = input.scope || 'project';
    const targetStore = configStore[scope as keyof ConfigStore];

    switch (input.operation) {
      case 'get': {
        const value = getNestedValue(targetStore, input.key);
        if (value === undefined) {
          return {
            operation: input.operation,
            key: input.key,
            value: undefined,
            scope,
            success: false,
            message: `Config key not found: ${input.key}`,
          };
        }
        return {
          operation: input.operation,
          key: input.key,
          value,
          scope,
          success: true,
        };
      }

      case 'set': {
        setNestedValue(targetStore, input.key, input.value);
        return {
          operation: input.operation,
          key: input.key,
          value: input.value,
          scope,
          success: true,
          message: `Config set: ${input.key} = ${JSON.stringify(input.value)}`,
        };
      }

      case 'delete': {
        const deleted = deleteNestedValue(targetStore, input.key);
        return {
          operation: input.operation,
          key: input.key,
          scope,
          success: deleted,
          message: deleted 
            ? `Config deleted: ${input.key}`
            : `Config key not found: ${input.key}`,
        };
      }

      case 'list': {
        return {
          operation: input.operation,
          scope,
          success: true,
          value: { ...targetStore },
        };
      }

      default:
        return {
          operation: input.operation,
          scope,
          success: false,
          message: `Unknown operation: ${input.operation}`,
        };
    }
  },

  renderToolUseMessage(input: Partial<Input>) {
    const op = input.operation || 'unknown';
    const key = input.key ? ` ${input.key}` : '';
    return `Config ${op}${key}`;
  },

  renderToolResultMessage(output: Output) {
    if (output.success) {
      if (output.operation === 'list') {
        return `Config list (${output.scope}): ${JSON.stringify(output.value).slice(0, 50)}...`;
      }
      if (output.operation === 'get') {
        return `Config ${output.key} = ${JSON.stringify(output.value).slice(0, 50)}`;
      }
      return `Config ${output.operation} successful`;
    }
    return `Config ${output.operation} failed: ${output.message}`;
  },
});

// 导出配置存储用于访问
export function getConfigStore(): ConfigStore {
  return configStore;
}

export default ConfigToolProd;