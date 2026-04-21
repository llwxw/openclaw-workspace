---
name: classifier-health
description: 分类器健康检查与自动恢复机制，包含服务健康检测、自动重连、熔断降级。触发词：分类服务健康检查、熔断、自动重连。
---

# Classifier Health - 分类器健康检查

## 功能

为 classifierClient.js 添加稳定性保障：
- 定期健康检查（30秒间隔）
- 自动重连逻辑（最多3次）
- 熔断机制（连续3次失败后降级）
- 规则分类器降级方案

## 触发词

- 分类服务挂了、分类服务不可用
- 健康检查、重连、熔断
- 分类器降级

## 实现

在 classifierClient.js 中添加：

```javascript
const HEALTH_CHECK_INTERVAL_MS = 30000;
const CIRCUIT_BREAKER_THRESHOLD = 3;
const MAX_RETRY = 3;

let failureCount = 0;
let circuitOpen = false;

// 健康检查
async function checkHealth() {
  try {
    const response = await fetch(HEALTH_URL, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  }
}

// 自动重连
async function reconnect(retries = MAX_RETRY) {
  for (let i = 0; i < retries; i++) {
    const healthy = await checkHealth();
    if (healthy) return true;
    await delay(RETRY_DELAY_MS);
  }
  return false;
}

// 熔断处理
if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
  circuitOpen = true;
  return ruleClassify(text); // 降级
}
```

## 参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| HEALTH_CHECK_INTERVAL_MS | 30000 | 健康检查间隔(ms) |
| CIRCUIT_BREAKER_THRESHOLD | 3 | 熔断阈值 |
| MAX_RETRY | 3 | 最大重试次数 |
| RETRY_DELAY_MS | 1000 | 重试间隔(ms) |
| CLASSIFY_TIMEOUT_MS | 300 | 分类超时(ms) |

## 测试

```bash
# 1. 检查服务状态
curl http://localhost:5000/health

# 2. 测试分类
curl -X POST http://localhost:5000/classify -d '{"text":"测试"}'

# 3. 查看日志
tail -f /path/to/logs/meta_events.jsonl
```

## 文件位置

- 修改: `/home/ai/openclaw-classifier/nodejs-integration/classifierClient.js`
- 集成: `/home/ai/openclaw-router/openclaw-router.js` (startHealthCheck)