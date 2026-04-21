---
title: Macros
type: process
status: draft
last_updated: 2026-04-11
tags: [macros, automation, scripts]
---

# 🧬 Macros

> 自动化宏

## 常用宏

### 自动添加相关链接

```python
# auto-link.py
# 为页面自动添加相关页面链接

import os
import re

def add_related_links(page):
    with open(page) as f:
        content = f.read()
    
    # 提取当前页面的关键词
    words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', content)
    
    # 查找可链接的页面
    for other in os.listdir('.'):
        if other.endswith('.md') and other != page:
            for word in words:
                if word.lower() in other.lower():
                    content += f"\n- [[{other[:-3]}]] (自动关联)"
    
    with open(page, 'w') as f:
        f.write(content)
```

### 自动更新目录

```bash
#!/bin/bash
# 自动更新 MEMORY.md 索引
echo "| 页面 | 描述 |" > temp.md
echo "|------|------|" >> temp.md
for f in *.md; do
  title=$(head -1 $f | sed 's/# //')
  echo "| [$title]($f) | 自动 |" >> temp.md
done
```

---

## 相关页面

- [[automation-scripts]] — 脚本
- [[page-templates]] — 模板

---

*最后更新：2026-04-11*