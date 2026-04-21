---
title: Cache
type: entity
status: active
tags: [cache, performance]
---

# Cache

> 缓存系统

## 缓存策略

### 1. 页面缓存
缓存常访问页面。

### 2. 查询缓存
缓存搜索结果。

### 3. LLM 响应缓存
缓存 AI 回复。

## 实现

```python
# cache.py
from functools import lru_cache

@lru_cache(maxsize=100)
def search(query):
    # 搜索逻辑
    pass
```

## 缓存清理

```bash
# 清理过期缓存
./scripts/clear-cache.sh
```

## 相关页面

- [[performance]]
- [[api]]
