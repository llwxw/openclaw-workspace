#!/bin/bash
# Entity 精简脚本：归档报告合并 + 去重 + 清理低优先级
# 目标：entities/ 保持在 30 个左右

ENTITIES="$HOME/.openclaw/workspace/memory/entities"
ARCHIVE="$HOME/.openclaw/workspace/memory/entities-archive"
TODAY=$(date '+%Y-%m-%d')

mkdir -p "$ARCHIVE"

echo "[$TODAY] === Entity 精简开始 ==="

# 1. 合并 claude-code 报告 (7个 → 1个)
REPORT_FILES=$(ls "$ENTITIES"/claude-code-*-report*.md 2>/dev/null)
if [ -n "$REPORT_FILES" ]; then
    echo "  📄 合并 claude-code 报告..."
    # 保留最后一个（最完整），其余归档
    for f in $REPORT_FILES; do
        fname=$(basename "$f")
        if [ "$fname" = "claude-code-final-ultimate-complete-report.md" ]; then
            # 重命名为通用报告
            mv "$f" "$ENTITIES/claude-code-reports.md"
            echo "  ✅ 保留: claude-code-reports.md"
        else
            mv "$f" "$ARCHIVE/$fname"
            echo "  📦 归档: $fname"
        fi
    done
fi

# 2. 去重：下划线版本 vs 横线版本（保留横线版本）
for DUP in task_orchestrator v8_scorer v8_classifier; do
    UNDERSCORE="$ENTITIES/${DUP}.md"
    HYPHEN="${DUP//_/-}.md"
    if [ -f "$UNDERSCORE" ] && [ -f "$ENTITIES/$HYPHEN" ]; then
        echo "  🔗 去重: ${DUP} → $HYPHEN (保留)"
        mv "$UNDERSCORE" "$ARCHIVE/$(basename $UNDERSCORE)"
    fi
done

# 3. 清理低优先级 auto-ingested skills（已在上一轮从 skills/ 目录摄入，跳过）
# 仅当 entity 是纯 auto-ingested 且无实质内容时移出
for ENTITY in automation-workflows classifier-health critical-interceptor \
              intent-enhancer multi-search-engine ontology proactivity \
              productivity-automation-kit scrapling superpowers \
              memory-keeper elite-longterm-memory github-manager \
              vercel-deploy; do
    FILE="$ENTITIES/${ENTITY}.md"
    if [ -f "$FILE" ]; then
        # 检查是否只有自动生成的模板内容（无实质洞察）
        LINES=$(wc -l < "$FILE")
        if [ "$LINES" -lt 25 ]; then
            mv "$FILE" "$ARCHIVE/${ENTITY}.md"
            echo "  🗑  移出(空模板): $ENTITY.md (${LINES}行)"
        fi
    fi
done

# 统计
COUNT=$(ls "$ENTITIES"/*.md 2>/dev/null | wc -l)
echo "  ✅ 精简完成: entities/ 现在 $COUNT 个"

# 4. 输出保留清单
echo ""
echo "=== 当前 entities/ ($COUNT 个) ==="
ls "$ENTITIES"/*.md | xargs -n1 basename | sort
