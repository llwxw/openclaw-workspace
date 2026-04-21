---
title: Error Handling
type: entity
status: active
tags: [error, recovery]
---

# Error Handling

> 错误处理和恢复机制

## 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 死链 | 链接页面不存在 | 修复或删除链接 |
| 孤儿 | 页面无入链 | 添加到索引 |
| 矛盾 | 逻辑冲突 | 澄清描述 |
| 循环引用 | A→B→A | 检查链接 |

## 自动恢复

运行 `auto-lint.sh` 自动修复常见问题。

## 手动恢复

```bash
# 查看错误
scripts/auto-lint.sh

# 手动修复
# 编辑对应的 .md 文件
```

## 备份恢复

参见 [[backup-strategy]]

## 相关页面

- 
- [[backup-strategy]]
