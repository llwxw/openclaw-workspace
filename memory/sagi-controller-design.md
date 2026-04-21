# 萨奇图增益调度控制器设计文档

> 基于钱学森《工程控制论》第十章 - 描述函数法
> 版本: v1.0 | 更新: 2026-04-19

## 1. 理论背景

### 1.1 萨奇图（Sagi-Chart）

萨奇图是描述函数法在工程控制系统中的可视化工具。
非线性环节的描述函数 N(A) 与线性环节频率响应 G(jω) 的交点决定系统稳定性。

**关键不等式（稳定性判据）**：
- 当 |N(A)| < 1/|G(jω)| 时，系统稳定
- 当 |N(A)| > 1/|G(jω)| 时，系统自激振荡（不稳定）

### 1.2 饱和非线性

OpenClaw的派发系统本质上是**饱和非线性**：
- 输入：并发任务数 q_curr
- 增益：描述函数 N(A)
- 阈值：SPAWN_ON / SPAWN_OFF（双稳态滞环）

**饱和非线性的描述函数**（基波分量近似）：
```
N(A) ≈ (2/π) · [arcsin(1/A) + √(A²-1)/A²]   当 A ≥ 1
N(A) ≈ (4/π) · A                              当 A < 1（过载区）
```

其中 A 是输入振幅的标准化度量。

## 2. 指标体系

### 2.1 核心指标

| 指标 | 定义 | 含义 |
|------|------|------|
| q_curr | 当前小时ephemeral会话数 | 实时任务到达率 |
| n_proxy | q_curr / baseline_q (baseline=5) | 标准化并发强度 |
| sr | score≥40的会话比例 | 派发活跃度 |
| H | 0.6×(1-q/30) + 0.4×sr/0.3 | 健康度（负载健康60% + 质量健康40%）|
| L | min(n_proxy/2, 1.0) | 负载度 |

**H公式修正（v3, 2026-04-19）**：原公式H=0.6×sr+0.4×(1-q/30)在sr=0时H≤0.4，导致stable区(H>0.7)永远无法达到。
新公式将H分解为独立的负载健康度和质量健康度：
- 负载健康度=1-q/30（q=0时=1, q=30时=0）
- 质量健康度=sr/0.3（sr≥0.3时=1, sr=0时=0）
- H=0.6×负载+0.4×质量

### 2.2 萨奇图区域定义（v2 - 3-zone模型）

| 区域 | n_proxy范围 | 含义 | 增益因子 | SPAWN_ON调整 |
|------|------------|------|---------|-------------|
| safe | ≤ 0.5 | n<0.5绝对稳定（第八章）| 1.0 | +0 |
| elevated | 0.5 ~ 0.8 | 条件稳定区 | 0.6 | -8 |
| critical | > 0.8 | 临界振荡区，最低增益 | 0.25 | -15 |

**v2更新（2026-04-19）**：
- 合并 desaturation/overload → elevated（辨识发现边界附近样本聚集）
- 用P33/P67分位数确定边界：safe≤0.3, elevated≤0.8

### 2.3 区域判断

```python
def get_sagi_zone(n_proxy):
    if n_proxy <= 0.3:   return "safe"
    elif n_proxy <= 0.8: return "elevated"
    else:                  return "critical"
```

## 3. 控制器设计

### 3.1 增益调度表

| 区域 | SPAWN_ON调整 | SPAWN_OFF调整 | max_c乘数 | 增益因子 |
|------|-------------|--------------|----------|---------|
| safe | +0 | +0 | ×1.0 | 1.0 |
| elevated | -8 | -8 | ×0.6 | 0.60 |
| critical | -15 | -12 | ×0.25 | 0.25 |

### 3.2 触发条件

**区域切换触发（连续3次同区域）**：
```
zone_consecutive[zone] ≥ 3 AND zone ≠ last_adjusted_zone
→ 调整 SPAWN_ON, SPAWN_OFF, max_c
```

**恢复触发（连续3次回到safe）**：
```
zone == "safe" AND last_adjusted_zone ≠ "safe"
AND zone_consecutive["safe"] ≥ 3
→ 恢复默认值 SPAWN_ON=45, SPAWN_OFF=38, max_c=5
```

### 3.3 滞环设计

使用**描述函数滞环**防止颤震：
- SPAWN_ON > SPAWN_OFF（gap=7分）
- 连续性判断（3次同区域）避免偶然抖动
- 恢复需要连续safe，不存在"撤销"操作，只能自然恢复

### 3.4 熔断机制（Fuse）

**触发条件**：
```
H < 0.4 AND L > 0.8  连续3次
→ fuse_triggered = True
→ max_c 降到 1
```

**恢复条件**：
```
fuse_triggered == True
AND H > 0.5 AND L < 0.5 连续3次
→ fuse_triggered = False
→ 恢复正常增益
```

## 4. 文件结构

```
~/.openclaw/sre-agent/
  collect-metrics.py   # 主脚本：采集 + 萨奇图调度 + 熔断
  sagi-visualize.py     # HTML可视化生成
  phase-plane-monitor.py # 每小时状态报告

~/.openclaw/metrics/
  system_metrics.jsonl  # 时序指标数据
  ewma_state.json      # 萨奇图zone连续计数
  fuse_state.json      # 熔断状态
  sagi_chart.html      # 萨奇图可视化（浏览器打开）

~/.openclaw/memory/
  CONTROL_META.yaml    # 控制参数（阈值/模式）
```

## 5. 已知局限

### 5.1 阈值未从数据中辨识

当前萨奇图边界（0.3/0.6/0.8）是**工程经验值**，而非通过系统振荡数据辨识得出。
真实萨奇图边界应由以下步骤确定：
1. 注入小幅扰动（让超低分会话通过）
2. 观察系统响应是否出现振荡
3. 用输入-输出数据拟合描述函数

### 5.2 n_proxy的定义依赖基线

n_proxy = q_curr / 5 中的基线5是假设值。真实基线应通过历史数据统计确定（如P50/P90）。

### 5.3 H的定义代理了质量

H = 0.6·sr + 0.4·(1 - q_curr/30) 中的sr（派发率）不能完全反映系统健康度。
更好的质量指标应基于：
- 任务完成率（而非派发率）
- 平均响应延迟
- 用户满意度

### 5.3 超时自动恢复

防止阈值被永久压制。当萨奇图触发降增益后：

1. **SUPPRESSION_TIMEOUT = 10 cycles（约10分钟）**
2. 若连续10个cycle仍在 elevated/safe 区（未回到 safe 恢复）：
   → 每cycle将阈值 +2/SPAWN_ON、+1/max_c，渐进恢复到默认值
3. 恢复触发后重置计数器

```
触发场景：16:34 critical → 阈值压至最低
10分钟后：系统在 elevated（q_curr=3） → 自动开始渐进恢复
```

**防止"阈值压制过久"的问题**。


### 5.2 在线辨识工具

萨奇图边界需要从实测数据中持续校准。使用 `sagi-identify.py`:

```bash
python3 ~/.openclaw/sre-agent/sagi-identify.py status   # 当前辨识状态
python3 ~/.openclaw/sre-agent/sagi-identify.py fit     # 从24h数据拟合边界
python3 ~/.openclaw/sre-agent/sagi-identify.py probe --zone elevated  # 注入测试脉冲
```

辨识算法：
1. 收集24h内所有 n_proxy 值
2. 计算P33/P67分位数
3. 若边界附近超过30%样本聚集 → 建议调整
4. 调整后记录到 `metrics/sagi_identify.jsonl`

**v2边界调整（2026-04-19）**：
- 合并 desaturation/overload → elevated（辨识发现样本在0.3-0.6边界聚集）
- 新边界：safe≤0.3, elevated≤0.8, critical>0.8

## 6. 调参指南

### 6.1 调整萨奇图边界

修改 `collect-metrics.py` 中的 `SAGI_ZONES` 列表：
```python
SAGI_ZONES = [
    (0.0, NEW_SAFE_BOUND,  "safe",         0,    0,    1.0,  1.0),
    ...
]
```

### 6.2 调整增益调度强度

修改各区域的增益因子和阈值调整量：
```python
(0.3,  0.6,  "desaturation", -NEW_DON, -NEW_DOFF, NEW_MAXCF, NEW_GF)
```

### 6.3 调整熔断门槛

修改熔断触发条件：
```python
is_diverging = (H < NEW_H_THRESHOLD and L > NEW_L_THRESHOLD)
```

## 7. 验证方法

### 7.1 人工触发过载

```bash
# 模拟高并发
for i in $(seq 1 20); do
  python3 -c "print('x'*1000)" &
done
```

### 7.2 检查日志

```bash
tail -f ~/.openclaw/metrics/collect.log | grep sagi
tail -f ~/.openclaw/metrics/fuse_state.json
```

### 7.3 观察萨奇图

在浏览器打开：
```
file:///home/ai/.openclaw/metrics/sagi_chart.html
```

---

*本控制器是萨奇图理论的工程近似，阈值需根据实际运行数据持续调优。*
