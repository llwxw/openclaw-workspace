/**
 * Claude Code 工具构建示例
 * 演示如何使用 buildTool() 创建高质量工具
 */

import { z } from 'zod';
import { buildTool, type Tool } from './Tool.js';

// ==========================================
// 示例1: 简单的文件读取工具
// ==========================================

const ReadFileInput = z.object({
  path: z.string().describe('Path to the file to read'),
  limit: z.number().optional().describe('Maximum number of lines to read'),
  offset: z.number().optional().describe('Line number to start reading from (1-indexed)'),
});

type ReadFileInput = z.infer<typeof ReadFileInput>;

const ReadFileOutput = z.object({
  content: z.string(),
  lineCount: z.number(),
  truncated: z.boolean(),
});

type ReadFileOutput = z.infer<typeof ReadFileOutput>;

export const readFileTool = buildTool({
  name: 'read_file',
  description: 'Read the contents of a text file',
  inputSchema: ReadFileInput,
  outputSchema: ReadFileOutput,
  
  async execute(input: ReadFileInput): Promise<ReadFileOutput> {
    // 实际实现会使用 fs 模块
    const fs = await import('fs/promises');
    const content = await fs.readFile(input.path, 'utf-8');
    
    let lines = content.split('\n');
    const truncated = input.limit && lines.length > input.limit;
    
    if (input.offset) {
      lines = lines.slice(input.offset - 1);
    }
    if (input.limit) {
      lines = lines.slice(0, input.limit);
    }
    
    return {
      content: lines.join('\n'),
      lineCount: lines.length,
      truncated,
    };
  },
  
  // 可选：自定义渲染
  renderToolUseMessage(input: Partial<ReadFileInput>) {
    return (
      <div>
        <strong>Reading file:</strong> {input.path}
        {input.limit && <span> (first {input.limit} lines)</span>}
      </div>
    );
  },
});

// ==========================================
// 示例2: 带权限检查的工具
// ==========================================

const DeleteFileInput = z.object({
  path: z.string().describe('Path to the file to delete'),
  confirm: z.boolean().default(false).describe('Confirm deletion'),
});

type DeleteFileInput = z.infer<typeof DeleteFileInput>;

export const deleteFileTool = buildTool({
  name: 'delete_file',
  description: 'Delete a file (requires confirmation)',
  inputSchema: DeleteFileInput,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  
  canUse: async () => {
    // 权限检查逻辑
    const { isAdmin } = await import('./auth.js');
    return isAdmin();
  },
  
  async execute(input: DeleteFileInput) {
    if (!input.confirm) {
      return {
        success: false,
        message: 'Deletion not confirmed. Set confirm=true to proceed.',
      };
    }
    
    const fs = await import('fs/promises');
    await fs.unlink(input.path);
    
    return {
      success: true,
      message: `Successfully deleted ${input.path}`,
    };
  },
  
  isReadOnly: false, // 这是一个修改操作
});

// ==========================================
// 示例3: 带进度报告的工具
// ==========================================

const BatchProcessInput = z.object({
  files: z.array(z.string()).describe('List of files to process'),
  operation: z.enum(['analyze', 'transform', 'backup']).describe('Operation to perform'),
});

type BatchProcessInput = z.infer<typeof BatchProcessInput>;

export const batchProcessTool = buildTool({
  name: 'batch_process',
  description: 'Process multiple files in batch',
  inputSchema: BatchProcessInput,
  outputSchema: z.object({
    processed: z.number(),
    failed: z.number(),
    results: z.array(z.object({
      file: z.string(),
      status: z.enum(['success', 'failed']),
      output: z.string().optional(),
    })),
  }),
  
  async execute(input: BatchProcessInput, { onProgress }) {
    const results = [];
    let processed = 0;
    let failed = 0;
    
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      
      // 报告进度
      onProgress?.({
        type: 'tool_progress',
        percent: Math.round((i / input.files.length) * 100),
        message: `Processing ${file}...`,
      });
      
      try {
        // 模拟处理
        await new Promise(r => setTimeout(r, 100));
        results.push({ file, status: 'success', output: 'OK' });
        processed++;
      } catch (error) {
        results.push({ file, status: 'failed', output: String(error) });
        failed++;
      }
    }
    
    return { processed, failed, results };
  },
});

// ==========================================
// 工具注册
// ==========================================

export const ALL_TOOLS: Tool[] = [
  readFileTool,
  deleteFileTool,
  batchProcessTool,
];

export function getTools(): Tool[] {
  return ALL_TOOLS.filter(tool => !tool.isEnabled || tool.isEnabled());
}
