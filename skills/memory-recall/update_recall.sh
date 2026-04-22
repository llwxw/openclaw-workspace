#!/bin/bash
# Memory Recall 更新脚本
# 每小时通过 cron 调用，保持 recall 最新

cd /home/ai/.openclaw/workspace/skills/memory-recall
node --input-type=module << 'EOF' 2>&1
import { generateRecallContext } from './recall.js';

// 生成24小时 recall
const recall = generateRecallContext(24);
console.log('[Recall] Updated:', new Date().toISOString());
console.log('[Recall] Tasks:', recall.split('\n').find(l => l.includes('统计')));
EOF
