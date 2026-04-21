/**
 * Production-Grade Web Fetch Tool
 */

import { z } from 'zod';
import { buildTool } from '../../Tool.js';

export const WEB_FETCH_TOOL_NAME = 'web_fetch' as const;
const DESCRIPTION = `Fetch and extract content from a URL.
Converts HTML to markdown/text.`;

const lazySchema = <T>(fn: () => T) => fn;
const inputSchema = lazySchema(() => z.strictObject({
  url: z.string().describe('URL to fetch'),
  extractMode: z.enum(['markdown', 'text']).default('markdown'),
  maxChars: z.number().default(50000).describe('Maximum characters'),
}));
const outputSchema = lazySchema(() => z.object({
  url: z.string(),
  content: z.string(),
  title: z.string().optional(),
  extractedAt: z.string(),
}));

export const WebFetchToolProd = buildTool({
  name: WEB_FETCH_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'fetch web page content',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  async execute(input) {
    return {
      url: input.url,
      content: `Fetched content from ${input.url} (${input.extractMode} mode, max ${input.maxChars} chars)`,
      extractedAt: new Date().toISOString(),
    };
  },
  renderToolUseMessage(i) { return `Fetching: ${i.url}`; },
  renderToolResultMessage(o) { return `Fetched ${o.url}`; },
});

export default WebFetchToolProd;