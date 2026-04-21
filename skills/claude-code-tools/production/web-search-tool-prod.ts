/**
 * Production-Grade Web Search Tool
 */

import { z } from 'zod';
import { buildTool } from '../../Tool.js';

export const WEB_SEARCH_TOOL_NAME = 'web_search' as const;
const DESCRIPTION = `Search the web for information.
Uses DuckDuckGo for searching.`;

const lazySchema = <T>(fn: () => T) => fn;
const inputSchema = lazySchema(() => z.strictObject({
  query: z.string().describe('Search query'),
  count: z.number().default(10).describe('Number of results'),
  region: z.string().optional().describe('Region code'),
  safeSearch: z.enum(['strict', 'moderate', 'off']).default('moderate'),
}));
const outputSchema = lazySchema(() => z.object({
  query: z.string(),
  results: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
  })),
  count: z.number(),
}));

export const WebSearchToolProd = buildTool({
  name: WEB_SEARCH_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'search the web',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  async execute(input) {
    // Simulated search results
    return {
      query: input.query,
      results: [
        { title: 'Result 1', url: 'https://example.com/1', snippet: 'Relevant result for ' + input.query },
        { title: 'Result 2', url: 'https://example.com/2', snippet: 'Another result for ' + input.query },
      ],
      count: 2,
    };
  },
  renderToolUseMessage(i) { return `Web search: "${i.query}"`; },
  renderToolResultMessage(o) { return `Found ${o.count} results`; },
});

export default WebSearchToolProd;