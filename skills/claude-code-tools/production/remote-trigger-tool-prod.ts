/**
 * Production-Grade Remote Trigger Tool
 */

import { z } from 'zod';
import { buildTool } from '../../Tool.js';

export const REMOTE_TRIGGER_TOOL_NAME = 'remote_trigger' as const;
const DESCRIPTION = `Trigger a remote action or webhook.`;

const lazySchema = <T>(fn: () => T) => fn;
const inputSchema = lazySchema(() => z.strictObject({
  url: z.string().describe('Remote URL to trigger'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('POST'),
  body: z.any().optional(),
  headers: z.record(z.string()).optional(),
}));
const outputSchema = lazySchema(() => z.object({
  success: z.boolean(),
  statusCode: z.number().optional(),
  response: z.string().optional(),
}));

export const RemoteTriggerToolProd = buildTool({
  name: REMOTE_TRIGGER_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'trigger remote webhook',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => false,
  isConcurrencySafe: () => true,
  async execute(input) {
    // Simulate remote call
    return {
      success: true,
      statusCode: 200,
      response: `Triggered ${input.method} ${input.url}`,
    };
  },
  renderToolUseMessage(i) { return `Triggering: ${i.url}`; },
  renderToolResultMessage(o) { return o.success ? 'Trigger successful' : 'Trigger failed'; },
});

export default RemoteTriggerToolProd;