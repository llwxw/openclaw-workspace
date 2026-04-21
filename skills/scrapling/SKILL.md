# Scrapling Skill

> 自适应 Web 爬取框架，用于绕过反爬虫保护

## 安装

```bash
pip install scrapling
```

## 使用

```python
from scrapling import Fetcher, Parser

# 获取页面
fetcher = Fetcher()
response = fetcher.get("https://example.com")

# 解析内容
parser = Parser(response.text)
titles = parser.get_text("h1")
```

## MCP 服务器（可选）

如需 MCP 接口：
```bash
pip install scrapling-fetch-mcp
scrapling-fetch-mcp
```

## 配置

无默认配置，按需调整 fetcher 和 parser 参数。

---
version: 1.0