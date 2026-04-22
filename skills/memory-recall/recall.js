/**
 * Memory Recall - 主动回忆之前的学习
 * 
 * 工作流程：
 * 1. 读取 ephemeral 最近 N 小时的任务
 * 2. 读取 memory/entities/ 中的重要信息
 * 3. 生成"上下文注入"，供 AI 在对话前使用
 */

import fs from 'fs';
import path from 'path';

const EPHEMERAL_DIR = '/home/ai/.openclaw/workspace/memory/ephemeral';
const ENTITIES_DIR = '/home/ai/.openclaw/workspace/memory/entities';
const RECALL_FILE = '/home/ai/.openclaw/workspace/memory/recall/last_recall.md';

/**
 * 获取最近 N 小时的 ephemeral 任务摘要
 */
export function getRecentTasks(hours = 24) {
  try {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const files = fs.readdirSync(EPHEMERAL_DIR)
      .filter(f => f.endsWith('.jsonl'))
      .sort()
      .slice(-6); // 最近6个文件
    
    const tasks = [];
    const scoreStats = { sum: 0, count: 0, high: 0, spawn: 0 };
    const strategies = {};
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(EPHEMERAL_DIR, file), 'utf8');
      const lines = content.split('\n').filter(l => l.trim());
      
      for (const line of lines.slice(-100)) {
        try {
          const entry = JSON.parse(line);
          const ts = new Date(entry.timestamp).getTime();
          
          if (ts > cutoff && entry.score > 0) {
            tasks.push({
              ts: entry.timestamp,
              score: entry.score,
              strategy: entry.strategy,
              spawned: entry._spawned,
              preview: entry.preview?.slice(0, 80) || ''
            });
            
            scoreStats.sum += entry.score;
            scoreStats.count++;
            if (entry.score >= 60) scoreStats.high++;
            if (entry._spawned) scoreStats.spawn++;
            strategies[entry.strategy] = (strategies[entry.strategy] || 0) + 1;
          }
        } catch {}
      }
    }
    
    // 按时间排序，只取最近20条
    tasks.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    const recentTasks = tasks.slice(0, 20);
    
    return {
      total: tasks.length,
      avgScore: scoreStats.count > 0 ? Math.round(scoreStats.sum / scoreStats.count) : 0,
      highRisk: scoreStats.high,
      spawned: scoreStats.spawn,
      strategies,
      recentTasks
    };
  } catch (e) {
    return { total: 0, recentTasks: [] };
  }
}

/**
 * 获取 entities 中的重要信息
 */
export function getImportantEntities() {
  try {
    const entities = [];
    const files = fs.readdirSync(ENTITIES_DIR).filter(f => f.endsWith('.md'));
    
    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(path.join(ENTITIES_DIR, file), 'utf8');
      const name = file.replace('.md', '');
      
      // 提取前3行作为摘要
      const lines = content.split('\n').filter(l => l.trim()).slice(0, 3);
      const summary = lines.join(' ').slice(0, 200);
      
      if (summary) {
        entities.push({ name, summary });
      }
    }
    
    return entities;
  } catch (e) {
    return [];
  }
}

/**
 * 生成 recall 上下文（供注入到 AI）
 */
export function generateRecallContext(hours = 24) {
  const tasks = getRecentTasks(hours);
  const entities = getImportantEntities();
  
  let output = `## 最近 ${hours} 小时记忆\n\n`;
  
  if (tasks.total === 0) {
    output += '无任务记录。\n';
  } else {
    output += `**统计**: ${tasks.total} 个任务, 平均评分 ${tasks.avgScore}, 高风险 ${tasks.highRisk} 个\n\n`;
    
    if (tasks.recentTasks.length > 0) {
      output += '**最近任务**:\n';
      for (const t of tasks.recentTasks.slice(0, 5)) {
        const time = new Date(t.ts).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const risk = t.score >= 60 ? '🔴' : t.score >= 40 ? '⚠️' : '✅';
        const spawned = t.spawned ? '🤖' : '💬';
        output += `- ${time} ${risk} ${spawned} [${t.strategy}] ${t.preview}\n`;
      }
    }
  }
  
  if (entities.length > 0) {
    output += '\n**重要实体**:\n';
    for (const e of entities.slice(0, 5)) {
      output += `- ${e.name}: ${e.summary}\n`;
    }
  }
  
  // 保存到 recall 文件
  try {
    const recallDir = path.dirname(RECALL_FILE);
    if (!fs.existsSync(recallDir)) {
      fs.mkdirSync(recallDir, { recursive: true });
    }
    fs.writeFileSync(RECALL_FILE, output, 'utf8');
  } catch (e) {}
  
  return output;
}

/**
 * 获取 recall 上下文（从文件读取）
 */
export function getRecallContext() {
  try {
    if (fs.existsSync(RECALL_FILE)) {
      const stat = fs.statSync(RECALL_FILE);
      const age = Date.now() - stat.mtimeMs;
      
      // 如果超过1小时，重新生成
      if (age > 60 * 60 * 1000) {
        return generateRecallContext(24);
      }
      
      return fs.readFileSync(RECALL_FILE, 'utf8');
    }
    return generateRecallContext(24);
  } catch (e) {
    return '';
  }
}
