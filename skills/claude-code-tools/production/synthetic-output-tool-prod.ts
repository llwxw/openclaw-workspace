/**
 * Production-Grade Synthetic Output Tool
 */

import { z } from 'zod';
import { buildTool } from '../../Tool.js';

export const SYNTHETIC_OUTPUT_TOOL_NAME = 'synthetic_output' as const;
const DESCRIPTION = `Generate synthetic output for testing.`;

const lazySchema = <T>(fn: () => T) => fn;
const inputSchema = lazySchema(() => z.strictObject({
  type: z.enum(['text', 'json', 'image']).default('text'),
  content: z.string().describe('Content to generate'),
  count: z.number().default(1).describe('Number of outputs'),
}));
const outputSchema = lazySchema(() => z.object({
  outputs: z.array(z.object({
    type: z.string(),
    content: z.string(),
  })),
}));

export const SyntheticOutputToolProd = buildTool({
  name: SYNTHETIC_OUTPUT_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'generate synthetic output',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  execute(input) {
    const outputs = [];
    for (let i = 0; i < input.count; i++) {
      outputs.push({ type: input.type, content: input.content });
    }
    return { outputs };
  },
  renderToolUseMessage(i) { return `Generating ${i.count} synthetic ${i.type} outputs`; },
  renderToolResultMessage(o) { return `Generated ${o.outputs.length} outputs`; },
});

export default SyntheticOutputToolProd;