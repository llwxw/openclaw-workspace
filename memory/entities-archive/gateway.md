---
title: Gateway
type: entity
status: active
tags: [gateway, api]
---

# Gateway

> API 网关

## 功能

- 统一入口
- 认证鉴权
- 限流控制
- 日志记录

## 架构

```
客户端 → Gateway → 内部服务
              ↓
          认证服务
          限流服务
          日志服务
```

## 实现

```yaml
# gateway.yaml
server:
  port: 8080
auth:
  enabled: true
rate_limit:
  requests: 100/min
```

## 相关页面

- [[api]]
- [[security]]
- [[system-integration]]
