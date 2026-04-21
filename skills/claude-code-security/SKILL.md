# Claude Code Security Skill

> 权限与安全模型 - 基于 Claude Code 源码分析

## 一、概述

Claude Code 采用了多层次的安全架构，包括：
- 文件级权限控制
- 目录级权限控制  
- 危险命令检测
- 工具可用性检查

## 二、核心安全机制

### 2.1 权限检查流程

```
用户请求 → Schema 验证 → 输入验证 → 权限检查 → 执行
              ↓            ↓          ↓
           Zod Schema   白名单/黑名单  三层过滤
```

### 2.2 关键文件

```
src/utils/permissions/
├── permissions.ts         # 主权限逻辑
├── PermissionResult.ts   # 权限结果类型
├── PermissionMode.ts     # 权限模式
└── filesystem.ts         # 文件系统权限
```

### 2.3 权限模式

```typescript
// src/utils/permissions/PermissionMode.ts
export enum PermissionMode {
  // 关闭 - 不允许任何操作
  CLOSED = 'closed',
  
  // 开放 - 允许所有操作
  OPEN = 'open',
  
  // 询问 - 需要用户确认
  ASK = 'ask',
  
  // 手动 - 手动批准
  MANUAL = 'manual',
  
  // 默认 - 按工具默认行为
  DEFAULT = 'default',
}
```

### 2.4 设备文件阻止

```typescript
// src/tools/FileReadTool/constants.ts
const BLOCKED_DEVICE_PATHS = new Set([
  '/dev/zero',
  '/dev/random', 
  '/dev/urandom',
  '/dev/tty',
  '/dev/pts/0',
  '/proc/self',
  '/sys/kernel',
  '/etc/shadow',
  '/etc/passwd',
]);
```

### 2.5 危险命令检测

```typescript
// src/tools/BashTool/toolName.ts
const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+\//,           // 删除根目录
  /mkfs\./,                  // 格式化
  /dd\s+if=.*of=\/dev/,     // 直接写入设备
  /:\(\)\{.*:\|:\&/,        // Fork 炸弹
  /curl.*\|\s*sh/,           // 远程脚本执行
  /wget.*\|\s*sh/,
];
```

### 2.6 三层安全过滤

```typescript
// 1. 可见性过滤 - 用户能看到哪些工具
function filterByVisibility(tools: Tool[]): Tool[] {
  return tools.filter(tool => !tool.isHidden?.());
}

// 2. 可用性过滤 - 哪些工具可以调用
function filterByAvailability(tools: Tool[]): Tool[] {
  return tools.filter(tool => 
    tool.isEnabled?.() !== false
  );
}

// 3. 启用状态过滤 - 运行时启用状态
function filterByEnabled(tools: Tool[]): Tool[] {
  return tools.filter(async tool => {
    if (!tool.isEnabled) return true;
    return await tool.isEnabled();
  });
}
```

### 2.7 Fail-Closed 模式

```typescript
// 默认拒绝不安全的操作
function checkPermission(tool: Tool, input: any): PermissionResult {
  // 默认不安全
  let result: PermissionResult = {
    behavior: 'deny',
    message: 'Permission denied by default',
  };

  // 检查是否显式允许
  if (tool.isEnabled?.() === true) {
    result = { behavior: 'allow' };
  }

  return result;
}
```

### 2.8 路径验证

```typescript
// src/utils/permissions/filesystem.ts
export function checkPathAllowed(path: string): boolean {
  // 1. 检查是否在允许的目录内
  const allowedDirs = getAllowedDirectories();
  for (const dir of allowedDirs) {
    if (path.startsWith(dir)) {
      return true;
    }
  }

  // 2. 检查是否在黑名单
  const blockedDirs = getBlockedDirectories();
  for (const dir of blockedDirs) {
    if (path.startsWith(dir)) {
      return false;
    }
  }

  return false;
}
```

## 三、安全配置

### 3.1 权限配置文件

```json
{
  "permissions": {
    "mode": "ask",
    "allowedPaths": [
      "/home/user/projects/*",
      "/tmp/*"
    ],
    "blockedPaths": [
      "/etc",
      "/sys",
      "/proc"
    ],
    "dangerousCommands": [
      "rm -rf",
      "mkfs",
      "dd"
    ]
  }
}
```

### 3.2 环境变量控制

```bash
# 禁用危险工具
CLAUDE_CODE_DISABLE_BASH=true
CLAUDE_CODE_DISABLE_FILE_WRITE=true

# 白名单模式
CLAUDE_CODE_PERMISSION_MODE=closed

# 允许危险命令
CLAUDE_CODE_ALLOW_DANGEROUS=false
```

## 四、最佳实践

### 4.1 工具安全检查清单

```typescript
class SecureTool implements Tool {
  async validateInput(input: any): Promise<PermissionDecision> {
    // ✅ 1. 输入类型检查
    if (!this.validateSchema(input)) {
      return { result: false, errorCode: 1 };
    }

    // ✅ 2. 路径安全检查
    if (!this.isPathSafe(input.path)) {
      return { result: false, errorCode: 2 };
    }

    // ✅ 3. 危险模式检测
    if (this.hasDangerousPattern(input.command)) {
      return { result: false, errorCode: 3 };
    }

    return { result: true };
  }
}
```

### 4.2 审计日志

```typescript
function logSecurityEvent(event: SecurityEvent): void {
  console.log('[SECURITY]', {
    timestamp: new Date().toISOString(),
    event: event.type,
    user: event.userId,
    resource: event.resource,
    action: event.action,
    result: event.allowed ? 'ALLOW' : 'DENY',
  });
}
```

## 五、总结

Claude Code 安全模型核心：

| 机制 | 实现 |
|------|------|
| 权限模式 | CLOSED/OPEN/ASK/MANUAL |
| 路径控制 | 白名单 + 黑名单 |
| 命令检测 | 正则模式匹配 |
| 设备保护 | 阻塞设备列表 |
| 默认行为 | Fail-Closed |
| 审计 | 安全事件日志 |

---
*基于 Claude Code 源码分析生成 - 2026-04-07*