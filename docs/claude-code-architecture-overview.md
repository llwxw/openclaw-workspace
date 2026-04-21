# Claude Code 架构概览

**分析时间**: 2026-04-07 10:26 (GMT+8)
**源码路径**: `/mnt/d/aafuzhi/4.7/collection-claude-code-source-code-main`
**文件统计**: 4016个文件

---

## 1. 程序启动流程

### 1.1 入口点链
```
1. src/entrypoints/cli.tsx (39KB)
   ↓
2. 动态导入 main.tsx (803KB)
   ↓
3. 执行 cliMain()
```

### 1.2 cli.tsx 快速路径处理
`cli.tsx` 包含多个快速路径，按优先级处理：

| 快速路径 | 功能 |
|---------|------|
| `--version/-v/-V` | 版本输出（0模块加载） |
| `--dump-system-prompt` | 系统提示词输出（仅内部） |
| `--claude-in-chrome-mcp` | Chrome MCP服务器 |
| `--chrome-native-host` | Chrome原生主机 |
| `--computer-use-mcp` | 计算机使用MCP |
| `--daemon-worker` | 守护进程工作器 |
| `remote-control/rc/remote/sync/bridge` | 远程控制 |
| `daemon [subcommand]` | 守护进程 |
| `ps/logs/attach/kill` | 会话管理 |
| `new/list/reply` | 模板任务 |
| `environment-runner` | BYOC运行器 |
| `self-hosted-runner` | 自托管运行器 |
| `--worktree --tmux` | Worktree + Tmux |

### 1.3 特性门控（Feature Flags）
使用 `feature()` 函数进行构建时死代码消除（DCE）：
- `ABLATION_BASELINE`
- `DUMP_SYSTEM_PROMPT`
- `CHICAGO_MCP`
- `DAEMON`
- `BRIDGE_MODE`
- `BG_SESSIONS`
- `TEMPLATES`
- `BYOC_ENVIRONMENT_RUNNER`
- `SELF_HOSTED_RUNNER`

---

## 2. 核心目录结构

```
src/
├── entrypoints/          # 入口点 (cli.tsx, init.ts, mcp.ts)
├── main.tsx              # 主程序 (803KB)
├── commands.ts           # 命令系统 (25KB)
├── Tool.ts               # 工具系统 (29KB)
├── QueryEngine.ts        # 查询引擎 (46KB)
├── query.ts              # 查询模块 (68KB)
├── setup.ts              # 初始化配置 (20KB)
│
├── cli/                  # CLI层
│   ├── handlers/         # 命令处理器
│   └── transports/       # 传输层 (SSE, WebSocket, Hybrid)
│
├── commands/             # 70+ 命令实现
├── tools/                # 43+ 工具实现
├── components/           # 144+ React组件
├── hooks/                # 100+ React Hooks
├── ink/                  # 终端UI渲染引擎
│
├── state/                # 状态管理
├── context/              # React Context (9个)
├── services/             # 服务层
│   ├── analytics/        # 遥测系统
│   ├── compact/          # 上下文压缩
│   ├── mcp/              # MCP集成
│   ├── remoteManagedSettings/  # 远程托管设置
│   └── ...
│
├── bootstrap/            # 启动引导
├── bridge/               # 远程控制
├── assistant/            # 会话历史管理
├── buddy/                # Buddy协作模式
├── coordinator/          # 协调模式
├── skills/               # 技能系统
├── tasks/                # 任务系统
│
├── utils/                # 工具函数 (329文件)
├── constants/            # 常量定义
├── types/                # 类型定义
├── migrations/           # 数据迁移
└── ...
```

---

## 3. 核心模块识别

### 3.1 关键入口文件
| 文件 | 大小 | 功能 |
|------|------|------|
| `src/main.tsx` | 803KB | 主程序入口 |
| `src/entrypoints/cli.tsx` | 39KB | CLI入口点 |
| `src/commands.ts` | 25KB | 命令系统定义 |
| `src/Tool.ts` | 29KB | 工具基类 |
| `src/QueryEngine.ts` | 46KB | 查询引擎 |
| `src/query.ts` | 68KB | 查询模块 |

### 3.2 核心服务目录
- `src/cli/transports/` - 传输层
- `src/services/analytics/` - 遥测
- `src/services/compact/` - 上下文压缩
- `src/services/mcp/` - MCP集成
- `src/state/` - 状态管理
- `src/utils/permissions/` - 权限系统
- `src/bridge/` - 远程控制

---

## 4. 下一步分析计划

### 阶段1已完成
- ✅ 源码位置确认
- ✅ 入口点分析
- ✅ 目录结构识别
- ✅ 核心文件标记

### 阶段2目标
1. 分析 `src/main.tsx` 主循环
2. 分析 `src/commands.ts` 命令系统
3. 分析 `src/Tool.ts` 工具基类
4. 分析 `src/cli/transports/` 传输层
5. 分析 `src/state/` 状态管理

---

*文档生成时间: 2026-04-07 10:26*
