# Entity: framework

## 基本信息
- **最后更新**: 2026-04-13 14:11
- **状态**: 核心链路已通，记忆系统已部署

## 组件状态
| 组件 | 端口 | 状态 |
|------|------|------|
| gateway | 3102 | ✅ 正常 |
| v8-scorer | 3103 | ✅ 正常 |
| scene-classifier | 3105 | ✅ 正常 |
| context-api | 3101 | ✅ 正常 |
| openclaw-router | - | ❌ 已停用 |

## 重要结论

### bootstrap 注入机制
- AGENTS.md 里的 bootstrap 规则只是写在文件里的指令，系统没有自动执行
- 修复：改写 self-improving hook（handler.js），在 bootstrap 时注入 MEMORY.md + 最近3个摘要
- **验证方式**：下次 /new 时，如果新 session 主动提到本次内容，说明链路通

### 两层记忆系统
- **第一层**：auto-score-classify hook 实时写入 ephemeral/（已验证通过）
- **第二层**：session-summary 触发时提炼 + entity 升格
- **触发条件**：keyword/intercepted/fault_recovery/risk>=3/MEGA_TASK

## 更新日志

### 2026-04-13 14:00
**来源**: 当前 session

**事件**:
1. 3105 classifier 修好（numpy序列化 + Apr 13新版），端口统一3105
2. 3103 scorer 修好（text字段兼容，src/router/api.js）
3. openclaw-router disable（缺核心依赖，判定半成品）
4. cron 重配（wiki/memory-keeper/memory-maintain）
5. 两层记忆系统部署完成
6. self-improving hook 改写（MEMORY.md注入）
7. gateway 重启，实时记忆验证通过

## 待跟进
- [ ] /new 时验证 bootstrap 注入
- [ ] /new 时验证 session-summary 提炼
