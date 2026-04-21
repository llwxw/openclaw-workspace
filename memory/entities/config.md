---
title: Config
type: entity
status: active
tags: [config, settings]
---

# Config

> Wiki 配置文件

## 核心配置

| 配置 | 文件 | 说明 |
|------|------|------|
| AI 行为 | SOUL.md | 约束规则 |
| Agent | AGENTS.md | 代理配置 |
| 用户 | USER.md | 偏好设置 |
| 索引 | MEMORY.md | 入口配置 |

## Wiki 配置

```yaml
wiki:
  max_pages: 50
  max_orphans: 3
  max_dead_links: 0
  auto_lint: true
  lint_interval: 3600
```

## 触发配置

- 孤儿 > 3 → 触发 Lint
- 死链 > 0 → 触发 Lint

## 相关页面

- 
- [[framework]]
- [[error-handling]]
- 
- 
- 
- 
- 
- 
