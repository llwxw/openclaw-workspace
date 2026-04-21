/**
 * Production-Grade Team Create Tool
 * 生产级团队创建工具 - 完全复刻 Claude Code 标准
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

export const TEAM_CREATE_TOOL_NAME = 'team_create' as const;
const DESCRIPTION = `Create a new team for multi-agent collaboration.`;

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  name: z.string().describe('Team name'),
  description: z.string().optional(),
  agents: z.array(z.object({
    id: z.string(),
    role: z.string(),
  })).optional(),
}));

const outputSchema = lazySchema(() => z.object({
  teamId: z.string(),
  name: z.string(),
  createdAt: z.string(),
}));

interface Team {
  id: string;
  name: string;
  description?: string;
  agents: { id: string; role: string }[];
  createdAt: string;
}

const teams = new Map<string, Team>();

export const TeamCreateToolProd = buildTool({
  name: TEAM_CREATE_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'create a new team',
  strict: true,
  inputSchema,
  outputSchema,
  isReadOnly: () => false,
  isConcurrencySafe: () => true,
  execute(input): Output {
    const teamId = `team_${Date.now()}`;
    const team: Team = {
      id: teamId,
      name: input.name,
      description: input.description,
      agents: input.agents || [],
      createdAt: new Date().toISOString(),
    };
    teams.set(teamId, team);
    return { teamId, name: input.name, createdAt: team.createdAt };
  },
  renderToolUseMessage(i) { return `Creating team: ${i.name}`; },
  renderToolResultMessage(o) { return `Created team: ${o.name}`; },
});

export function getTeam(id: string) { return teams.get(id); }
export default TeamCreateToolProd;