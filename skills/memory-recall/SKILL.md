# Memory Recall Skill

> AI 主动回忆之前的学习和任务

## 功能

1. 读取 ephemeral 最近 24 小时的任务记录
2. 读取 entities 中的重要信息
3. 生成上下文摘要，供 AI 在对话前使用

## 工作流程

```
ephemeral/ → recall.js → memory/recall/last_recall.md
                                    ↓
                            AI 每次对话前注入
```

## 使用方式

```javascript
import { generateRecallContext, getRecallContext } from './recall.js';

// 生成新 recall（每小时自动调用）
generateRecallContext(24);

// 获取现有 recall
getRecallContext();
```

## 触发方式

- 通过 hook 在每次对话前调用
- 或通过 cron 定期更新
