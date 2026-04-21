---
title: Examples
type: entity
status: active
tags: [example, demo]
---

# Examples

> 完整使用示例

## 示例 1: 添加新知识

### 场景
用户想让 AI 学习 Claude Code 的架构。

### 步骤

1. **添加 Source**
   ```bash
   cp claude-code-architecture.md docs/
   ```

2. **Ingest**
   AI 读取并提取关键信息

3. **更新 Wiki**
   - 创建/更新 claude-code-architecture.md
   - 更新 skills.md
   - 更新 system-integration.md

4. **记录**
   追加到 log.md

### 结果
一个 source 触发多个页面更新。

## 示例 2: 问答并写回

### 场景
用户问："如何配置 OpenClaw？"

### 步骤

1. **Query**
   AI 搜索相关页面

2. **Answer**
   生成答案

3. **评估**
   判断是否写回

4. **写回**
   创建配置指南页面

### 结果
好答案永久沉淀。

## 示例 3: 定期维护

### 场景
每周检查 wiki 健康度。

### 步骤

1. 运行 `auto-lint.sh`
2. 检查报告
3. 修复问题

### 结果
0 错误状态。

## 相关页面

- [[ingest]]
- [[query]]
- [[lint]]
- [[case-study]]
