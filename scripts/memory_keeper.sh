#!/bin/bash
#===============================================================================
# memory_keeper.sh - 记忆管理员 Agent (增强版)
#
# 功能：
# 1. 读取 memory/ 下所有文件
# 2. 合并重复信息
# 3. 删除过期条目（根据 [expires:] 标记）
# 4. 将临时对话中有价值的信息写入 ephemeral/
# 5. 更新 MEMORY.md 索引
# 6. [NEW] 从归档 session 中提取有价值信息到长期记忆
#
# 运行: ./memory_keeper.sh
#===============================================================================

set -e

MEMORY_ROOT="$HOME/.openclaw/workspace"
SESSION_ROOT="$HOME/.openclaw/sessions"
MEMORY_DIR="$MEMORY_ROOT/memory"
TODAY=$(date +%Y-%m-%d)
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)]${NC} $1"; }
info() { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"; }

echo "========================================"
echo "  Memory Keeper (Enhanced) - $TODAY"
echo "========================================"

#-------------------------------------------------------------------------------
# 1. 扫描各模块文件
#-------------------------------------------------------------------------------
log "📂 扫描记忆文件..."
find "$MEMORY_DIR" -name "*.md" -type f | grep -v ".gitkeep" | while read f; do
    echo "   - $(basename $f)"
done

#-------------------------------------------------------------------------------
# 2. 检查过期条目
#-------------------------------------------------------------------------------
log "🔍 检查过期条目..."
EXPIRED_COUNT=0
while IFS=: read -r file line content; do
    if [[ -n "$file" ]]; then
        expire_date=$(echo "$content" | grep -oP 'expires: \K[0-9-]+')
        if [[ "$expire_date" < "$TODAY" ]] && [[ -n "$expire_date" ]]; then
            warn "   过期: $(basename $file)#L$line"
            EXPIRED_COUNT=$((EXPIRED_COUNT + 1))
        fi
    fi
done < <(grep -rn "expires:" "$MEMORY_DIR" 2>/dev/null || true)

if [[ $EXPIRED_COUNT -eq 0 ]]; then
    log "   ✅ 无过期条目"
else
    warn "   共 $EXPIRED_COUNT 个过期条目待处理"
fi

#-------------------------------------------------------------------------------
# 3. 检查 ephemeral 目录
#-------------------------------------------------------------------------------
log "📋 检查临时记忆目录..."
EPHEMERAL_COUNT=$(find "$MEMORY_DIR/ephemeral" -name "*.md" -type f 2>/dev/null | wc -l)
log "   临时文件: $EPHEMERAL_COUNT 个"

#-------------------------------------------------------------------------------
# 4. [NEW] 从归档 session 提取有价值信息
#-------------------------------------------------------------------------------
log "🧠 从归档 session 提取知识..."

SESSION_EXTRACT_FILE="$MEMORY_DIR/ephemeral/session_extract_$TODAY.md"

# 查找最近的归档 session（最近 3 天）
find "$SESSION_ROOT" -name "*.json" -mtime -3 -type f 2>/dev/null | head -5 | while read session_file; do
    # 提取包含知识点的对话（如包含"记住"、"学会"、"偏好"等关键词）
    grep -i "记住\|学会\|偏好\|规则\|喜欢\|讨厌\|以后都\|要使用\|用.*不要" "$session_file" 2>/dev/null | head -10 >> "$SESSION_EXTRACT_FILE.tmp" || true
done

# 去重并写入
if [[ -f "$SESSION_EXTRACT_FILE.tmp" ]]; then
    if [[ -s "$SESSION_EXTRACT_FILE.tmp" ]]; then
        {
            echo "# Session 知识提取 - $TODAY"
            echo ""
            echo "从近期的 session 归档中提取的有价值信息："
            echo ""
        } > "$SESSION_EXTRACT_FILE"
        
        # 进一步提取关键词（JSON 中提取 message 内容）
        cat "$SESSION_EXTRACT_FILE.tmp" | grep -oP '"text":"[^"]+' | sed 's/"text":"//' | sed 's/\\n/ /g' | grep -v "^system" | sort -u >> "$SESSION_EXTRACT_FILE"
        
        log "   ✅ 提取了 session 知识到: $(basename $SESSION_EXTRACT_FILE)"
        
        # 统计
        EXTRACT_LINES=$(wc -l < "$SESSION_EXTRACT_FILE")
        log "   📊 提取行数: $EXTRACT_LINES"
    else
        log "   ℹ️ 无新知识可提取"
    fi
    rm -f "$SESSION_EXTRACT_FILE.tmp"
else
    log "   ℹ️ 无近期 session 可分析"
fi

#-------------------------------------------------------------------------------
# 5. 合并 ephemeral 到主记忆
#-------------------------------------------------------------------------------
log "🔄 检查是否需要合并 ephemeral..."
if [[ $EPHEMERAL_COUNT -gt 0 ]]; then
    # 检查 ephemeral 是否有足够内容需要合并
    EPHEMERAL_LINES=$(find "$MEMORY_DIR/ephemeral" -name "*.md" -exec cat {} \; 2>/dev/null | wc -l)
    if [[ $EPHEMERAL_LINES -gt 20 ]]; then
        warn "   ℹ️ ephemeral 有 $EPHEMERAL_LINES 行，可能需要手动 review 后合并"
    else
        log "   ✅ ephemeral 内容较少，暂不合并"
    fi
fi

#-------------------------------------------------------------------------------
# 6. 更新 MEMORY.md 时间戳
#-------------------------------------------------------------------------------
log "📝 更新 MEMORY.md 时间戳..."
sed -i "s/last_updated:.*/last_updated: ${TODAY}T$(date +%H:%M:%S)+08:00/" "$MEMORY_ROOT/MEMORY.md"

#-------------------------------------------------------------------------------
# 7. 生成报告
#-------------------------------------------------------------------------------
log "========================================"
log "  整理完成 - $TODAY"
log "========================================"
log "📊 总结："
log "   - 过期条目: $EXPIRED_COUNT"
log "   - 临时文件: $EPHEMERAL_COUNT"
log "   - Session 提取: $([[ -f "$SESSION_EXTRACT_FILE" ]] && echo "是" || echo "否")"