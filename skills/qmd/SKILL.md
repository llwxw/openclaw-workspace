# QMD - Query Memory Documents

> 多维度记忆搜索

## 功能
- 按主题索引 memory 文档
- 关键词搜索
- 时间范围过滤

## 使用
```javascript
import { searchDocuments, generateQMDContext } from './query_memory.js';

const results = searchDocuments('关键词', { type: 'entity', limit: 5 });
const context = generateQMDContext('关键词');
```

## CLI
```bash
node query_memory.js search <关键词>
```
