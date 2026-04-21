# Entity: SRE 自我调控系统

> 更新: 2026-04-20

## 核心状态

| 指标 | 值 | 状态 |
|------|-----|------|
| n (负载率) | 0.34 | ✅ <0.5 |
| H (健康度) | 0.660 | ✅ >0.5 |
| q (队列) | ~15 | 适中 |
| zone | safe | ✅ |
| fuse | N | ✅ |
| unified | stable(NORMAL) | ✅ |

## 关键文件

| 文件 | 用途 |
|------|------|
| `/home/ai/.openclaw/sre-agent/collect-metrics.py` | 核心控制器 |
| `/home/ai/.openclaw/sre-agent/README.md` | 系统文档 |
| `/home/ai/.openclaw/sre-agent/STABILITY_PROOF.md` | 稳定性证明 |
| `/home/ai/.openclaw/sre-agent/test_sre.py` | 单元测试 (27/27) |
| `/home/ai/.openclaw/sre-agent/test_integration.py` | 集成测试 (7/7) |

## 架构

```
┌─────────────────────────────────────────────┐
│           collect-metrics.py                  │
├─────────┬─────────┬─────────┬───────────────┤
│ 漂移检测 │ EWMA滤波 │ SAGI   │ 熔断器        │
│ drift    │ H/n平滑  │ 负载控制 │ fuse         │
├─────────┼─────────┼─────────┼───────────────┤
│ 慢性漂移  │ 快慢分离  │ n<0.5  │ 紧急降载     │
└─────────┴─────────┴─────────┴───────────────┘
```

## 核心指标

| 指标 | 公式 | 目标 | 说明 |
|------|------|------|------|
| n | q/max_c | <0.5 | 负载率，核心控制目标 |
| H | 0.6×load_health + 0.4×quality_health | >0.5 | 健康度 |
| L | min(n/2, 1) | <0.5 | 负载度 |

## 五态分类

| 状态 | 条件 | 控制 |
|------|------|------|
| stable | H>0.5且L<0.5 | 常规运行 |
| warning | H<0.5 | 深度分析 |
| overload | L>0.5且H>0.4 | SAGI降增益 |
| diverging | H<0.4且L>0.5 | 熔断 |
| drifting | 其他 | 提高采样 |

## 关键修复 (2026-04-20)

### 1. SAGI maxcf 方向
- **问题**: critical区maxcf=0.25导致n增大
- **修复**: maxcf=2.0 (提高容量)
- **依据**: n=q/max_c

### 2. LAUNCH冷却
- **问题**: timeout后立即重入
- **修复**: 60s冷却期

### 3. mode_note保护
- **问题**: LAUNCH notes被覆盖
- **修复**: 添加保护判断

### 4. 统一状态机
- **问题**: classify和SAGI独立
- **修复**: get_unified_state()合并

## 描述函数 K(n)

| 参数 | 值 | 来源 |
|------|-----|------|
| K_max | 0.95 | 经验 |
| n_max | 8.0 | 经验 |
| p | 2.0 | 经验 |

**注意**: K(n)只做预警，不做控制决策。n<0.5是稳定性保证。

## 测试命令

```bash
# 单元测试
python3 /home/ai/.openclaw/sre-agent/test_sre.py

# 集成测试
python3 /home/ai/.openclaw/sre-agent/test_integration.py

# 查看状态
cat /home/ai/.openclaw/metrics/ewma_state.json
```

## 稳定性条件

1. **容量条件**: max_c ≥ 2×max(q)
2. **滞环条件**: SPAWN_ON - SPAWN_OFF > 5
3. **冷却条件**: 冷却期 ≥ 60秒
4. **熔断条件**: fuse恢复需连续3次safe

## 教训

1. n<0.5是理论保证，不依赖K(n)
2. 观察数据≠实验数据，不能强行拟合
3. 系统已可交付使用

## 状态文件

- `memory/2026-04-20-session-summary.md` - session总结
- `SRE_STATUS.md` - 完整工作记录 (workspace/)
