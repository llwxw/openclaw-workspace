/**
 * Self-Improving - 学习回路
 * 
 * 工作流程：
 * 1. 捕获错误 → 分类写入 .learnings/
 * 2. 生成错误提醒 → 注入 bootstrap
 * 3. AI 检查 → 下次避免
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const LEARNINGS_DIR = path.join(
  process.env.OPENCLAW_WORKSPACE_DIR ||
    path.join(os.homedir(), '.openclaw', 'workspace'),
  '.learnings'
);

const FILES = {
  ERRORS: 'ERRORS.md',
  CORRECTIONS: 'CORRECTIONS.md',
  LEARNINGS: 'LEARNINGS.md',
  PATTERNS: 'PATTERNS.md'
};

/**
 * 确保目录存在
 */
function ensureLearningsDir() {
  try {
    if (!fs.existsSync(LEARNINGS_DIR)) {
      fs.mkdirSync(LEARNINGS_DIR, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 追加到文件
 */
function appendToFile(filename, content) {
  if (!ensureLearningsDir()) return false;
  
  const filePath = path.join(LEARNINGS_DIR, filename);
  const timestamp = new Date().toISOString().split('T')[0];
  const entry = `\n## ${timestamp}\n${content}\n`;
  
  try {
    fs.appendFileSync(filePath, entry, 'utf8');
    return true;
  } catch {
    return false;
  }
}

/**
 * 记录错误
 */
export function recordError(error, context = '') {
  const entry = `### Error: ${error.message || String(error).slice(0, 100)}
- Type: ${error.type || 'unknown'}
- Context: ${context || 'N/A'}
- Stack: ${error.stack?.slice(0, 200) || 'N/A'}
`;
  return appendToFile(FILES.ERRORS, entry);
}

/**
 * 记录纠正
 */
export function recordCorrection(original, corrected, reason = '') {
  const entry = `### Correction
- Original: ${original.slice(0, 100)}
- Corrected: ${corrected.slice(0, 100)}
- Reason: ${reason || 'N/A'}
`;
  return appendToFile(FILES.CORRECTIONS, entry);
}

/**
 * 记录学习
 */
export function recordLearning(learning, tags = []) {
  const entry = `### Learning
${learning}
Tags: ${tags.join(', ') || 'general'}
`;
  return appendToFile(FILES.LEARNINGS, entry);
}

/**
 * 记录模式
 */
export function recordPattern(pattern, counter = '') {
  const entry = `### Pattern: ${pattern}
Counter: ${counter || 'N/A'}
`;
  return appendToFile(FILES.PATTERNS, entry);
}

/**
 * 获取所有学习
 */
export function getLearnings() {
  if (!fs.existsSync(LEARNINGS_DIR)) {
    return { errors: [], corrections: [], learnings: [], patterns: [] };
  }
  
  const readFile = (filename) => {
    try {
      const content = fs.readFileSync(path.join(LEARNINGS_DIR, filename), 'utf8');
      // 提取最近的10条
      const sections = content.split('## ').filter(s => s.trim());
      return sections.slice(-10).map(s => '## ' + s.trim());
    } catch {
      return [];
    }
  };
  
  return {
    errors: readFile(FILES.ERRORS),
    corrections: readFile(FILES.CORRECTIONS),
    learnings: readFile(FILES.LEARNINGS),
    patterns: readFile(FILES.PATTERNS)
  };
}

/**
 * 生成 Self-Improving 上下文（供注入）
 */
export function generateSelfImproveContext() {
  const learnings = getLearnings();
  
  let output = '## Self-Improving - 历史学习\n\n';
  
  // 最近的错误
  if (learnings.errors.length > 0) {
    output += '**最近错误（避免重复犯错）**:\n';
    for (const e of learnings.errors.slice(-3)) {
      const lines = e.split('\n');
      output += `- ${lines[0].replace('### Error:', '').trim()}\n`;
    }
    output += '\n';
  }
  
  // 最近的纠正
  if (learnings.corrections.length > 0) {
    output += '**最近纠正（记住正确的做法）**:\n';
    for (const c of learnings.corrections.slice(-3)) {
      const lines = c.split('\n');
      const corrected = lines.find(l => l.includes('Corrected:'));
      if (corrected) {
        output += `- ${corrected.replace('Corrected:', '').trim()}\n`;
      }
    }
    output += '\n';
  }
  
  // 最近的模式
  if (learnings.patterns.length > 0) {
    output += '**已知模式**:\n';
    for (const p of learnings.patterns.slice(-3)) {
      const lines = p.split('\n');
      output += `- ${lines[0].replace('### Pattern:', '').trim()}\n`;
    }
  }
  
  if (learnings.errors.length === 0 && learnings.corrections.length === 0 && learnings.patterns.length === 0) {
    return ''; // 没有学习记录
  }
  
  return output;
}

/**
 * 获取统计
 */
export function getStats() {
  const learnings = getLearnings();
  return {
    errors: learnings.errors.length,
    corrections: learnings.corrections.length,
    learnings: learnings.learnings.length,
    patterns: learnings.patterns.length
  };
}
