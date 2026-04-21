---
name: superpowers
description: Spec-first, TDD, subagent-driven software development workflow.
---

# Superpowers AI 编码工作流

## 概述

强制性的、规范优先的 TDD 工作流，利用子代理进行头脑风暴、规划并执行稳健的软件开发任务。

## 工作流程

### Phase 1: 头脑风暴 (Brainstorming)
- 分析项目背景
- 提供 2-3 个方案及权衡
- 编写设计文档
- **硬性门槛：设计批准前不写代码**

### Phase 2: 编写计划 (Writing Plans)
- 详细的逐任务实施计划
- 每个任务 2-5 分钟：写测试 → 失败 → 实现 → 通过 → 提交

### Phase 3: 子代理驱动开发 (Subagent-Driven Development)
- sessions_spawn 实现子代理
- 规范审查员验证
- 代码质量审查员验证
- TDD 强制执行

### Phase 4: 系统化调试 (Systematic Debugging)
- 根本原因调查
- 模式分析
- 假设 + 测试
- 修复 + 验证

### Phase 5: 完成分支 (Finishing Branch)
- 验证所有测试通过
- 合并或创建 PR

## 核心原则

- 一次只问一个问题
- TDD 始终 - 先写失败的测试
- YAGNI - 移除不必要的功能
- DRY - 无重复
- 系统化 > 临时化
- 证据 > 声明
- 频繁提交 - 每次绿色测试后

## 使用场景

- 构建新应用程序或功能
- 解决复杂的 Bug 或测试失败
- 编排多个子代理并行处理
- 管理功能分支的端到端生命周期

## 数据架构

```
docs/plans/YYYY-MM-DD-<topic>-design.md  # 高层设计文档
docs/plans/YYYY-MM-DD-<feature>.md       # 实施计划
```

## 子代理分发模式

使用 sessions_spawn 分发实现或审查子代理：

```
Goal: [一句话目标]
Context: [为什么重要，哪个计划文件]
Files: [精确路径]
Constraints: [不要做什么]
Verify: [如何确认成功]
Task: [计划中的完整任务]
```
