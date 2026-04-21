#!/bin/bash
# Wiki Auto-Learn 单次执行脚本
# 配合 cron 使用，每小时触发一次
#
# 策略：
#   1. 只摄入新 skill（不在 entities/ 且不在 blocklist/ 中）
#   2. blocklist 防止被删的 entity 重复摄入
#   3. 有空间才添加，超标才 prune

WORKSPACE="/home/ai/.openclaw/workspace"
ENTITIES="$WORKSPACE/memory/entities"
RAW="$WORKSPACE/memory/raw"
LOG="$WORKSPACE/memory/log.md"
SKILLS_DIR="$WORKSPACE/skills"
ARCHIVE="$WORKSPACE/memory/entities-archive"
BLOCKLIST="$WORKSPACE/memory/.wiki-learn-blocklist"  # 被删除的 skill 名列表

TARGET=28
BUFFER=3

mkdir -p "$RAW/docs" "$RAW/papers" "$RAW/notes" "$ARCHIVE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === wiki-learn-once 启动 ==="

# ===== 辅助：计算可丢弃分数（越小越先删）=====
disposability_score() {
    local f=$1
    local score
    if grep -q "status: auto-ingested" "$f" 2>/dev/null; then
        score=0
    else
        score=500
    fi
    local lines=$(wc -l < "$f")
    echo $((score + lines))
}

# ===== 辅助：从 blocklist 加载已删除 skill 名（去重）=====
load_blocklist() {
    [ -f "$BLOCKLIST" ] && sort -u "$BLOCKLIST" || true
}

# ===== 辅助：添加 skill 到 blocklist（防重复，已转义regex元字符）=====
blocklist_add() {
    local name=$1
    # 跳过已存在的（grep -F 固定字符串，避免name中元字符干扰）
    grep -qFx -- "$name" "$BLOCKLIST" 2>/dev/null && return
    echo "$name" >> "$BLOCKLIST"
}

# ===== 辅助：精简到目标数量（同时写 blocklist）=====
prune_to_target() {
    local target=$1
    local current=$(ls "$ENTITIES"/*.md 2>/dev/null | wc -l)
    local pruned=0

    while [ "$current" -gt "$target" ]; do
        local victim=$(ls "$ENTITIES"/*.md 2>/dev/null | while read f; do
            echo "$(disposability_score "$f") $f"
        done | sort -n | head -1 | cut -d' ' -f2-)

        [ -z "$victim" ] || [ ! -f "$victim" ] && break

        local fname=$(basename "$victim" .md)
        mv "$victim" "$ARCHIVE/$(basename $victim)"
        # 如果 skill 目录还在，加入 blocklist 防止下次重摄入
        [ -d "$SKILLS_DIR/$fname" ] && blocklist_add "$fname"
        echo "  🗑  精简: $fname"
        pruned=$((pruned + 1))
        current=$(ls "$ENTITIES"/*.md 2>/dev/null | wc -l)
    done

    [ "$pruned" -gt 0 ] && echo "  🔪 精简完成: 移出 $pruned 个"
}

# ===== 1. 加载 blocklist（精确匹配，用数组避免子串误匹配）=====
BLOCKED_NAMES=($(load_blocklist))
echo "  🚫 blocklist: ${BLOCKED_NAMES[*]:-无}"

# ===== 2. 检查空间 =====
CURRENT=$(ls "$ENTITIES"/*.md 2>/dev/null | wc -l)
AVAILABLE=$((TARGET + BUFFER - CURRENT))
echo "  📊 当前 $CURRENT / 目标 $TARGET / 可新增 $AVAILABLE"

# ===== 3. 扫描 skills/，按空间添加（排除 blocklist）=====
NEW_ENTITIES=0
SKIPPED_SPACE=0
SKIPPED_BLOCK=0
for skill in "$SKILLS_DIR"/*/; do
    [ -d "$skill" ] || continue
    name=$(basename "$skill")

    # 已在 entities/ 中则跳过
    [ -f "$ENTITIES/${name}.md" ] && continue

    # 在 blocklist 中则跳过（曾被删除，不重摄入，精确匹配）
    is_blocked=false
    for blocked in "${BLOCKED_NAMES[@]}"; do
        [ "$name" = "$blocked" ] && is_blocked=true && break
    done
    if $is_blocked; then
        SKIPPED_BLOCK=$((SKIPPED_BLOCK + 1))
        continue
    fi

    # 空间不足则跳过
    if [ "$AVAILABLE" -le 0 ]; then
        SKIPPED_SPACE=$((SKIPPED_SPACE + 1))
        continue
    fi

    cat > "$ENTITIES/${name}.md" << EOF
---
title: $name
type: skill
status: auto-ingested
last_updated: $(date '+%Y-%m-%d')
tags: [skill, auto]
---

# $name

> 自动从 skills/ 目录摄入

## 来源

- 类型: skill
- 路径: skills/$name
- 摄入时间: $(date "+%Y-%m-%d %H:%M")

## 相关页面

- [[skills]] - 技能清单
- [[ai-usage]] - AI 使用方式
EOF
    echo "  📥 新技能实体页: $name"
    NEW_ENTITIES=$((NEW_ENTITIES + 1))
    AVAILABLE=$((AVAILABLE - 1))
done

[ "$SKIPPED_BLOCK" -gt 0 ] && echo "  🚫 跳过(blocklist): $SKIPPED_BLOCK 个"
[ "$SKIPPED_SPACE" -gt 0 ] && echo "  ⏭  跳过(空间不足): $SKIPPED_SPACE 个"

# 扫描 docs/ 作为 Raw Sources
DOCS_COUNT=$(ls "$WORKSPACE/docs"/*.md 2>/dev/null | wc -l)
echo "  📂 Raw Sources: docs/$DOCS_COUNT"

# ===== 4. Lint: 死链检查与修复 =====
FIXED=0
for link in $(grep -roh '\[\[[a-z0-9-]*\]\]' "$ENTITIES"/*.md 2>/dev/null | sed 's/\[\[//;s/\]\]//g' | sort -u); do
    if [ ! -f "$ENTITIES/${link}.md" ]; then
        sed -i "s/\[\[$link\]\]//g" "$ENTITIES"/*.md 2>/dev/null
        FIXED=$((FIXED + 1))
    fi
done
[ "$FIXED" -gt 0 ] && echo "  🔧 修复死链: $FIXED 个"

# ===== 5. 超标清理 =====
CURRENT=$(ls "$ENTITIES"/*.md 2>/dev/null | wc -l)
if [ "$CURRENT" -gt $((TARGET + BUFFER)) ]; then
    echo "  🔪 超标清理: 当前 $CURRENT，精简到 $TARGET"
    prune_to_target "$TARGET"
fi

# ===== 6. 记录 log =====
ENTITY_COUNT=$(ls "$ENTITIES"/*.md 2>/dev/null | wc -l)
echo "## [$(date '+%Y-%m-%d %H:%M')] wiki-learn | entities:$ENTITY_COUNT | new:$NEW_ENTITIES | skip(block):$SKIPPED_BLOCK | skip(space):$SKIPPED_SPACE | fixed:$FIXED" >> "$LOG"

echo "  ✅ entities:$ENTITY_COUNT | new:$NEW_ENTITIES"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] === wiki-learn-once 完成 ==="
