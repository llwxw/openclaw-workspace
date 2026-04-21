# Claude Code 架构设计技能

**技能名称**: claude-code-architecture
**版本**: 1.0
**学习来源**: Claude Code v2.1.88 源码分析
**分析文件**: `src/main.tsx` (803KB), `src/entrypoints/cli.tsx` (39KB)

---

## 技能描述

本技能提供 Claude Code 的整体架构设计模式，包括：
- 程序启动流程与入口点设计
- 模块化架构与目录组织
- 快速路径与特性门控
- 状态管理与数据流
- 构建时优化策略

---

## 1. 程序启动流程

### 1.1 入口点链设计

```
src/entrypoints/cli.tsx (39KB)
  ↓ [快速路径处理]
  ↓ [动态导入]
src/main.tsx (803KB)
  ↓ [执行 cliMain()]
  ↓ [主循环]
REPL / QueryEngine
```

### 1.2 cli.tsx 快速路径处理

**设计原则**: 最小化模块加载，优化启动速度

| 快速路径 | 模块加载 | 功能 |
|---------|---------|------|
| `--version/-v/-V` | 0 | 版本输出 |
| `--dump-system-prompt` | 少量 | 系统提示词输出 |
| `--claude-in-chrome-mcp` | 按需 | Chrome MCP服务器 |
| `--chrome-native-host` | 按需 | Chrome原生主机 |
| `--daemon-worker` | 按需 | 守护进程工作器 |
| `remote-control` | 按需 | 远程控制 |
| `daemon` | 按需 | 守护进程 |
| `ps/logs/attach/kill` | 按需 | 会话管理 |
| `new/list/reply` | 按需 | 模板任务 |
| `environment-runner` | 按需 | BYOC运行器 |
| `self-hosted-runner` | 按需 | 自托管运行器 |
| `--worktree --tmux` | 按需 | Worktree + Tmux |
| **无特殊标记** | **全量** | **主程序** |

### 1.3 快速路径实现模式

```typescript
async function main(): Promise<void> {
  const args = process.argv.slice(2)

  // 1. 最快路径：版本输出 (0模块加载)
  if (args.length === 1 && (args[0] === '--version' || args[0] === '-v' || args[0] === '-V')) {
    console.log(`${MACRO.VERSION} (Claude Code)`)
    return
  }

  // 2. 加载启动分析器
  const { profileCheckpoint } = await import('../utils/startupProfiler.js')
  profileCheckpoint('cli_entry')

  // 3. 按需加载各个快速路径
  if (feature('DUMP_SYSTEM_PROMPT') && args[0] === '--dump-system-prompt') {
    // 动态导入所需模块
    const { enableConfigs } = await import('../utils/config.js')
    enableConfigs()
    // ...
    return
  }

  // 4. 更多快速路径...
  if (args[0] === 'remote-control' || args[0] === 'rc') {
    // ...
    return
  }

  // 5. 无特殊标记：加载主程序
  const { startCapturingEarlyInput } = await import('../utils/earlyInput.js')
  startCapturingEarlyInput()
  profileCheckpoint('cli_before_main_import')
  const { main: cliMain } = await import('../main.js')
  profileCheckpoint('cli_after_main_import')
  await cliMain()
  profileCheckpoint('cli_after_main_complete')
}
```

---

## 2. 特性门控与构建优化

### 2.1 feature() 函数与 DCE

```typescript
import { feature } from 'bun:bundle'

// 构建时死代码消除 (Dead Code Elimination)
if (feature('PROACTIVE') || feature('KAIROS')) {
  // 这个块在外部构建中会被完全消除
  const proactive = require('./commands/proactive.js').default
}

// 只有内部用户加载
const agentsPlatform =
  process.env.USER_TYPE === 'ant'
    ? require('./commands/agents-platform/index.js').default
    : null

// 动态导入 + 特性门控
const voiceCommand = feature('VOICE_MODE')
  ? require('./commands/voice/index.js').default
  : null
```

### 2.2 内部命令列表

```typescript
export const INTERNAL_ONLY_COMMANDS = [
  backfillSessions,
  breakCache,
  bughunter,
  commit,
  commitPushPr,
  ctx_viz,
  goodClaude,
  issue,
  initVerifiers,
  // ... 更多内部命令
].filter(Boolean)

// 仅内部用户加载
if (process.env.USER_TYPE === 'ant' && !process.env.IS_DEMO) {
  commands.push(...INTERNAL_ONLY_COMMANDS)
}
```

---

## 3. 模块化架构设计

### 3.1 核心目录结构

```
src/
├── entrypoints/              # 入口点层
│   ├── cli.tsx              # CLI入口 (39KB)
│   ├── init.ts              # 初始化
│   ├── mcp.ts               # MCP入口
│   └── sdk/                 # SDK入口
│
├── main.tsx                 # 主程序 (803KB) 🔥
│
├── commands.ts              # 命令系统 (25KB)
├── Tool.ts                  # 工具基类 (29KB)
├── QueryEngine.ts           # 查询引擎 (46KB)
├── query.ts                 # 查询模块 (68KB)
├── setup.ts                 # 初始化配置 (20KB)
│
├── cli/                     # CLI层
│   ├── handlers/            # 命令处理器
│   └── transports/          # 传输层
│       ├── SSETransport.ts  # Server-Sent Events
│       ├── WebSocketTransport.ts
│       ├── HybridTransport.ts  # 混合模式
│       └── ccrClient.ts     # 远程控制客户端
│
├── commands/                # 70+ 命令实现
│   ├── init/
│   ├── commit/
│   ├── review/
│   └── ... (70+个目录)
│
├── tools/                   # 43+ 工具实现
│   ├── BashTool/
│   ├── AgentTool/
│   ├── FileReadTool/
│   └── ... (43+个目录)
│
├── components/              # 144+ React组件
│   ├── messages/
│   ├── permissions/
│   ├── skills/
│   └── ...
│
├── hooks/                   # 100+ React Hooks
│
├── ink/                     # 终端UI渲染引擎
│   ├── components/
│   ├── hooks/
│   ├── layout/
│   └── termio/
│
├── state/                   # 状态管理
│   ├── AppState.tsx         # Context Provider
│   ├── AppStateStore.ts     # 默认状态
│   └── onChangeAppState.ts  # 状态变更处理
│
├── context/                 # React Context (9个)
│
├── services/                # 服务层
│   ├── analytics/           # 遥测系统
│   ├── compact/             # 上下文压缩
│   ├── mcp/                 # MCP集成
│   ├── remoteManagedSettings/  # 远程托管设置
│   ├── SessionMemory/       # 会话记忆
│   └── ...
│
├── skills/                  # 技能系统
│   └── bundled/             # 内置技能
│
├── utils/                   # 工具函数 (329文件)
│   ├── permissions/         # 权限系统
│   ├── git/
│   ├── github/
│   ├── model/
│   ├── memory/
│   └── ... (329个目录)
│
├── bootstrap/               # 启动引导
├── bridge/                  # 远程控制
├── assistant/               # 会话历史管理
├── buddy/                   # Buddy协作模式
├── coordinator/             # 协调模式
├── tasks/                   # 任务系统
├── plugins/                 # 插件系统
├── migrations/              # 数据迁移
└── types/                   # 类型定义
```

### 3.2 架构分层

```
┌─────────────────────────────────────────┐
│   User Interface (React / Ink)          │
│   - components/ (144+)                  │
│   - hooks/ (100+)                       │
│   - ink/ (终端UI引擎)                   │
├─────────────────────────────────────────┤
│   Command Layer                          │
│   - commands/ (70+命令)                 │
│   - commands.ts (注册)                   │
├─────────────────────────────────────────┤
│   Tool Layer                             │
│   - tools/ (43+工具)                    │
│   - Tool.ts (基类)                       │
├─────────────────────────────────────────┤
│   Service Layer                          │
│   - analytics/ (遥测)                    │
│   - compact/ (压缩)                      │
│   - mcp/ (MCP集成)                       │
│   - SessionMemory/ (记忆)                │
├─────────────────────────────────────────┤
│   State & Context                        │
│   - state/ (AppState)                   │
│   - context/ (9个Context)               │
├─────────────────────────────────────────┤
│   Transport Layer                        │
│   - cli/transports/ (SSE/WebSocket)    │
├─────────────────────────────────────────┤
│   Infrastructure                         │
│   - utils/ (329工具函数)                │
│   - plugins/ (插件系统)                  │
│   - skills/ (技能系统)                   │
└─────────────────────────────────────────┘
```

---

## 4. 核心设计模式

### 4.1 渐进式加载模式

```typescript
// 1. 最小化顶层导入
// cli.tsx 顶层导入极少，大部分是动态导入

// 2. 懒加载重型模块
const usageReport: Command = {
  type: 'prompt',
  name: 'insights',
  async getPromptForCommand(args, context) {
    // 仅在实际调用时才加载 113KB 的模块
    const real = (await import('./commands/insights.js')).default
    return real.getPromptForCommand(args, context)
  },
}

// 3. memoize 缓存昂贵操作
const loadAllCommands = memoize(async (cwd: string): Promise<Command[]> => {
  // 磁盘 I/O 操作结果被缓存
})
```

### 4.2 并行加载模式

```typescript
// 并行加载多个来源
const [
  { skillDirCommands, pluginSkills, bundledSkills, builtinPluginSkills },
  pluginCommands,
  workflowCommands,
] = await Promise.all([
  getSkills(cwd),           // 技能加载
  getPluginCommands(),      // 插件加载
  getWorkflowCommands ? getWorkflowCommands(cwd) : Promise.resolve([]),
])
```

### 4.3 安全优先设计

```typescript
// 1. 远程模式预过滤
export const REMOTE_SAFE_COMMANDS: Set<Command> = new Set([
  session, exit, clear, help, theme, // 仅UI相关命令
])

// 2. 桥接模式显式允许
export const BRIDGE_SAFE_COMMANDS: Set<Command> = new Set([
  compact, clear, cost, summary, files, // 显式允许列表
])

// 3. 可用性检查在启用检查之前
function meetsAvailabilityRequirement(cmd: Command): boolean {
  // 先检查可用性
}

function isCommandEnabled(cmd: Command): boolean {
  // 再检查是否启用
}
```

### 4.4 容错设计

```typescript
// 1. 技能加载失败不破坏系统
async function getSkills(cwd: string): Promise<{...}> {
  try {
    const [skillDirCommands, pluginSkills] = await Promise.all([
      getSkillDirCommands(cwd).catch(err => {
        logError(toError(err))
        return []  // 失败返回空数组
      }),
      getPluginSkills().catch(err => {
        logError(toError(err))
        return []  // 失败返回空数组
      }),
    ])
    return { skillDirCommands, pluginSkills, ... }
  } catch (err) {
    logError(toError(err))
    return {  // 总失败也返回空
      skillDirCommands: [],
      pluginSkills: [],
      bundledSkills: [],
      builtinPluginSkills: [],
    }
  }
}

// 2. 缓存独立管理
export function clearCommandMemoizationCaches(): void {
  loadAllCommands.cache?.clear?.()
  getSkillToolCommands.cache?.clear?.()
  getSlashCommandToolSkills.cache?.clear?.()
  clearSkillIndexCache?.()  // 显式清除外层缓存
}
```

---

## 5. Python 架构实现示例 (简化版)

```python
from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable, Optional, Protocol
from functools import lru_cache
import importlib
import logging
import sys

logger = logging.getLogger(__name__)

class FeatureGate:
    """特性门控（模拟）"""
    _features = set()
    
    @classmethod
    def enable(cls, feature: str):
        cls._features.add(feature)
    
    @classmethod
    def is_enabled(cls, feature: str) -> bool:
        return feature in cls._features

def feature(name: str) -> bool:
    """模拟 feature() 函数"""
    return FeatureGate.is_enabled(name)

@dataclass
class FastPath:
    """快速路径定义"""
    name: str
    arg_pattern: str
    handler: Callable
    load_modules: list[str] = None

class CLIEntrypoint:
    """CLI入口点"""
    
    def __init__(self):
        self.fast_paths: list[FastPath] = []
        self._register_fast_paths()
    
    def _register_fast_paths(self):
        """注册快速路径（按优先级）"""
        # 1. 最快路径：版本输出
        self.fast_paths.append(FastPath(
            name="version",
            arg_pattern="--version|-v|-V",
            handler=self._handle_version,
            load_modules=[]
        ))
        
        # 2. 系统提示词
        self.fast_paths.append(FastPath(
            name="dump-system-prompt",
            arg_pattern="--dump-system-prompt",
            handler=self._handle_dump_prompt,
            load_modules=["utils.config", "utils.model"]
        ))
        
        # 3. 远程控制
        self.fast_paths.append(FastPath(
            name="remote-control",
            arg_pattern="remote-control|rc|remote|sync|bridge",
            handler=self._handle_remote_control,
            load_modules=["bridge.bridgeMain"]
        ))
        
        # ... 更多快速路径
    
    def _handle_version(self, args: list[str]):
        """版本输出（0模块加载）"""
        print(f"1.0.0 (MyAssistant)")
        return True
    
    def _handle_dump_prompt(self, args: list[str]):
        """系统提示词输出"""
        from utils.config import enable_configs
        from utils.model import get_system_prompt
        enable_configs()
        print(get_system_prompt())
        return True
    
    def _handle_remote_control(self, args: list[str]):
        """远程控制"""
        from bridge.bridgeMain import bridge_main
        bridge_main(args[1:])
        return True
    
    def _match_arg_pattern(self, arg: str, pattern: str) -> bool:
        """匹配参数模式"""
        patterns = pattern.split("|")
        return arg in patterns
    
    def run(self):
        """执行入口点"""
        args = sys.argv[1:]
        
        # 1. 按优先级检查快速路径
        for path in self.fast_paths:
            if args and self._match_arg_pattern(args[0], path.arg_pattern):
                logger.debug(f"快速路径匹配: {path.name}")
                # 按需加载模块
                if path.load_modules:
                    for mod in path.load_modules:
                        importlib.import_module(mod)
                # 执行处理
                if path.handler(args):
                    return
        
        # 2. 无快速路径匹配：加载主程序
        logger.debug("加载主程序")
        from main import main
        main()

class ModularArchitecture:
    """模块化架构示例"""
    
    def __init__(self):
        self.commands = CommandRegistry()
        self.tools = ToolRegistry()
        self.services = ServiceLayer()
        self.state = AppState()
    
    def initialize(self):
        """初始化各层"""
        self.services.initialize()
        self.tools.initialize()
        self.commands.initialize()

class AppState:
    """状态管理（简化版）"""
    
    def __init__(self):
        self._state = {}
        self._listeners = []
    
    def get(self, key: str) -> Any:
        return self._state.get(key)
    
    def set(self, key: str, value: Any):
        old_value = self._state.get(key)
        self._state[key] = value
        for listener in self._listeners:
            listener(key, old_value, value)
    
    def subscribe(self, listener: Callable):
        self._listeners.append(listener)

# 使用示例
if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    
    # 特性门控配置
    FeatureGate.enable("PROACTIVE")
    FeatureGate.enable("VOICE_MODE")
    
    # 启动入口点
    cli = CLIEntrypoint()
    cli.run()
```

---

## 6. 架构设计原则

### 6.1 启动优化
- **最小化顶层导入**: 入口点尽可能少导入
- **快速路径优先**: 常见操作不走完整加载流程
- **动态导入**: 按需加载模块
- **memoize缓存**: 缓存磁盘I/O和计算密集操作

### 6.2 安全性
- **多层过滤**: 远程模式、桥接模式分别过滤
- **可用性先于启用**: 先检查用户是否可用，再检查是否启用
- **显式允许列表**: 安全敏感操作需要显式允许

### 6.3 可扩展性
- **多来源命令**: 内置、技能、插件、MCP灵活组合
- **动态添加**: 运行时可以添加新技能
- **特性门控**: 构建时和运行时双重控制

### 6.4 容错性
- **优雅降级**: 技能/插件加载失败不破坏系统
- **独立缓存**: 各层缓存独立管理
- **错误隔离**: 快速路径和主程序错误隔离

---

## 7. 关键学习点

1. **启动优化**: 快速路径 + 动态导入 = 极快启动
2. **特性门控**: 构建时DCE + 运行时检查 = 灵活发布
3. **模块化**: 清晰分层 + 职责分离 = 易维护
4. **安全优先**: 多层过滤 + 显式允许 = 安全可靠
5. **容错设计**: 优雅降级 + 独立缓存 = 高可用

---

*技能生成时间: 2026-04-07 10:40*
