---
title: Output Formats
type: concept
status: active
last_updated: 2026-04-11
tags: [output, format, presentation]
---

# 📤 Output Formats

> Wiki 答案的输出形式

## 标准格式

| 格式 | 适用场景 | 工具 |
|------|----------|------|
| **Markdown 页面** | 综合性答案、概念解释 | 纯文本 |
| **对比表格** | X vs Y、选项比较 | Markdown table |
| **幻灯片** | 演示、分享 | Marp |
| **图表** | 数据可视化 | Python/matplotlib |
| **Canvas** | 脑图、思维导出 | 外部工具 |

---

## Markdown 页面

```markdown
# 主题

> 一句话总结

## 概览
...

## 详细
...

## 相关页面
- [[link]] — 描述
```

---

## 对比表格

```markdown
| 特性 | 方案A | 方案B | 方案C |
|------|-------|-------|-------|
| 性能  | 高    | 中    | 低    |
| 成本  | 高    | 中    | 低    |
| 易用  | 低    | 高    | 高    |
```

---

## 幻灯片 (Marp)

```markdown
---
marp: true
---

# Slide Title

- Point 1
- Point 2

---

## Second Slide
```

**Obsidian 插件**: Marp

---

## 图表

```python
import matplotlib.pyplot as plt

plt.bar(['A', 'B', 'C'], [10, 20, 15])
plt.savefig('chart.png')
```

---

## 决策原则

| 答案类型 | 推荐格式 |
|----------|----------|
| 定义/概念 | Markdown 页面 |
| 选择比较 | 对比表格 |
| 演示/分享 | Marp 幻灯片 |
| 数据分析 | 图表 |
| 关联思考 | 写回 Wiki 页面 |

---

## 写回 Wiki 的判断

好的答案应该写回 wiki 当：
- 有独特洞见
- 综合了多个来源
- 可能被再次问到
- 连接了已有知识

---

## 相关页面

- [[ingest]] — 摄取流程
- [[obsidian]] — IDE

---

*最后更新：2026-04-11*