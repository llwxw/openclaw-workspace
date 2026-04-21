---
title: API
type: entity
status: active
tags: [api, integration]
---

# API

> 与外部系统交互的接口

## 内部 API

| 服务 | 端口 | 功能 |
|------|------|------|
| Classifier | 3104 | 场景分类 |
| Scorer | 3103 | 任务评分 |
| Router | 3102 | 任务路由 |
| Memory | 3101 | 记忆管理 |

## 外部集成

| 系统 | 说明 |
|------|------|
| Feishu | 文档协作 |
| GitHub | 代码管理 |
| Vercel | 部署平台 |

## 使用示例

```python
# 分类请求
curl -X POST http://localhost:3104/classify -d '{"text": "分析代码"}'

# 评分请求
curl -X GET http://localhost:3103/api/score?task=...
```

## 相关页面

- [[system-integration]]
- [[openclaw]]
- [[task-orchestrator]]
