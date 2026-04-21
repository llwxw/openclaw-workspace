---
title: Releases
type: entity
status: active
tags: [release, version]
---

# Releases

> 版本发布管理

## 发布流程

```
开发 → 测试 → 预发布 → 生产
  ↓      ↓       ↓        ↓
  v1.0   v1.1    v1.2     v2.0
```

## 版本号规则

遵循语义化版本:
- 主版本: 重大变化
- 次版本: 新功能
- 补丁: 修复

## 变更日志

记录每次变更:
- 新增
- 修改
- 删除

## 回滚策略

```bash
# 回滚到上一版本
git revert HEAD

# 回滚到指定版本
git checkout v1.0
```

## 相关页面

- [[version-control]]
- [[deployment]]
- [[backup-strategy]]
