# Session: 2026-04-07 14:46:33 UTC

- **Session Key**: agent:main:main
- **Session ID**: eae78e69-c803-4fff-98c7-9478df7667a3
- **Source**: webchat

## Conversation Summary

assistant: 



assistant: 



assistant: 

目前系统中**与记忆/向量存储相关的插件**只有这两个：

---

## 🧠 记忆/存储相关插件

| 插件 | 状态 | 功能 |
|------|------|------|
| **memory-core** | ❌ 已禁用 | 核心记忆搜索插件，提供基础的记忆存取 API |
| **memory-lancedb** | ❌ 已禁用 | LanceDB 向量数据库后端，支持语义搜索、自动召回 |

### 两者关系：
```
memory-core (大脑) + memory-lancedb (记忆仓库)
```

启用后你可以：
- 用自然语言搜索历史对话
- 记住跨会话的上下文
- 自动捕获重要信息

---

## 📦 其他类似插件？

查看全部 95 个插件，**没有其他类似的记忆/向量存储插件**。

但有几个相关的：

| 插件 | 状态 | 关系 |
|------|------|------|
| **huggingface** | ✅ 已加载 | 提供 embedding 模型（用于生成向量） |
| **feishu-wiki** | ✅ 已加载 | 飞书知识库工具（外部知识源，非内部记忆） |

---

## 🔧 如果需要更多记忆功能

目前 OpenClaw 内置的记忆方案就是这两个插件。没有其他内置替代品。

如果你想用其他向量数据库（如 Qdrant、Chroma、Pinecone），需要自行扩展开发。

---

需要我帮你**启用这两个插件**吗？ 🦐
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Tue 2026-04-07 22:17 GMT+8] 启用
assistant: 

好，我来启用这两个插件：

assistant: 



assistant: 



assistant: 



user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Tue 2026-04-07 22:25 GMT+8] ？
assistant: 



assistant: 



assistant: 

看到问题了！**memory-lancedb 启动失败**：

```
ERROR: Unsupported embedding model: bge-m3:latest
```

你本地的 Ollama 没有安装 `bge-m3` 模型。让我看看你有什么模型：

assistant: 



assistant: 



assistant: 



