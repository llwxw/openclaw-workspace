/**
 * Production-Grade List MCP Resources Tool
 */

import { z } from 'zod';
import { buildTool } from '../../Tool.js';

export const LIST_MCP_RESOURCES_TOOL_NAME = 'list_mcp_resources' as const;
const DESCRIPTION = `List available MCP resources.`;

const lazySchema = <T>(fn: () => T) => fn;
const inputSchema = lazySchema(() => z.strictObject({
  filter: z.string().optional(),
}));
const outputSchema = lazySchema(() => z.object({
  resources: z.array(z.object({
    uri: z.string(),
    name: z.string(),
    mimeType: z.string().optional(),
  })),
  count: z.number(),
}));

const resources = [{ uri: 'mcp://example/resource1', name: 'Resource 1', mimeType: 'text/plain' }];

export const ListMcpResourcesToolProd = buildTool({
  name: LIST_MCP_RESOURCES_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'list MCP resources',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  execute(input) {
    let filtered = resources;
    if (input.filter) {
      filtered = resources.filter(r => r.name.includes(input.filter!) || r.uri.includes(input.filter!));
    }
    return { resources: filtered, count: filtered.length };
  },
  renderToolUseMessage() { return 'Listing MCP resources'; },
  renderToolResultMessage(o) { return `Found ${o.count} MCP resources`; },
});

export default ListMcpResourcesToolProd;