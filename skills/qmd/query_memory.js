/**
 * QMD - Query Memory Documents
 * 
 * 多维度记忆搜索
 * 
 * 功能：
 * 1. 按主题索引所有 memory 文档
 * 2. 按时间检索
 * 3. 按类型检索
 * 4. 关键词搜索
 */

import fs from 'fs';
import path from 'path';

const MEMORY_DIR = '/home/ai/.openclaw/workspace/memory';
const ENTITIES_DIR = path.join(MEMORY_DIR, 'entities');
const KNOWLEDGE_FILE = path.join(MEMORY_DIR, 'knowledge.md');
const PROJECTS_DIR = path.join(MEMORY_DIR, 'projects');

/**
 * 文档类型
 */
const DOC_TYPES = {
  entity: { dir: ENTITIES_DIR, ext: '.md', category: 'entity' },
  project: { dir: PROJECTS_DIR, ext: '.md', category: 'project' },
  knowledge: { file: KNOWLEDGE_FILE, category: 'knowledge' },
  ephemeral: { dir: path.join(MEMORY_DIR, 'ephemeral'), ext: '.jsonl', category: 'ephemeral' }
};

/**
 * 提取文档摘要
 */
function extractSummary(content, maxLen = 200) {
  const lines = content.split('\n').filter(l => l.trim());
  const summaryLines = [];
  let charCount = 0;
  
  for (const line of lines) {
    if (line.startsWith('#')) continue; // 跳过标题
    summaryLines.push(line.trim());
    charCount += line.length;
    if (charCount > maxLen) break;
  }
  
  return summaryLines.join(' ').slice(0, maxLen);
}

/**
 * 索引所有文档
 */
export function indexDocuments() {
  const index = [];
  
  // 索引 entities
  try {
    if (fs.existsSync(ENTITIES_DIR)) {
      const files = fs.readdirSync(ENTITIES_DIR).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const filePath = path.join(ENTITIES_DIR, file);
        const stat = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const title = file.replace('.md', '');
        
        index.push({
          type: 'entity',
          name: title,
          title: content.match(/^#\s+(.+)/m)?.[1] || title,
          summary: extractSummary(content),
          path: filePath,
          updated: stat.mtimeMs
        });
      }
    }
  } catch {}
  
  // 索引 knowledge
  try {
    if (fs.existsSync(KNOWLEDGE_FILE)) {
      const stat = fs.statSync(KNOWLEDGE_FILE);
      const content = fs.readFileSync(KNOWLEDGE_FILE, 'utf8');
      index.push({
        type: 'knowledge',
        name: 'knowledge',
        title: '固化知识',
        summary: extractSummary(content, 300),
        path: KNOWLEDGE_FILE,
        updated: stat.mtimeMs
      });
    }
  } catch {}
  
  // 索引 projects
  try {
    if (fs.existsSync(PROJECTS_DIR)) {
      const dirs = fs.readdirSync(PROJECTS_DIR).filter(f => {
        return fs.statSync(path.join(PROJECTS_DIR, f)).isDirectory();
      });
      for (const dir of dirs.slice(0, 10)) {
        const readme = path.join(PROJECTS_DIR, dir, 'README.md');
        if (fs.existsSync(readme)) {
          const stat = fs.statSync(readme);
          const content = fs.readFileSync(readme, 'utf8');
          index.push({
            type: 'project',
            name: dir,
            title: content.match(/^#\s+(.+)/m)?.[1] || dir,
            summary: extractSummary(content),
            path: readme,
            updated: stat.mtimeMs
          });
        }
      }
    }
  } catch {}
  
  return index;
}

/**
 * 搜索文档
 */
export function searchDocuments(query, options = {}) {
  const {
    type = null,      // 筛选类型
    limit = 10,        // 返回数量
    daysBack = null    // 时间范围（天）
  } = options;
  
  const index = indexDocuments();
  const queryLower = query.toLowerCase();
  
  // 过滤
  let results = index.filter(doc => {
    // 类型过滤
    if (type && doc.type !== type) return false;
    
    // 时间过滤
    if (daysBack) {
      const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
      if (doc.updated < cutoff) return false;
    }
    
    // 关键词匹配
    const searchable = `${doc.name} ${doc.title} ${doc.summary}`.toLowerCase();
    return searchable.includes(queryLower);
  });
  
  // 按更新时间排序
  results.sort((a, b) => b.updated - a.updated);
  
  return results.slice(0, limit);
}

/**
 * 生成 QMD 上下文
 */
export function generateQMDContext(query = '') {
  let output = '## QMD - 记忆搜索\n\n';
  
  if (query) {
    const results = searchDocuments(query, { limit: 5 });
    
    if (results.length > 0) {
      output += `**搜索 "${query}"**:\n`;
      for (const r of results) {
        const time = new Date(r.updated).toLocaleDateString('zh-CN');
        output += `- [${r.type}] ${r.title} (${time})\n  ${r.summary.slice(0, 100)}\n`;
      }
    } else {
      output += `**搜索 "${query}"**: 无结果\n`;
    }
  } else {
    // 返回最近的文档
    const index = indexDocuments().sort((a, b) => b.updated - a.updated);
    
    output += '**最近更新的记忆**:\n';
    for (const doc of index.slice(0, 5)) {
      const time = new Date(doc.updated).toLocaleDateString('zh-CN');
      output += `- [${doc.type}] ${doc.title} (${time})\n`;
    }
  }
  
  return output;
}

/**
 * CLI 搜索
 */
export function cliSearch(args) {
  const query = args.join(' ');
  const results = searchDocuments(query, { limit: 10 });
  
  if (results.length === 0) {
    console.log(`No results for: ${query}`);
    return;
  }
  
  console.log(`\n=== QMD Search: "${query}" ===\n`);
  for (const r of results) {
    const time = new Date(r.updated).toLocaleDateString('zh-CN');
    console.log(`[${r.type}] ${r.title} (${time})`);
    console.log(`  ${r.summary.slice(0, 100)}`);
    console.log(`  Path: ${r.path}\n`);
  }
}
