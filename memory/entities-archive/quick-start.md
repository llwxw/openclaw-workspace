---
title: Quick Start
type: entity
status: active
tags: [guide, tutorial]
---

# 快速开始

> 5 分钟内启动 LLM Wiki 模式

## 步骤 1: 准备目录

```bash
mkdir -p memory/entities memory/raw docs
```

## 步骤 2: 创建 Schema

创建 `SOUL.md` 定义 AI 行为约束。

## 步骤 3: 添加第一个 Source

把文档放入 `docs/`，LLM 会自动处理。

## 步骤 4: 提问

问 AI 问题，答案会写入 wiki。

## 步骤 5: 定期 Lint

运行 `scripts/auto-lint.sh` 检查健康度。

## 5 分钟检查清单

- [ ] 目录结构
- [ ] Schema 配置
- [ ] 第一个 source
- [ ] 第一次 query
- [ ] 第一次 lint

## 相关页面

- [[framework]]
- [[llm-wiki-implementation]]
- [[query]]
- [[lint]]
