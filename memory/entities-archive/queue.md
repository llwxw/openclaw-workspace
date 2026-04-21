---
title: Queue
type: entity
status: active
tags: [queue, async]
---

# Queue

> 消息队列

## 用途

- 异步处理
- 任务排队
- 事件驱动

## 队列类型

| 类型 | 特点 | 适用场景 |
|------|------|----------|
| FIFO | 先进先出 | 任务队列 |
| Priority | 优先级 | 重要任务 |
| Delay | 延迟执行 | 定时任务 |

## 实现

```python
# queue.py
from queue import Queue

q = Queue()
q.put(task)
result = q.get()
```

## 相关页面

- [[task-orchestrator]]
- [[api]]
