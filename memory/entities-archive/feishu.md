---
title: Feishu
type: entity
status: active
last_updated: 2026-04-11
tags: [feishu, integration, collaboration]
---

# 📝 Feishu

> 飞书集成

## 概览

飞书是 OpenClaw 的内置对话渠道之一，当前可正常使用。

## 技能清单

| 技能 | 作用 |
|------|------|
| `feishu-doc` | 飞书文档读写 |
| `feishu-drive` | 飞书云盘文件管理 |
| `feishu-wiki` | 飞书知识库导航 |
| `feishu-perm` | 飞书权限管理 |

## 配置方式

### 环境变量

```bash
export FEISHU_APP_ID="cli_xxx"
export FEISHU_APP_SECRET="xxx"
```

### 配置文件

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "dmPolicy": "pairing",
      "accounts": {
        "main": {
          "appId": "你的App ID",
          "appSecret": "你的App Secret",
          "name": "AI助手"
        }
      }
    }
  }
}
```

### CLI 向导

```bash
openclaw channels add
```

## 相关路径

| 路径 | 作用 |
|------|------|
| `/home/ai/.openclaw/feishu/` | 飞书配置目录 |
| `~/.openclaw/openclaw.json` | 主配置文件 |

## 相关页面

- [[OpenClaw]] — 主项目
- [[Skills]] — 技能系统

---

*最后更新：2026-04-11*