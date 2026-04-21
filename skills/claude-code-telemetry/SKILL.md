# Claude Code Telemetry Skill

> 遥测与监控最佳实践 - 基于 Claude Code 源码分析

## 一、概述

Claude Code 采用了双层日志管道架构，结合本地日志和远程遥测，实现了全面的监控能力。

## 二、核心模块

### 2.1 日志基础设施

```
src/services/analytics/
├── index.ts              # 主入口
├── config.ts             # 配置
├── datadog.ts            # Datadog 集成
├── firstPartyEventLogger.ts    # 第一方事件日志
├── firstPartyEventLoggingExporter.ts
├── growthbook.ts         # Feature Flag
├── metadata.ts           # 元数据
├── sink.ts               # 日志接收器
└── sinkKillswitch.ts     # 开关控制
```

### 2.2 核心设计

#### 双层日志管道

```
用户操作 → 本地日志 (console/file)
         → 远程遥测 (Analytics)
              ↓
         Datadog / 自定义后端
```

#### 事件类型

- **会话事件**: 会话开始/结束、错误
- **工具事件**: 工具调用、耗时、结果
- **性能事件**: API 调用、Token 消耗
- **用户事件**: 交互、反馈

### 2.3 关键代码

#### 事件日志接口 (index.ts)

```typescript
// 事件日志函数
export function logEvent(
  eventName: string,
  metadata?: Record<string, any>,
  options?: LogOptions
): void {
  // 本地日志
  console.log(`[Event] ${eventName}`, metadata);
  
  // 远程遥测
  if (isEnabled()) {
    sendToRemote(eventName, metadata, options);
  }
}
```

#### Datadog 集成 (datadog.ts)

```typescript
import { datadogLogs } from '@datadog/browser-logs';

// 初始化
datadogLogs.init({
  clientToken: config.datadogToken,
  site: 'datadoghq.com',
  service: 'claude-code',
  env: process.env.NODE_ENV,
});

// 自定义日志
datadogLogs.addLoggerGlobalContext('sessionId', sessionId);
datadogLogs.logger.info('Tool executed', {
  toolName,
  duration: endTime - startTime,
});
```

### 2.4 Feature Flag (GrowthBook)

```typescript
// src/services/analytics/growthbook.ts
import { useFeature } from '@growthbook/growthbook-react';

export function getFeatureValue<T>(key: string, defaultValue: T): T {
  const feature = useFeature(key);
  return feature?.value ?? defaultValue;
}

// 使用示例
const useAutoCompact = getFeatureValue('auto_compact', false);
const maxTokens = getFeatureValue('max_tokens', 4096);
```

## 三、最佳实践

### 3.1 日志级别

| 级别 | 使用场景 |
|------|----------|
| DEBUG | 开发调试信息 |
| INFO | 常规操作 |
| WARN | 警告信息 |
| ERROR | 错误信息 |

### 3.2 敏感数据处理

```typescript
// PII 脱敏
function sanitizeForLogging(data: any): any {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  return sanitizedData;
}

// 事件过滤
function shouldLogEvent(eventName: string): boolean {
  const excluded = ['sensitive_operation', 'debug_data'];
  return !excluded.includes(eventName);
}
```

### 3.3 性能监控

```typescript
// 性能计时器
function withPerformanceTracking<T>(
  operation: string,
  fn: () => T
): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const duration = performance.now() - start;
    logEvent('operation_completed', {
      operation,
      duration: Math.round(duration),
    });
  }
}
```

## 四、遥测数据示例

```json
{
  "event": "tool_execution",
  "timestamp": "2026-04-07T12:00:00Z",
  "session_id": "sess_abc123",
  "data": {
    "tool_name": "file_read",
    "duration_ms": 45,
    "success": true,
    "file_size": 1024
  }
}
```

## 五、集成指南

### 5.1 添加新事件

```typescript
import { logEvent } from '../services/analytics/index.js';

// 在需要的地方调用
logEvent('custom_event', {
  key: 'value',
});
```

### 5.2 添加性能追踪

```typescript
import { trackPerformance } from '../services/analytics/performance.js';

async function trackedFunction() {
  using track = trackPerformance('my_operation');
  // ... 执行逻辑
}
```

## 六、总结

Claude Code 的遥测系统提供了：
- ✅ 完整的日志管道（本地 + 远程）
- ✅ 多后端支持（Datadog、自定义）
- ✅ Feature Flag 动态配置
- ✅ PII 脱敏保护
- ✅ 性能监控集成

---
*基于 Claude Code 源码分析生成 - 2026-04-07*