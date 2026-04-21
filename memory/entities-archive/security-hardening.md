---
title: Security Hardening
type: concept
status: reference
last_updated: 2026-04-11
tags: [security, hardening, protection]
---

# 🛡️ Security Hardening

> 安全加固

## 安全检查清单

### 文件权限

```bash
# Wiki 目录权限
chmod -R 700 memory/
chmod -R 600 memory/*.md

# .git 目录保护
chmod -R 700 memory/.git
```

### Git 安全

```bash
# .gitignore 确保包含
echo "raw/secrets/" >> .gitignore
echo "*.key" >> .gitignore
echo ".env" >> .gitignore

# 敏感历史清除 (如果误提交)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch *.key' \
  --prune-empty --tag-name-filter cat -- --all
```

---

## Wiki 运行时

| 安全措施 | 说明 |
|----------|------|
| 本地运行 | 不暴露到公网 |
| 定期备份 | 防止数据丢失 |
| 访问控制 | 文件系统权限 |

---

## 敏感信息检查

```bash
# 扫描敏感词
grep -rE "(password|secret|key|token|apikey)" memory/entities/ || echo "✅ 无敏感信息"

# 扫描 IP 地址
grep -rE "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" memory/
```

---

## 相关页面

- [[privacy-security]] — 隐私安全

---

*最后更新：2026-04-11*