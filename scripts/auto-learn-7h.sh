#!/bin/bash
# 7 小时自动化学习循环 (420 分钟，每 2 分钟一次迭代 = 210 次)

echo "=== 7 小时自动化学习循环启动 ==="
echo "开始时间: $(date)"
echo "预计结束: 7 小时后"
echo ""

INTERVAL=120  # 2 分钟一次
TOTAL_MINUTES=420
ITERATIONS=$((TOTAL_MINUTES * 60 / INTERVAL))

for i in $(seq 1 $ITERATIONS); do
    MINUTE=$((i * INTERVAL / 60))
    PERCENT=$((i * 100 / ITERATIONS))
    
    echo "[$(date +%H:%M)] 迭代 $i/$ITERATIONS (${MINUTE}分钟, ${PERCENT}%)"
    
    # 1. 扫描工作区变化
    NEW_FILES=$(find /home/ai/.openclaw/workspace -name "*.md" -mmin -$((INTERVAL * 2)) 2>/dev/null | wc -l)
    if [ "$NEW_FILES" -gt 0 ]; then
        echo "  📚 发现 $NEW_FILES 个新/更新文件"
    fi
    
    # 2. 检查 skills 变化
    SKILLS_COUNT=$(ls /home/ai/.openclaw/workspace/skills/ 2>/dev/null | wc -l)
    echo "  🛠️ Skills: $SKILLS_COUNT 个"
    
    # 3. 检查 entities 数量
    ENTITIES_COUNT=$(ls /home/ai/.openclaw/workspace/memory/entities/*.md 2>/dev/null | wc -l)
    echo "  📄 实体页: $ENTITIES_COUNT 个"
    
    # 4. 运行简单 lint (死链检查)
    DEAD_LINKS=0
    for link in $(grep -roh '\[\[[a-z0-9-]*\]\]' /home/ai/.openclaw/workspace/memory/entities/*.md 2>/dev/null | sed 's/\[\[//;s/\]\]//g' | sort -u); do
        if [ ! -f "/home/ai/.openclaw/workspace/memory/entities/${link}.md" ]; then
            DEAD_LINKS=$((DEAD_LINKS + 1))
        fi
    done
    if [ "$DEAD_LINKS" -gt 0 ]; then
        echo "  ⚠️ 死链: $DEAD_LINKS 个"
    else
        echo "  ✅ 无死链"
    fi
    
    # 5. 记录到 log
    echo "## [$(date +%Y-%m-%d\ %H:%M)] auto-loop | iter $i | files:$NEW_FILES | skills:$SKILLS_COUNT | entities:$ENTITIES_COUNT | dead-links:$DEAD_LINKS" >> /home/ai/.openclaw/workspace/memory/log.md
    
    echo "  ---"
    
    # 等待下一个迭代
    sleep $INTERVAL
done

echo ""
echo "=== 7 小时循环完成 ==="
echo "结束时间: $(date)"