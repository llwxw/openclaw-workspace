/**
 * Memory Context - 统一上下文注入
 * 
 * 组合所有记忆系统，在 AI bootstrap 时注入：
 * 1. Memory Recall - 最近任务
 * 2. Active Memory - 重要实体
 * 3. Self-Improving - 历史学习
 */

import { generateRecallContext } from '../memory-recall/recall.js';
import { generateActiveMemoryContext } from '../active-memory/active_memory.js';
import { generateSelfImproveContext } from '../self-improving/self_improve.js';
import { generateQMDContext } from '../qmd/query_memory.js';

/**
 * 生成完整上下文
 */
export function generateMemoryContext() {
  const recall = generateRecallContext(24);
  const active = generateActiveMemoryContext();
  const selfImprove = generateSelfImproveContext();
  
  let context = '';
  
  context += recall + '\n\n';
  
  if (active) {
    context += active + '\n\n';
  }
  
  if (selfImprove) {
    context += selfImprove + '\n\n';
  }
  
  context += '## QMD - 记忆搜索\n';
  context += '如需查询特定记忆，可使用 `memory-context search <关键词>`\n';
  
  return context;
}

/**
 * 获取各模块统计
 */
export function getMemoryStats() {
  try {
    const { getStats: getSIStats } = require('../self-improving/self_improve.js');
    const { getRecentTasks } = require('../memory-recall/recall.js');
    const { getActiveEntities } = require('../active-memory/active_memory.js');
    
    const tasks = getRecentTasks(24);
    const entities = getActiveEntities();
    const siStats = getSIStats();
    
    return {
      recall: { tasks24h: tasks.total, avgScore: tasks.avgScore },
      active: { entities: entities.length },
      selfImprove: siStats
    };
  } catch {
    return { recall: {}, active: {}, selfImprove: {} };
  }
}

export default { generateMemoryContext, getMemoryStats };
