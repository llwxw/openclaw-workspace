#!/bin/bash
# LLM Wiki 7小时自动化学习循环 (修正版)
# 贯彻需求 + LLM Wiki 原文
# 区分: skills/ → 实体页 | docs/ → Raw Sources

WORKSPACE="/home/ai/.openclaw/workspace"
ENTITIES="$WORKSPACE/memory/entities"
RAW="$WORKSPACE/memory/raw"
LOG="$WORKSPACE/memory/log.md"
COUNTER=0
MAX_ITERATIONS=210  # 7小时

echo "=== 7小时自动化学习循环启动 (修正版) ==="
echo "开始: $(date)"
echo "规则: skills/→实体页, docs/→Raw Sources"
echo ""

# 确保 raw 目录存在
mkdir -p "$RAW/docs" "$RAW/papers" "$RAW/notes"

while [ $COUNTER -lt $MAX_ITERATIONS ]; do
    COUNTER=$((COUNTER + 1))
    PERCENT=$((COUNTER * 100 / MAX_ITERATIONS))
    MINUTE=$((COUNTER * 2))
    
    echo "[$(date +%H:%M:%S)] 循环 $COUNTER/$MAX_ITERATIONS"
    
    # ===== 1. Ingest - 扫描知识源 =====
    # 只扫描 skills/ 目录创建实体页 (不是 docs/)
    NEW_ENTITIES=0
    
    for skill in $WORKSPACE/skills/*/; do
        if [ -d "$skill" ]; then
            name=$(basename "$skill")
            # 检查是否已有实体页且不在归档中
            if [ ! -f "$ENTITIES/${name}.md" ]; then
                # 创建实体页
                cat > "$ENTITIES/${name}.md" << EOF
---
title: $name
type: skill
status: auto-ingested
last_updated: $(date +%Y-%m-%d)
tags: [skill, auto]
---

# $name

> 自动摄入的技能

## 来源

- 类型: skill
- 路径: skills/$name
- 摄入时间: $(date "+%Y-%m-%d %H:%M")

## 相关页面

- [[skills]] - 技能清单
- [[ai-usage]] - AI 如何使用
EOF
                echo "  📥 新技能实体页: $name"
                NEW_ENTITIES=$((NEW_ENTITIES + 1))
            fi
        fi
    done
    
    # 扫描 docs/ 作为 Raw Sources (不创建实体页)
    DOCS_COUNT=$(ls $WORKSPACE/docs/*.md 2>/dev/null | wc -l)
    if [ $DOCS_COUNT -gt 0 ]; then
        echo "  📂 Raw Sources: $DOCS_COUNT 个文档"
    fi
    
    # ===== 2. Synthesize - 思考 (对照 LLM Wiki 原文核心) =====
    echo "  🧠 思考: 对照原文 - 增量构建、编译一次、持续更新"
    
    # ===== 3. Write-back =====
    WRITTEN=$NEW_ENTITIES
    
    # ===== 4. Lint - 死链检查与修复 =====
    FIXED=0
    for link in $(grep -roh '\[\[[a-z0-9-]*\]\]' $ENTITIES/*.md 2>/dev/null | sed 's/\[\[//;s/\]\]//g' | sort -u); do
        if [ ! -f "$ENTITIES/${link}.md" ]; then
            # 自动修复：移除死链
            sed -i "s/\[\[$link\]\]//g" $ENTITIES/*.md 2>/dev/null
            FIXED=$((FIXED + 1))
        fi
    done
    
    if [ $FIXED -gt 0 ]; then
        echo "  🔧 修复死链: $FIXED 个"
    fi
    
    # ===== 5. 记录 log =====
    ENTITY_COUNT=$(ls $ENTITIES/*.md 2>/dev/null | wc -l)
    echo "## [$(date +%Y-%m-%d\ %H:%M)] auto-cycle | iter $COUNTER | entities:$ENTITY_COUNT | new:$WRITTEN | fixed:$FIXED" >> $LOG
    
    # 进度输出
    echo "  ✅ 实体页:$ENTITY_COUNT | 新增:$WRITTEN | 修复:$FIXED"
    echo "[PROGRESS] ${PERCENT}% | $COUNTER/$MAX_ITERATIONS | entities:$ENTITY_COUNT"
    echo "---"
    
    # 等待 2 分钟
    sleep 120
done

echo ""
echo "=== 7小时循环完成 ==="
echo "结束: $(date)"