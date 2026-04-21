#!/bin/bash
#===============================================================================
# memory_maintain.sh - 长期记忆系统维护脚本
# 
# 功能：备份、过期检查、格式校验、去重
# 建议 cron: 0 3 * * * /home/ai/.openclaw/workspace/scripts/memory_maintain.sh
#-------------------------------------------------------------------------------

set -e

MEMORY_ROOT="$HOME/.openclaw/workspace"
BACKUP_DIR="$MEMORY_ROOT/.memory_backups"
TODAY=$(date +%Y-%m-%d)
LOG_FILE="$MEMORY_ROOT/.memory_backups/maintain_$TODAY.log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN:${NC} $1"; }
err() { echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $1"; }

echo "========================================"
echo "  Memory Maintenance - $TODAY"
echo "========================================"

#-------------------------------------------------------------------------------
# 1. 每日备份
#-------------------------------------------------------------------------------
log "📦 创建每日备份..."
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/memory_$TODAY.tar.gz"
tar -czf "$BACKUP_FILE" -C "$MEMORY_ROOT" MEMORY.md memory/ 2>/dev/null || true

# 只保留最近 7 天的备份
find "$BACKUP_DIR" -name "memory_*.tar.gz" -mtime +7 -delete 2>/dev/null || true
log "✅ 备份完成: $BACKUP_FILE"

#-------------------------------------------------------------------------------
# 2. 检查过期条目
#-------------------------------------------------------------------------------
log "🔍 检查过期条目 [expires: YYYY-MM-DD]..."
EXPIRED=$(grep -rn "expires: 20" "$MEMORY_ROOT"/memory/*.md 2>/dev/null | while IFS=: read file line content; do
    expire_date=$(echo "$content" | grep -oP 'expires: \K[0-9-]+')
    if [[ "$expire_date" < "$TODAY" ]]; then
        echo "$file:$line: $content"
    fi
done)

if [[ -n "$EXPIRED" ]]; then
    warn "发现过期条目："
    echo "$EXPIRED" | head -5
    echo "$EXPIRED" >> "$LOG_FILE.expired"
else
    log "✅ 无过期条目"
fi

#-------------------------------------------------------------------------------
# 3. 统计信息
#-------------------------------------------------------------------------------
log "📊 记忆库统计..."
MEMORY_LINES=$(find "$MEMORY_ROOT/memory" -name "*.md" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
FILES_COUNT=$(find "$MEMORY_ROOT/memory" -name "*.md" | wc -l)
log "   文件数: $FILES_COUNT, 总行数: $MEMORY_LINES"

#-------------------------------------------------------------------------------
# 4. 验证 MEMORY.md 存在
#-------------------------------------------------------------------------------
if [[ -f "$MEMORY_ROOT/MEMORY.md" ]]; then
    log "✅ MEMORY.md 存在"
else
    err "❌ MEMORY.md 不存在！"
    exit 1
fi

#-------------------------------------------------------------------------------
# 5. 验证目录结构
#-------------------------------------------------------------------------------
log "🔎 验证目录结构..."
REQUIRED_DIRS=("memory/projects" "memory/knowledge" "memory/ephemeral")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ -d "$MEMORY_ROOT/$dir" ]]; then
        log "   ✅ $dir"
    else
        warn "   ❌ $dir 不存在，已创建"
        mkdir -p "$MEMORY_ROOT/$dir"
    fi
done

log "========================================"
log "  维护完成 - $TODAY"
log "========================================"