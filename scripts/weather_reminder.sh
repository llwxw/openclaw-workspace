#!/bin/bash
# 每日台州临海天气预报提醒脚本
set -euo pipefail

# 获取3天天气预报，去除颜色码
WEATHER=$(curl -s "wttr.in/浙江台州临海?0?1?2" | sed -r "s/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g")

# 组装消息
MSG="🌤️ 浙江台州临海 今明后三天天气预报：
${WEATHER}"

# 转义消息为JSON格式
JSON_MSG=$(echo "${MSG}" | jq -R -s .)

# 发送到当前微信会话
curl -s -X POST http://127.0.0.1:18789/api/sessions/send \
  -H "Content-Type: application/json" \
  -d "{\"sessionKey\": \"o9cq80_GJJtsBKeNFez5tuZkXzrk@im.wechat\", \"message\": ${JSON_MSG}}" > /dev/null 2>&1
