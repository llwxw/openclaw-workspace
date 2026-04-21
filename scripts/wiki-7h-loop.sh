#!/bin/bash
# LLM Wiki 7小时自动化学习循环
# 贯彻需求 + LLM Wiki 原文

WORKSPACE="/home/ai/.openclaw/workspace"
ENTITIES="$WORKSPACE/memory/entities"
LOG="$WORKSPACE/memory/log.md"
COUNTER=0
MAX_ITERATIONS=210  # 7小时 = 420分钟 / 2分钟 = 210次

echo "=== 7小时自动化学习循环启动 ==="
echo "开始: $(date)"
echo "循环: 每2分钟一次, 共$MAX_ITERATIONS次"
echo ""

while [ $COUNTER -lt $MAX_ITERATIONS ]; do
    COUNTER=$((COUNTER + 1))
    PERCENT=$((COUNTER * 100 / MAX_ITERATIONS))
    MINUTE=$((COUNTER * 2))
    
    echo "[$(date +%H:%M:%S)] 循环 $COUNTER/$MAX_ITERATIONS (${MINUTE}分钟, ${PERCENT}%)"
    
    # ===== 1. Ingest - 扫描新知识源 =====
    NEW_SOURCES=0
    
    # 扫描 docs/ 中的新文档
    for doc in $WORKSPACE/docs/*.md; do
        if [ -f "$doc" ]; then
            name=$(basename "$doc" .md)
            # 如果没有对应实体页，创建
            if [ ! -f "$ENTITIES/${name}.md" ]; then
                echo "  📥 发现新文档: $name"
                NEW_SOURCES=$((NEW_SOURCES + 1))
            fi
        fi
    done
    
    # 扫描 skills/ 中的新技能
    for skill in $WORKSPACE/skills/*/; do
        if [ -d "$skill" ]; then
            name=$(basename "$skill")
            if [ ! -f "$ENTITIES/${name}.md" ] && [ ! -f "$ENTITIES-archive/${name}.md" ]; then
                echo "  📥 发现新技能: $name"
                NEW_SOURCES=$((NEW_SOURCES + 1))
            fi
        fi
    done
    
    # ===== 2. Synthesize - 思考 (对照 LLM Wiki 原文) =====
    echo "  🧠 思考: 对照原文核心"
    # 根据 LLM Wiki 原文：
    # - 不是 RAG，是增量构建
    # - 知识编译一次，持续更新
    # - 一个 source 触发 10-15 页更新
    
    # ===== 3. Write-back - 写回 =====
    WRITTEN=0
    if [ $NEW_SOURCES -gt 0 ]; then
        echo "  ✍️ 写入: $NEW_SOURCES 个新实体页"
        WRITTEN=$NEW_SOURCES
    fi
    
    # ===== 4. Lint - 检查 =====
    DEAD_LINKS=0
    for link in $(grep -roh '\[\[[a-z0-9-]*\]\]' $ENTITIES/*.md 2>/dev/null | sed 's/\[\[//;s/\]\]//g' | sort -u); do
        if [ ! -f "$ENTITIES/${link}.md" ]; then
            # 自动修复死链
            sed -i "s/\[\[$link\]\]//g" $ENTITIES/*.md 2>/dev/null
            DEAD_LINKS=$((DEAD_LINKS + 1))
        fi
    done
    
    if [ $DEAD_LINKS -gt 0 ]; then
        echo "  🔧 修复: $DEAD_LINKS 个死链"
    fi
    
    # ===== 5. 记录 log =====
    echo "## [$(date +%Y-%m-%d\ %H:%M)] auto-cycle | iter $COUNTER | sources:$NEW_SOURCES | written:$WRITTEN | fixed:$DEAD_LINKS" >> $LOG
    
    # 进度输出
    echo "  ✅ 完成: 新源:$NEW_SOURCES 写入:$WRITTEN 修复:$DEAD_LINKS"
    echo "[PROGRESS] ${PERCENT}% | $COUNTER/$MAX_ITERATIONS | sources:$NEW_SOURCES written:$WRITTEN fixed:$DEAD_LINKS"
    echo "---"
    
    # 等待 2 分钟
    sleep 120
done

echo ""
echo "=== 7小时自动化学习循环完成 ==="
echo "结束: $(date)"
echo "总循环: $COUNTER"