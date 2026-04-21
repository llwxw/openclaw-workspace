#!/bin/bash
# 每日浙江台州临海天气预报推送

# 获取今明后三天天气（简化格式）
TODAY=$(curl -s "wttr.in/Linhai?lang=zh&format=%l:+%c+%t+(体感%f)")
TOMORROW=$(curl -s "wttr.in/Linhai?lang=zh&format=%l:+%c+%t" -H "Cookie: weather=1")
DAY_AFTER=$(curl -s "wttr.in/Linhai?lang=zh&format=%l:+%c+%t" -H "Cookie: weather=2")

# 拼接消息
MESSAGE="【临海天气预报】
📅 今日: $TODAY
📅 明日: $TOMORROW
📅 后日: $DAY_AFTER"

# 发送到飞书（需要配置机器人webhook）
if [ -n "$FEISHU_WEBHOOK" ]; then
    curl -X POST "$FEISHU_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"msg_type\": \"text\", \"content\": {\"text\": \"$MESSAGE\"}}"
fi

echo "$MESSAGE"