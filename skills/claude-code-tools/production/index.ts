/**
 * Claude Code Production Tools
 * 生产级工具集合 - 完整复刻 Claude Code 标准
 * 
 * 使用方式：
 *   import { FileReadToolProd, BashToolProd, FileWriteToolProd, GlobToolProd, GrepToolProd, FileEditToolProd, AskUserQuestionToolProd, TodoWriteToolProd, TaskCreateToolProd, TaskListToolProd, TaskStopToolProd, SleepToolProd, SendMessageToolProd, ScheduleCronToolProd, ConfigToolProd, ExitPlanModeToolProd, EnterPlanModeToolProd, ExitWorktreeToolProd, BriefToolProd, REPLToolProd, PowerShellToolProd } from './production';
 */

export { FileReadToolProd, default as FileReadTool } from './file-read-tool-prod';
export { BashToolProd, default as BashTool } from './bash-tool-prod';
export { FileWriteToolProd, default as FileWriteTool } from './file-write-tool-prod';
export { GlobToolProd, default as GlobTool } from './glob-tool-prod';
export { GrepToolProd, default as GrepTool } from './grep-tool-prod';
export { FileEditToolProd, default as FileEditTool } from './file-edit-tool-prod';
export { AskUserQuestionToolProd, default as AskUserQuestionTool, setMockUserInput } from './ask-user-question-tool-prod';
export { TodoWriteToolProd, default as TodoWriteTool } from './todo-write-tool-prod';
export { TaskCreateToolProd, default as TaskCreateTool } from './task-create-tool-prod';
export { TaskListToolProd, default as TaskListTool } from './task-list-tool-prod';
export { TaskStopToolProd, default as TaskStopTool } from './task-stop-tool-prod';
export { SleepToolProd, default as SleepTool } from './sleep-tool-prod';
export { SendMessageToolProd, default as SendMessageTool, getMessageLog, clearMessageLog } from './send-message-tool-prod';
export { ScheduleCronToolProd, default as ScheduleCronTool, getJob, listJobs, cancelJob } from './schedule-cron-tool-prod';
export { ConfigToolProd, default as ConfigTool, getConfigStore } from './config-tool-prod';
export { ExitPlanModeToolProd, default as ExitPlanModeTool, enterPlanMode, isInPlanMode, getPlanModeState } from './exit-plan-mode-tool-prod';
export { EnterPlanModeToolProd, default as EnterPlanModeTool, isInPlanMode as isInPlanMode2, getPlanModeState as getPlanModeState2, addPlanStep, exitPlanMode } from './enter-plan-mode-tool-prod';
export { ExitWorktreeToolProd, default as ExitWorktreeTool, createWorktree, getActiveWorktrees } from './exit-worktree-tool-prod';
export { BriefToolProd, default as BriefTool, getMessageLog as getBriefLog, clearMessageLog as clearBriefLog } from './brief-tool-prod';
export { REPLToolProd, default as REPLTool, getREPLSessions } from './repl-tool-prod';
export { PowerShellToolProd, default as PowerShellTool } from './powershell-tool-prod';
export { EnterWorktreeToolProd, default as EnterWorktreeTool, getActiveWorktrees as getWorktrees } from './enter-worktree-tool-prod';

import type { Tool } from '../../Tool';
import FileReadToolProd from './file-read-tool-prod';
import BashToolProd from './bash-tool-prod';
import FileWriteToolProd from './file-write-tool-prod';
import GlobToolProd from './glob-tool-prod';
import GrepToolProd from './grep-tool-prod';
import FileEditToolProd from './file-edit-tool-prod';
import AskUserQuestionToolProd from './ask-user-question-tool-prod';
import TodoWriteToolProd from './todo-write-tool-prod';
import TaskCreateToolProd from './task-create-tool-prod';
import TaskListToolProd from './task-list-tool-prod';
import TaskStopToolProd from './task-stop-tool-prod';
import SleepToolProd from './sleep-tool-prod';
import SendMessageToolProd from './send-message-tool-prod';
import ScheduleCronToolProd from './schedule-cron-tool-prod';
import ConfigToolProd from './config-tool-prod';
import ExitPlanModeToolProd from './exit-plan-mode-tool-prod';
import EnterPlanModeToolProd from './enter-plan-mode-tool-prod';
import ExitWorktreeToolProd from './exit-worktree-tool-prod';
import BriefToolProd from './brief-tool-prod';
import REPLToolProd from './repl-tool-prod';
import PowerShellToolProd from './powershell-tool-prod';
import EnterWorktreeToolProd from './enter-worktree-tool-prod';

/**
 * 所有生产级工具列表（21个）
 */
export const ALL_PRODUCTION_TOOLS: Tool[] = [
  FileReadToolProd,
  BashToolProd,
  FileWriteToolProd,
  GlobToolProd,
  GrepToolProd,
  FileEditToolProd,
  AskUserQuestionToolProd,
  TodoWriteToolProd,
  TaskCreateToolProd,
  TaskListToolProd,
  TaskStopToolProd,
  SleepToolProd,
  SendMessageToolProd,
  ScheduleCronToolProd,
  ConfigToolProd,
  ExitPlanModeToolProd,
  EnterPlanModeToolProd,
  ExitWorktreeToolProd,
  BriefToolProd,
  REPLToolProd,
  PowerShellToolProd,
  EnterWorktreeToolProd,
];

/**
 * 获取所有生产级工具（过滤掉禁用的）
 */
export async function getProductionTools(): Promise<Tool[]> {
  const enabledResults = await Promise.all(
    ALL_PRODUCTION_TOOLS.map(async tool => {
      if (!tool.isEnabled) return true;
      return await tool.isEnabled();
    })
  );
  return ALL_PRODUCTION_TOOLS.filter((_, i) => enabledResults[i]);
}

/**
 * 按名称获取工具
 */
export function getToolByName(name: string): Tool | undefined {
  return ALL_PRODUCTION_TOOLS.find(tool => tool.name === name);
}

export default {
  FileReadToolProd,
  BashToolProd,
  FileWriteToolProd,
  GlobToolProd,
  GrepToolProd,
  FileEditToolProd,
  AskUserQuestionToolProd,
  TodoWriteToolProd,
  TaskCreateToolProd,
  TaskListToolProd,
  TaskStopToolProd,
  SleepToolProd,
  SendMessageToolProd,
  ScheduleCronToolProd,
  ConfigToolProd,
  ExitPlanModeToolProd,
  EnterPlanModeToolProd,
  ExitWorktreeToolProd,
  BriefToolProd,
  REPLToolProd,
  PowerShellToolProd,
  ALL_PRODUCTION_TOOLS,
  getProductionTools,
  getToolByName,
};