#!/bin/bash
# Memory Recall CLI
# 用法: node recall_cli.js [hours]
# 默认24小时

cd /home/ai/.openclaw/workspace/skills/memory-recall
node --input-type=module << 'EOF'
import { generateRecallContext, getRecallContext } from './recall.js';

const hours = parseInt(process.argv[2]) || 24;

console.log('=== Memory Recall ===');
console.log(generateRecallContext(hours));
EOF
