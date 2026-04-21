/**
 * Production-Grade Read MCP Resource Tool
 */

import { z } from 'zod';
import { buildTool } from '../../Tool.js';

export const READ_MCP_RESOURCE_TOOL_NAME = 'read_mcp_resource' as const;
const DESCRIPTION = `Read content from an MCP resource.`;

const lazySchema = <T>(fn: () => T) => fn;
const inputSchema = lazySchema(() => z.strictObject({
  uri: z.string().describe('MCP resource URI'),
}));
const outputSchema = lazySchema(() => z.object({
  uri: z.string(),
  content: z.string(),
  mimeType: z.string().optional(),
}));

const resources = new Map<string, { content: string; mimeType?: string }>();

export const ReadMcpResourceToolProd = buildTool({
  name: READ_MCP_RESOURCE_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'read MCP resource',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  execute(input) {
    const resource = resources.get(input.uri);
    if (!resource) {
      return { uri: input.uri, content: '', mimeType: undefined };
    }
    return { uri: input.uri, content: resource.content, mimeType: resource.mimeType };
  },
  renderToolUseMessage(i) { return `Reading MCP resource: ${i.uri}`; },
  renderToolResultMessage(o) { return `Read ${o.uri}: ${o.content.length} bytes`; },
});

export function registerMcpResource(uri: string, content: string, mimeType?: string) {
  resources.set(uri, { content, mimeType });
}

export default ReadMcpResourceToolProd;