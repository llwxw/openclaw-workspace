---
name: intent-enhancer
description: 增强意图检测识别隐式任务，包括故障类、问题描述类关键词和正则模式匹配。触发词：故障/卡顿/异常等问题识别。
---

# Intent Enhancer - 隐式任务识别

## 功能

增强 intentDetector.js 的意图检测，识别隐式任务：
- 故障类关键词（服务器挂了、报错了等）
- 问题描述类关键词（很卡、很慢、出问题了等）
- 正则模式匹配

## 触发词

- 故障类：起不来、挂了、崩溃、报错、连不上、超时、卡住、故障、宕机
- 问题描述：很卡、很慢、反应慢、出问题了、有问题
- 求助类：怎么办、怎么解决、求助、帮忙看看

## 实现

在 intentDetector.js 中添加：

```javascript
const RULE = {
  faultKeywords: /(起不来|无法启动|启动失败|挂了|崩溃|报错|出错|连不上|超时|卡住|没反应|异常|故障|宕机|怎么办|怎么解决|求助|帮忙看看|很卡|卡|慢|反应慢|响应慢|有问题|出问题了|出故障)/i,
  faultPatterns: [
    /(服务器|服务|进程|应用|数据库|容器|网站|系统).*(起不来|挂了|无法启动|启动失败|崩溃|宕机)/i,
    /(数据库|mysql|redis|mongodb|nginx).*(连不上|连接超时|报错|异常)/i,
    /(磁盘|硬盘|空间|内存|cpu).*(满了|不足|占用|爆了)/i,
    /.*(起不来|挂了|不工作|没反应|异常了)$/i,
    /(怎么办|怎么解决|求助|帮忙看看)/i
  ]
};

function ruleBasedScore(message) {
  let score = 0;
  // ... 原有关键词 ...
  // 新增：故障关键词
  if (RULE.faultKeywords.test(message)) score += 2;
  // 新增：故障模式
  for (const pattern of RULE.faultPatterns) {
    if (pattern.test(message)) {
      score += 2;
      break;
    }
  }
  return score;
}
```

## 测试用例

| 输入 | 预期结果 |
|------|----------|
| 服务器起不来了 | isTask=true |
| 我的电脑很卡 | isTask=true |
| 系统出问题了 | isTask=true |
| 今天天气怎么样 | isTask=false |
| 帮我分析代码 | isTask=true |

## 文件位置

- 修改: `/home/ai/openclaw-router/intentDetector.js`
- 备份: `/home/ai/openclaw-router/intentDetector.js.bak`