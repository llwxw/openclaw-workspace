# Session: 2026-04-04 16:43:48 UTC

- **Session Key**: agent:main:main
- **Session ID**: a5d4bc98-49c4-4fc7-9dbc-23e8e52ea8a3
- **Source**: webchat

## Conversation Summary

user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sun 2026-04-05 00:41 GMT+8] 检查一下为什么我给你发飞书你接收不到
assistant: 



assistant: 



assistant: 



assistant: 



assistant: 



assistant: 



assistant: 



assistant: 



assistant: 

找到问题了！日志显示：

```
[default] channel exited: Unable to resolve plugin runtime module
```

飞书插件启动失败，缺少 runtime module。让我检查一下插件配置：

assistant: 



assistant: 



assistant: 



assistant: 



assistant: 

问题很清楚了：**飞书插件无法加载 runtime module**，一直在崩溃重启。

试一下重启 gateway：


