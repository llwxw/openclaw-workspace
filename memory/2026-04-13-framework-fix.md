# 2026-04-13 框架修复记录

## 时间
2026-04-13 GMT+8

## 背景
本次 session 全程围绕框架修复和记忆系统设计。

---

## 已修复

### 1. 3104 classifier（scene-classifier）
- **问题**：500 Internal Server Error（numpy.float32 无法 JSON 序列化）
- **修复**：修改 `classify` endpoint 返回前，将 `numpy.float32/double` → `float`
- **额外**：统一到 workspace skill 版本，端口改为 3104，模型为 Apr 13 新版 paraphrase-multilingual-mpnet-base-v2
- **状态**：✅ 正常工作

### 2. 3103 scorer（v8-scorer）
- **问题**：只认 `prompt` 字段，不认 `text` 字段，gateway hook 发送的是 `text`
- **修复**：在 `src/router/api.js` 加 `const promptText = prompt || text` 兼容层
- **状态**：✅ 正常工作

### 3. openclaw-router
- **问题**：缺少核心依赖（`@isaced/ai-router`、`clients/v8Client.js`），从未成功部署
- **决定**：disable systemd service，不再尝试修复（不是核心链路）
- **状态**：❌ 已停用

### 4. cron 配置
- 新增：wiki-auto-learn（每小时）
- 新增：memory-keeper（每天4点）
- 新增：memory-maintain（每天3点）
- 禁用：weather_report（飞书群ID失效）
- 移除：openclaw-router @reboot

---

## 新增功能：两层记忆系统

### 设计
```
hook 实时捕获 → ephemeral/ (metadata only)
session-summary → LLM 提炼 → MEMORY.md + entity 升格
```

### 触发条件（满足任一）
- `text` 包含：记住/以后都/决定用/别用/改用
- `intercepted === true`
- `scene === 'fault_recovery'`
- `factors.risk >= 3`
- `recommendedStrategy === 'MEGA_TASK'`

### 修改的文件
- `~/.openclaw/hooks/auto-score-classify/handler.js`（加 ephemeral 写入）
- `~/.openclaw/hooks/session-summary/handler.js`（加 ephemeral 读取 + entity 升格）

---

## 待验证（下次 /new 时）
- [ ] session-summary 生成摘要文件
- [ ] bootstrap 读取摘要注入新 session
- [ ] ephemeral 内容被正确提炼

---

## 框架评审结论
- 分类 ✅
- 评分 ✅  
- 记忆层 ✅（新系统部署）
- cron ✅
- 链路完整性 ⚠️（待 /new 验证）
