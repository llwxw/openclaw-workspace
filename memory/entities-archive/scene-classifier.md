# Entity: scene-classifier

## 基本信息
- **最后更新**: 2026-04-13
- **状态**: 正常

## 更新日志

### 2026-04-13
**来源**: ephemeral/2026-04-13-13.jsonl

**事件**: 修复 numpy.float32 序列化错误，替换为 workspace 版本 Apr 13 新版

**详情**:
- 旧版 (Apr 10) 存在 numpy.float32 JSON 序列化 bug，导致 3105 端口 500 错误
- 修复：workspace 版本 api_server.py 加 `numpy → float` 类型转换
- 模型更新为 paraphrase-multilingual-mpnet-base-v2（Apr 13）
- 端口统一为 3105

**结论**: 3105 classifier 恢复正常，两个实例竞争问题已解决
