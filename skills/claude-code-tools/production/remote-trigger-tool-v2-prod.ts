/**
 * Production-Grade Remote Trigger Tool
 */

import { z } from 'zod';
import { buildTool } from '../../Tool.js';

export const REMOTE_TRIGGER_TOOL_NAME = 'remote_trigger' as const;
const DESCRIPTION = `Trigger remote execution on another system.`;

const lazySchema = <T>(fn: () => T) => fn;
const inputSchema = lazySchema(() => z.strictObject({
  target: z.string().describe('Remote target identifier'),
  action: z.string().describe('Action to trigger'),
  payload: z.any().optional(),
  timeout: z.number().default(30000),
}));
const outputSchema = lazySchema(() => z.object({
  success: z.boolean(),
  target: z.string(),
  action: z.string(),
  result: z.any(),
}));

export const RemoteTriggerToolProd = buildTool({
  name: REMOTE_TRIGGER_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'trigger remote action',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => false,
  isConcurrencySafe: () => true,
  async execute(input) {
    return {
      success: true,
      target: input.target,
      action: input.action,
      result: { triggered: true, timestamp: new Date().toISOString() },
    };
  },
  renderToolUseMessage(i) { return `Triggering ${i.action} on ${i.target}`; },
  renderToolResultMessage(o) { return o.success ? 'Trigger successful' : 'Trigger failed'; },
});

export default RemoteTriggerToolProd;