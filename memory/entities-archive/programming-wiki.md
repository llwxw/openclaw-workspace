---
title: Programming Wiki
type: concept
status: reference
last_updated: 2026-04-11
tags: [programming, code, development]
---

# 💻 Programming Wiki

> 编程学习知识库

## 适用场景

- 学习新技术栈
- 记录代码片段
- 保存最佳实践
- 整理解决方案

---

## 页面结构

```
programming/
├── languages/
│   ├── python.md
│   ├── javascript.md
│   └── rust.md
├── frameworks/
│   ├── react.md
│   └── fastapi.md
├── tools/
│   ├── git.md
│   └── docker.md
└── patterns/
    ├── design-patterns.md
    └── algorithms.md
```

---

## 内容类型

| 类型 | 示例 |
|------|------|
| 概念 | 什么是闭包 |
| 代码片段 | 常用函数模板 |
| 错误解决 | 问题 → 方案 |
| 最佳实践 | 编码规范 |

---

## 示例页面

```markdown
# Python 设计模式

## 单例模式

### 要点
- 类只有一个实例
- 全局访问点

### 代码
```python
class Singleton:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```
```

---

## 相关页面

- [[book-wiki]] — 读书笔记
- [[skills]] — 技能

---

*最后更新：2026-04-11*