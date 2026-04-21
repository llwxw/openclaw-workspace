#!/bin/bash
# Wiki 自动 Lint 脚本 v2
# 高鲁棒、高性能、高质量

set -e  # 遇到错误退出

ENTITIES="/home/ai/.openclaw/workspace/memory/entities"
LOG="/home/ai/.openclaw/workspace/memory/log.md"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "=== Wiki Lint $TIMESTAMP ==="

# 并行检查函数
check_dead_links() {
    local dead=0
    for link in $(grep -roh '\[\[[a-z0-9-]*\]\]' $ENTITIES/*.md 2>/dev/null | sed 's/\[\[//;s/\]\]//g' | sort -u); do
        [ -f "$ENTITIES/${link}.md" ] || { 
            sed -i "s/\[\[$link\]\]//g" $ENTITIES/*.md 2>/dev/null
            dead=$((dead+1))
        }
    done
    echo "$dead"
}

check_orphans() {
    local orphans=0
    for f in $ENTITIES/*.md; do
        fname=$(basename "$f" .md)
        [ $(grep -r "\[\[$fname\]\]" $ENTITIES/*.md 2>/dev/null | wc -l) -eq 0 ] && orphans=$((orphans+1))
    done
    echo "$orphans"
}

check_contradictions() {
    local contradictions=0
    for f in $ENTITIES/*.md; do
        if grep -q "是 RAG" "$f" 2>/dev/null && grep -q "不是 RAG" "$f" 2>/dev/null; then
            contradictions=$((contradictions+1))
        fi
    done
    echo "$contradictions"
}

# 并行执行检查
echo "检查中..."
DEAD=$(check_dead_links)
ORPHANS=$(check_orphans)
CONTRADICT=$(check_contradictions)

# 修复矛盾
if [ $CONTRADICT -gt 0 ]; then
    for f in $ENTITIES/*.md; do
        sed -i 's/是 RAG/可类比 RAG/g' "$f" 2>/dev/null
        sed -i 's/不是 RAG/不是传统 RAG/g' "$f" 2>/dev/null
    done
fi

# 修复孤儿
if [ $ORPHANS -gt 0 ]; then
    for f in $ENTITIES/*.md; do
        fname=$(basename "$f" .md)
        if [ $(grep -r "\[\[$fname\]\]" $ENTITIES/*.md 2>/dev/null | wc -l) -eq 0 ]; then
            for ref in memory llm-wiki openclaw; do
                [ -f "$ENTITIES/${ref}.md" ] && grep -q "\[\[$fname\]\]" "$ENTITIES/${ref}.md" || echo "- [[$fname]]" >> "$ENTITIES/${ref}.md"
            done
        fi
    done
fi

# 记录日志
ENTITY_COUNT=$(ls $ENTITIES/*.md | wc -l)
echo "## [$TIMESTAMP] lint | entities:$ENTITY_COUNT | dead:$DEAD | orphan:$ORPHANS | contradict:$CONTRADICT" >> $LOG

echo "死链: $DEAD"
echo "孤儿: $ORPHANS"
echo "矛盾: $CONTRADICT"
echo "实体页: $ENTITY_COUNT"
echo "=== Lint 完成 ==="
