---
title: Deployment
type: entity
status: active
tags: [deploy, release]
---

# Deployment

> Wiki 部署和发布

## 部署方式

### 1. 本地部署
直接使用本地文件系统。

### 2. 云端部署
同步到云存储 (Feishu Drive)。

### 3. 分布式部署
多实例共享。

## 发布流程

```
开发 → 测试 → 预发布 → 生产
```

## 回滚

```bash
# 从 Git 回滚
git revert HEAD
```

## 相关页面

- [[version-control]]
- [[backup-strategy]]
