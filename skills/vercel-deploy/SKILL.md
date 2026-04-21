---
name: vercel-deploy
description: Deploy and manage Vercel projects. Use when deploying applications to Vercel, managing environment variables, checking deployment status, viewing logs.
---

# Vercel 部署与管理

## 概述

管理 Vercel 项目的基础设施工具集，包括部署、环境变量管理和日志监控。

## 配置

### Vercel Token 设置

1. 访问 https://vercel.com/account/tokens 创建 Token
2. 设置环境变量：
```bash
export VERCEL_TOKEN="your-token-here"
```

## 操作

### 部署

```bash
# 预览部署
./scripts/vercel_deploy.sh --project 项目名 --preview

# 正式环境部署
./scripts/vercel_deploy.sh --project 项目名 --production
```

### 环境变量管理

```bash
# 列出环境变量
./scripts/vercel_env.sh --project 项目名 --list

# 设置环境变量
./scripts/vercel_env.sh --project 项目名 --set --key 键名 --value 值 --envproduction

# 删除环境变量
./scripts/vercel_env.sh --project 项目名 --delete --key 键名 --env production
```

### 状态查看

```bash
# 最新部署状态
./scripts/vercel_status.sh --project 项目名

# 特定部署状态
./scripts/vercel_status.sh --deployment 部署ID
```

### 日志查看

```bash
# 部署日志
./scripts/vercel_logs.sh --deployment 部署ID

# 函数日志
./scripts/vercel_logs.sh --project 项目名 --function 函数名
```

## 权限

- Network: Vercel API (api.vercel.com)
- 依赖: curl, jq

## 安全最佳实践

- Token 作用域：使用项目范围的 Token
- 定期轮换
- 永远不要提交 Token 到 Git
