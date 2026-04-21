# Entity: v8-scorer

## 基本信息
- **最后更新**: 2026-04-13
- **状态**: 正常

## 更新日志

### 2026-04-13
**来源**: ephemeral/2026-04-13-13.jsonl

**事件**: 修复 text 字段不兼容，增加 prompt||text 兼容层

**详情**:
- gateway hook 发送 `{ text: "..." }` 格式
- v8 scorer 原生只认 `{ prompt: "..." }` 字段
- 修复：src/router/api.js 加 `const promptText = prompt || text`
- 3103 端口：3103，正常服务

**结论**: 评分链路完全通畅
