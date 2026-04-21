#!/bin/bash
# 台州临海今明后三天天气预报定时发送脚本
forecast=$(curl -s "wttr.in/Linhai?0" | grep -v "Follow" | grep -v "Location:" | sed 's/\x1b\[[0-9;]*[a-zA-Z]//g')
location=$(curl -s "wttr.in/Linhai?format=%l" | sed 's/\x1b\[[0-9;]*[a-zA-Z]//g')

# 发送到当前飞书群
/home/ai/.nvm/versions/node/v22.22.1/bin/openclaw sessions send --session-key "chat:oc_1b955e738aa196d7f2afe9e1c1d35575" --message "📅 台州临海天气预报提醒：
地点：$location

今日天气：
$forecast"

