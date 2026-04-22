# Self-Improving Skill

> 学习回路：捕获错误 → 记录 → 避免

## 功能
- 记录错误、纠正、学习
- 生成错误提醒
- 注入 bootstrap

## 使用
```javascript
import { recordError, recordCorrection, generateSelfImproveContext } from './self_improve.js';

recordError(new Error('xxx'), 'context');
recordCorrection('wrong', 'correct', 'reason');

const context = generateSelfImproveContext();
```
