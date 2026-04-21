#!/bin/bash
# loop-review.sh - 每30分钟运行一次的系统循环审查脚本
# 职责：端口检查 + entity 数量监控 + 自动清理 + 日志记录
# cron: */30 * * * * cd ~/.openclaw/workspace && bash scripts/loop-review.sh

set -euo pipefail

WORKSPACE="$HOME/.openclaw/workspace"
LOG_DIR="$WORKSPACE/memory/loop-reviews"
PORT_LOG=""
REVIEW_DATE=$(date +%Y-%m-%d)
ENTITY_TARGET=30

mkdir -p "$LOG_DIR"
cd "$WORKSPACE"

# 使用临时文件避免自引用问题
PORT_LOG=$(mktemp /tmp/ports-XXXXXX.txt)
trap "rm -f $PORT_LOG" EXIT

# ── 1. 端口/服务状态检查 ─────────────────────────────────────
{
  echo "## 端口/服务状态检查 $(date '+%Y-%m-%d %H:%M:%S')"
  echo "| 端口 | 服务 | PID | 状态 |"
  echo "|------|------|-----|------|"

  check_port() {
    local port=$1
    local expected=$2
    local info
    info=$(ss -tlnp 2>/dev/null | grep ":${port} " || ss -tlnp 2>/dev/null | grep "\.${port}" || echo "")
    if [ -n "$info" ]; then
      local pid
      pid=$(echo "$info" | grep -oP 'pid=\K[0-9]+' | head -1 || echo "?")
      local bind
      bind=$(echo "$info" | awk '{print $4}' | head -1)
      echo "| ${port} | ${expected} | ${pid} | ✅ ${bind} |"
    else
      echo "| ${port} | ${expected} | — | ❌ 无进程 |"
    fi
  }

  check_port 18789 "Gateway"
  check_port 3101 "context-api"
  check_port 3102 "router"
  check_port 3103 "scorer"
  check_port 3105 "classifier"

  # Entity 数量
  ENTITY_COUNT=$(ls "$WORKSPACE/memory/entities/" 2>/dev/null | wc -l || echo "0")
  echo ""
  echo "**Entity 数量**: ${ENTITY_COUNT} (目标: ≤${ENTITY_TARGET})"

  # Gateway 最近错误
  ERR_COUNT=$(journalctl -u openclaw-gateway --since "10 minutes ago" 2>/dev/null | grep -c "ERROR\|Exception\|Failed" || echo "0")
  echo ""
  echo "**Gateway 最近错误**: ${ERR_COUNT}"

} >> "$PORT_LOG"

# ── 2. 自动清理（entity 超标时）──────────────────────────────
if [ "$ENTITY_COUNT" -gt "$ENTITY_TARGET" ]; then
  echo "⚠️  Entity ${ENTITY_COUNT} > ${ENTITY_TARGET}，触发清理..." >> "$PORT_LOG"
  bash "$WORKSPACE/scripts/wiki-learn-once.sh" >> "$PORT_LOG" 2>&1 || true
  NEW_COUNT=$(ls "$WORKSPACE/memory/entities/" 2>/dev/null | wc -l || echo "0")
  echo "清理后: ${NEW_COUNT}" >> "$PORT_LOG"
fi

# ── 3. 追加到审查日志 ───────────────────────────────────────
LATEST="$LOG_DIR/ports-${REVIEW_DATE}.md"
if [ ! -f "$LATEST" ]; then
  echo "# 端口审查日志 ${REVIEW_DATE}" > "$LATEST"
  echo "" >> "$LATEST"
fi

# 避免自引用：过滤掉与 LATEST 同名的文件
grep -v "^$LATEST" "$PORT_LOG" >> "$LATEST" 2>/dev/null || cat "$PORT_LOG" >> "$LATEST"

# ── 4. 简洁输出到 cron.log ─────────────────────────────────
if [ "$ENTITY_COUNT" -le "$ENTITY_TARGET" ]; then
  echo "✅ Review complete. Entity count: ${ENTITY_COUNT}" >> "$LOG_DIR/cron.log"
else
  echo "⚠️  Review complete. Entity count: ${ENTITY_COUNT} (cleaned)" >> "$LOG_DIR/cron.log"
fi

rm -f "$PORT_LOG"
exit 0
