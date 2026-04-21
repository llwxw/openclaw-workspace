---
title: Performance Optimization
type: concept
status: draft
last_updated: 2026-04-11
tags: [performance, speed, optimization]
---

# ⚡ Performance Optimization

> Wiki 性能优化

## 性能瓶颈

| 瓶颈 | 影响 | 解决方案 |
|------|------|----------|
| 大量小文件 | 读取慢 | 合并或目录归档 |
| 深层目录 | 导航慢 | 扁平化 |
| 图片过大 | 加载慢 | 压缩/懒加载 |

---

## 文件数量优化

| 规模 | 页面数 | 建议 |
|------|--------|------|
| 小 | <50 | 单层目录 |
| 中 | 50-200 | 按类别分目录 |
| 大 | 200+ | 按项目/年份分 |

---

## 命令行优化

### 批量操作

```bash
# 并行处理
find . -name "*.md" -exec grep -l "关键词" {} \; | xargs -P 4 处理

# 缓存结果
grep -r "pattern" . > /tmp/results.txt
```

---

## 硬件优化

- SSD vs HDD (显著)
- 内存大小 (影响缓存)
- 文件系统 (ext4 vs NTFS)

---

## 相关页面

- [[search-optimization]] — 搜索优化

---

*最后更新：2026-04-11*