/**
 * Active Memory - 重要实体自动注入
 * 
 * 工作流程：
 * 1. 读取 memory/entities/ 中所有页面
 * 2. 筛选"重要"实体（有标记或更新时间近）
 * 3. 生成注入上下文
 */

import fs from 'fs';
import path from 'path';

const ENTITIES_DIR = '/home/ai/.openclaw/workspace/memory/entities';
const PREFERENCES_FILE = '/home/ai/.openclaw/workspace/memory/preferences.md';
const PROJECTS_DIR = '/home/ai/.openclaw/workspace/memory/projects';

/**
 * 获取重要实体
 */
export function getActiveEntities() {
  try {
    const files = fs.readdirSync(ENTITIES_DIR).filter(f => f.endsWith('.md'));
    const entities = [];
    
    for (const file of files) {
      const filePath = path.join(ENTITIES_DIR, file);
      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const name = file.replace('.md', '');
      
      // 提取标题和前两行
      const lines = content.split('\n').filter(l => l.trim());
      let title = name;
      let summary = '';
      
      for (const line of lines) {
        if (line.startsWith('#')) {
          title = line.replace(/^#+\s*/, '').trim();
        } else if (line.startsWith('>') || line.startsWith('-') || line.startsWith('*')) {
          summary = line.replace(/^[-*>]\s*/, '').trim().slice(0, 150);
          break;
        }
      }
      
      if (!summary && lines.length > 1) {
        summary = lines.slice(1, 3).join(' ').slice(0, 150);
      }
      
      // 计算重要性分数
      let importance = 0;
      
      // 核心实体分数更高
      const coreEntities = ['user', 'preferences', 'model', 'openclaw', 'memory', 'skills', 'config'];
      if (coreEntities.includes(name.toLowerCase())) importance += 10;
      
      // 更新时间近的更重要
      const daysSinceUpdate = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 7) importance += 5;
      else if (daysSinceUpdate < 30) importance += 2;
      
      // 有描述的更重要
      if (summary.length > 50) importance += 3;
      
      entities.push({
        name,
        title,
        summary,
        importance,
        lastUpdate: stat.mtimeMs
      });
    }
    
    // 按重要性排序，取前10
    entities.sort((a, b) => b.importance - a.importance);
    return entities.slice(0, 10);
    
  } catch (e) {
    return [];
  }
}

/**
 * 获取用户偏好
 */
export function getUserPreferences() {
  try {
    if (fs.existsSync(PREFERENCES_FILE)) {
      const content = fs.readFileSync(PREFERENCES_FILE, 'utf8');
      return content.slice(0, 500);
    }
    return '';
  } catch (e) {
    return '';
  }
}

/**
 * 生成 Active Memory 上下文
 */
export function generateActiveMemoryContext() {
  const entities = getActiveEntities();
  const preferences = getUserPreferences();
  
  let output = '## Active Memory - 重要实体\n\n';
  
  if (entities.length > 0) {
    output += '**重要实体（按重要性排序）**:\n';
    for (const e of entities) {
      output += `- **${e.title}**: ${e.summary}\n`;
    }
  }
  
  if (preferences) {
    output += '\n**用户偏好**:\n' + preferences.slice(0, 300) + '\n';
  }
  
  return output;
}
