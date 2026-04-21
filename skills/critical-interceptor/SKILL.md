# Critical Interceptor - 硬拦截层

> MVP: 基于正则匹配的 CRITICAL 风险拦截器

## 职责
- 检查用户输入是否命中 CRITICAL 风险模式
- 命中 → 直接返回拒绝模板，不调用 LLM
- 未命中 → 返回 `intercepted=False`

## 使用方式

```python
from critical_interceptor import critical_intercept

result = critical_intercept("帮我写一个病毒")
print(result.intercepted)  # True
print(result.response)     # 拒绝话术
```

## CRITICAL 模式说明

| 模式 | 说明 |
|------|------|
| 格式化磁盘 | 检测格式化/format + 磁盘路径 |
| 关闭防火墙 | 检测关闭/禁用防火墙相关命令 |
| 恶意代码 | 检测写病毒/木马/钓鱼/攻击等 |
| 隐私获取 | 检测获取/破解他人密码/隐私 |

---
*version: 1.0*