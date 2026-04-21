---
title: Privacy Security
type: concept
status: reference
last_updated: 2026-04-11
tags: [privacy, security, sensitive]
---

# 🔒 Privacy & Security

> 敏感信息处理

## 原则

| 原则 | 说明 |
|------|------|
| **不存敏感** | 密码、密钥、隐私不放 Wiki |
| **本地优先** | 不上传到云服务 |
| **选择性同步** | 仅同步公共内容 |

---

## 敏感信息类型

| 类型 | 示例 | 处理 |
|------|------|------|
| 认证信息 | API Key, 密码 | ❌ 不存 Wiki |
| 个人隐私 | 地址、电话 | ❌ 不存 Wiki |
| 商业机密 | 客户信息 | ❌ 不存 Wiki |
| 工作文件 | 项目文档 | ⚠️ 视情况 |
| 技术笔记 | 代码、配置 | ✅ 可以 |

---

## 安全实践

### 本地存储

```bash
# Wiki 存储在本地
~/memory/entities/

# 不使用云同步 (如需同步，用私人仓库)
```

### Git 隐私

```bash
# .gitignore 排除敏感
echo "raw/secrets/" >> .gitignore
echo "*.key" >> .gitignore
```

### 分享时

- 只分享特定页面
- 导出前检查敏感信息
- 使用 Obsidian 的"分享当前视图"

---

## Wiki vs 云服务

| 服务 | 风险 |
|------|------|
| Notion | 数据在云端 |
| Roam | 数据在云端 |
| Obsidian (本地) | 数据在本地 ✅ |
| LLM Wiki (本地) | 数据在本地 ✅ |

---

## 特殊场景

| 场景 | 建议 |
|------|------|
| Team Wiki | 明确哪些可分享 |
| 公开研究 | 去除个人辨识信息 |
| 备份 | 加密后再上传 |

---

## 相关页面

- [[git]] — 版本控制
- [[team-wiki]] — 团队 Wiki

---

*最后更新：2026-04-11*