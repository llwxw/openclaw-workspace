#!/bin/bash
# Wiki 自动触发机制
# 当满足条件时自动执行操作

ENTITIES="/home/ai/.openclaw/workspace/memory/entities"
LOG="/home/ai/.openclaw/workspace/memory/log.md"

# 触发条件配置
MAX_ORPHANS=3
MAX_DEAD=0

# 检查函数
check_health() {
    local orphans=0 dead=0
    
    for f in $ENTITIES/*.md; do
        fname=$(basename "$f" .md)
        [ $(grep -r "\[\[$fname\]\]" $ENTITIES/*.md 2>/dev/null | wc -l) -eq 0 ] && orphans=$((orphans+1))
    done
    
    for link in $(grep -roh '\[\[[a-z0-9-]*\]\]' $ENTITIES/*.md | sed 's/\[\[//;s/\]\]//g' | sort -u); do
        [ -f "$ENTITIES/${link}.md" ] || dead=$((dead+1))
    done
    
    echo "$orphans $dead"
}

# 执行检查
read orphans dead <<< $(check_health)

# 触发动作
if [ $orphans -gt $MAX_ORPHANS ] || [ $dead -gt $MAX_DEAD ]; then
    echo "[$(date)] 触发 Lint: orphans=$orphans dead=$dead"
    /home/ai/.openclaw/workspace/scripts/auto-lint.sh >> $LOG
else
    echo "[$(date)] 健康: orphans=$orphans dead=$dead"
fi
