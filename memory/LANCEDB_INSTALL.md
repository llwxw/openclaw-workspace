# LanceDB 插件安装指南

> 升级记忆检索性能从默认的 SQLite 到向量数据库

## 当前状态 (2026-04-04)

- **当前插件**: memory-core (默认 SQLite) ✅ 正常工作
- **升级目标**: LanceDB (向量检索) ❌ 暂不可用

### 已知问题

LanceDB 插件加载失败，报错：
```
Error: ENOENT: no such file or directory, open 
'/home/ai/.nvm/versions/node/v22.22.1/lib/node_modules/openclaw/dist/package.json'
```

这是 OpenClaw 框架级 bug，插件内部路径解析问题。

### 尝试过的方案

1. 配置 embedding 使用本地 Ollama 的 bge-m3 模型 ✅ 可行
2. 添加 plugins.slots.memory 指向 memory-lancedb ❌ 仍报错
3. 启用后 doctor 检查显示 plugin 加载失败

## 安装步骤 (待框架修复后使用)

### 1. 确保有 embedding API

**方案A: OpenAI (付费)**
```json
{
  "embedding": {
    "apiKey": "env:OPENAI_API_KEY",
    "model": "text-embedding-3-small"
  }
}
```

**方案B: 本地 Ollama (免费)**
```json
{
  "embedding": {
    "apiKey": "dummy-key-for-local-ollama",
    "model": "bge-m3",
    "baseUrl": "http://172.23.96.1:11434"
  }
}
```
> 注：本地需要先安装 bge-m3 模型：`ollama pull bge-m3`

### 2. 修改配置

编辑 `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "memory-lancedb": {
        "enabled": true,
        "config": {
          "embedding": {
            "apiKey": "dummy-key-for-local-ollama",
            "model": "bge-m3",
            "baseUrl": "http://172.23.96.1:11434"
          },
          "dbPath": "/home/ai/.openclaw/memory-lancedb",
          "autoCapture": true,
          "autoRecall": true,
          "captureMaxChars": 5000
        }
      }
    },
    "slots": {
      "memory": "memory-lancedb"
    }
  }
}
```

### 3. 验证

```bash
openclaw plugins doctor
# 或
openclaw gateway restart && openclaw memory search "测试"
```

## 当前替代方案

memory-core (SQLite) 足够日常使用，支持：
- 关键词搜索
- 全文检索
- 模块化 MEMORY.md 加载

等到框架修复后再升级。

---

*最后更新: 2026-04-04*