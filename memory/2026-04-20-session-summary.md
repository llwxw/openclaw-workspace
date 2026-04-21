# 2026-04-20 SRE 系统调试 session summary

<!-- summary-only -->

## 主题
OpenClaw SRE 自我调控系统修复与完善

## 关键决策

### 1. SAGI maxcf 方向错误
- **问题**：critical 区 maxcf=0.25 导致 n 增大，系统更不稳定
- **修复**：改为 maxcf=2.0，提高容量使 n 降低
- **依据**：n = q/max_c，提高分母才能降低 n

### 2. LAUNCH 冷却机制
- **问题**：timeout 退出后立即重入 LAUNCH
- **修复**：添加 60s 冷却期
- **问题**：还发现 suppressed_cycles 未重置

### 3. mode_note 被覆盖
- **问题**：LAUNCH mode_note 被 SAGI zone block 覆盖
- **修复**：添加 LAUNCH mode_note 保护

### 4. classify diverging 不可达
- **问题**：elif H < 0.5 先触发，diverging 永远不到
- **修复**：调整判断顺序，diverging 优先

### 5. K(n) 拟合失败
- **尝试**：用历史数据拟合 K(n) = K_max*(1-(n/n_max)^p)
- **问题**：样本不足(15点)、数据异质、拟合不稳定
- **结论**：恢复经验参数 n_max=8.0, p=2.0

### 6. 统一状态机
- **问题**：classify(H,L) 和 SAGI(n) 两个独立回路
- **修复**：创建 get_unified_state() 合并两个回路

## 当前系统状态

| 指标 | 值 | 状态 |
|------|-----|------|
| q | 17 | 适中 |
| n | 0.34 | ✅ <0.5 |
| H | 0.660 | ✅ >0.5 |
| zone | safe | ✅ |
| fuse | N | ✅ |
| unified | stable(NORMAL) | ✅ |

## 关键文件

- `/home/ai/.openclaw/sre-agent/collect-metrics.py` - 核心控制器
- `/home/ai/.openclaw/sre-agent/README.md` - 系统文档
- `/home/ai/.openclaw/sre-agent/STABILITY_PROOF.md` - 稳定性证明
- `/home/ai/.openclaw/sre-agent/test_sre.py` - 单元测试 27/27
- `/home/ai/.openclaw/sre-agent/test_integration.py` - 集成测试 7/7
- `/home/ai/.openclaw/sre-agent/verify_kn.py` - K(n) 验证框架
- `/home/ai/.openclaw/sre-agent/calibrate_kn.py` - K(n) 标定实验设计

## K(n) 参数

| 参数 | 值 | 来源 |
|------|-----|------|
| K_max | 0.95 | 经验 |
| n_max | 8.0 | 经验 |
| p | 2.0 | 经验 |
| **重要** | K(n) 只做预警，不做控制决策 |

## 待跟进

1. **24h 监控报告** - Cron 已设置，等待结果
2. **K(n) 标定** - 需要受控实验，当前数据不足
3. **真实负载测试** - q=0-17，系统空闲，未经历高负载

## 教训

1. 不要用不适合拟合的数据强行拟合
2. n<0.5 稳定性是理论保证，不依赖 K(n)
3. "完成大于完美" - 系统已可交付

---
*summary generated at end of session*
