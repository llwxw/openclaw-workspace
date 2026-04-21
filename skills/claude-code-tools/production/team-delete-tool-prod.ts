/**
 * Production-Grade Team Delete Tool
 */

import { z } from 'zod';
import { buildTool } from '../../Tool.js';

export const TEAM_DELETE_TOOL_NAME = 'team_delete' as const;
const DESCRIPTION = `Delete an existing team.`;

const lazySchema = <T>(fn: () => T) => fn;
const inputSchema = lazySchema(() => z.strictObject({
  teamId: z.string().describe('Team ID to delete'),
  force: z.boolean().default(false),
}));
const outputSchema = lazySchema(() => z.object({
  success: z.boolean(),
  teamId: z.string(),
  message: z.string(),
}));

const teams = new Map<string, any>();

export const TeamDeleteToolProd = buildTool({
  name: TEAM_DELETE_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'delete a team',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => false,
  isConcurrencySafe: () => true,
  execute(input) {
    if (!teams.has(input.teamId)) {
      return { success: false, teamId: input.teamId, message: 'Team not found' };
    }
    teams.delete(input.teamId);
    return { success: true, teamId: input.teamId, message: 'Team deleted' };
  },
  renderToolUseMessage(i) { return `Deleting team: ${i.teamId}`; },
  renderToolResultMessage(o) { return o.message; },
});

export default TeamDeleteToolProd;