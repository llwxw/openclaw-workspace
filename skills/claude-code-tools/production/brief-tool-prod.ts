/**
 * Production-Grade Brief Tool
 * 生产级消息工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 附件支持
 * - Markdown 格式
 * - 优先级状态
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const BRIEF_TOOL_NAME = 'brief' as const;

const DESCRIPTION = `Send a message to the user.
Supports markdown formatting and file attachments.`;

// 支持的图片扩展名
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];

// 最大附件数量
const MAX_ATTACHMENTS = 10;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  message: z.string()
    .describe('Message for the user. Supports markdown.'),
  attachments: z.array(z.string())
    .optional()
    .describe('File paths to attach'),
  status: z.enum(['normal', 'proactive'])
    .default('normal')
    .describe('Message priority status'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  message: z.string(),
  attachments: z.array(z.object({
    path: z.string(),
    size: z.number(),
    isImage: z.boolean(),
    file_uuid: z.string().optional(),
  })).optional(),
  sentAt: z.string(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 工具函数
// ==========================================

function isImageFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function generateFileUuid(): string {
  return `file_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function expandPath(p: string): string {
  if (p.startsWith('~')) {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home) return path.join(home, p.slice(1));
  }
  return path.resolve(p);
}

// ==========================================
// 权限验证
// ==========================================

interface PermissionDecision {
  result: boolean;
  message?: string;
  errorCode?: number;
}

async function validateInput(input: Input): Promise<PermissionDecision> {
  if (!input.message || !input.message.trim()) {
    return {
      result: false,
      message: 'Message cannot be empty',
      errorCode: 1,
    };
  }

  if (input.attachments && input.attachments.length > MAX_ATTACHMENTS) {
    return {
      result: false,
      message: `Too many attachments (max ${MAX_ATTACHMENTS})`,
      errorCode: 2,
    };
  }

  // 验证附件路径
  if (input.attachments) {
    for (const attachment of input.attachments) {
      const fullPath = expandPath(attachment);
      try {
        const stats = await fs.stat(fullPath);
        if (!stats.isFile()) {
          return {
            result: false,
            message: `Not a file: ${attachment}`,
            errorCode: 3,
          };
        }
      } catch {
        return {
          result: false,
          message: `File not found: ${attachment}`,
          errorCode: 4,
        };
      }
    }
  }

  return { result: true };
}

// ==========================================
// 消息日志
// ==========================================

interface SentBrief {
  message: string;
  attachments?: Output['attachments'];
  status: string;
  sentAt: string;
}

const messageLog: SentBrief[] = [];

// ==========================================
// 工具定义
// ==========================================

export const BriefToolProd = buildTool({
  name: BRIEF_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'send a message to the user',
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

  async validateInput(input: Input): Promise<PermissionDecision> {
    return await validateInput(input);
  },

  async execute(input: Input): Promise<Output> {
    const sentAt = new Date().toISOString();
    
    // 处理附件
    let attachments: Output['attachments'] = undefined;
    
    if (input.attachments && input.attachments.length > 0) {
      attachments = [];
      
      for (const attachment of input.attachments) {
        const fullPath = expandPath(attachment);
        try {
          const stats = await fs.stat(fullPath);
          attachments.push({
            path: fullPath,
            size: stats.size,
            isImage: isImageFile(fullPath),
            file_uuid: generateFileUuid(),
          });
        } catch {
          // 忽略无法访问的文件
        }
      }
    }

    // 记录消息
    const sentBrief: SentBrief = {
      message: input.message,
      attachments,
      status: input.status || 'normal',
      sentAt,
    };
    messageLog.push(sentBrief);

    return {
      message: input.message,
      attachments,
      sentAt,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    const status = input.status === 'proactive' ? '[proactive] ' : '';
    const message = input.message?.slice(0, 50) || '';
    return `${status}${message}...`;
  },

  renderToolResultMessage(output: Output) {
    const attachmentCount = output.attachments?.length || 0;
    if (attachmentCount > 0) {
      return `Sent message with ${attachmentCount} attachment(s)`;
    }
    return 'Sent message to user';
  },
});

// 导出消息日志
export function getMessageLog(): SentBrief[] {
  return [...messageLog];
}

export function clearMessageLog(): void {
  messageLog.length = 0;
}

export default BriefToolProd;