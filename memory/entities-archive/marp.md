---
title: Marp
type: entity
status: active
tags: [marp, presentation]
---

# Marp

> 原文提到: "slide deck (Marp)"

## 什么是 Marp

Markdown 演示文稿生成工具。

## 使用方式

```markdown
---
marp: true
theme: default
---

# 标题

- 内容 1
- 内容 2
```

## 安装

```bash
npm install -g @marp-team/marp-cli
```

## 生成幻灯片

```bash
marp presentation.md -o output.pdf
```

## 与 Wiki 集成

将分析结果输出为幻灯片:
- 对比分析
- 趋势展示
- 摘要报告

## 相关页面

- [[query]]
- [[examples]]
