/**
 * Production-Grade Tool Search Tool
 */

import { z } from 'zod';
import { buildTool } from '../../Tool.js';

export const TOOL_SEARCH_TOOL_NAME = 'tool_search' as const;
const DESCRIPTION = `Search for available tools by name or description.
Helps discover available Claude Code tools.`;

const lazySchema = <T>(fn: () => T) => fn;
const inputSchema = lazySchema(() => z.strictObject({
  query: z.string().describe('Search query'),
  category: z.string().optional().describe('Filter by category'),
}));
const outputSchema = lazySchema(() => z.object({
  query: z.string(),
  tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
    category: z.string().optional(),
  })),
  count: z.number(),
}));

// Available tools registry
const availableTools = [
  { name: 'file_read', description: 'Read file contents', category: 'filesystem' },
  { name: 'file_write', description: 'Write content to file', category: 'filesystem' },
  { name: 'bash', description: 'Execute bash commands', category: 'execution' },
  { name: 'grep', description: 'Search file contents', category: 'search' },
  { name: 'glob', description: 'Find files by pattern', category: 'search' },
];

export const ToolSearchToolProd = buildTool({
  name: TOOL_SEARCH_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'search for tools',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  execute(input) {
    let results = availableTools;
    
    if (input.query) {
      const q = input.query.toLowerCase();
      results = results.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }
    
    if (input.category) {
      results = results.filter(t => t.category === input.category);
    }
    
    return { query: input.query, tools: results, count: results.length };
  },
  renderToolUseMessage(i) { return `Searching tools: "${i.query}"`; },
  renderToolResultMessage(o) { return `Found ${o.count} tools`; },
});

export default ToolSearchToolProd;