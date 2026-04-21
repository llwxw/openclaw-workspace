# Claude Code 命令系统设计技能

**技能名称**: claude-code-commands
**版本**: 1.0
**学习来源**: Claude Code v2.1.88 源码分析
**分析文件**: `src/commands.ts` (754行)

---

## 技能描述

本技能提供 Claude Code 命令系统的完整设计模式，包括：
- 命令类型系统
- 命令注册与发现机制
- 特性门控与条件加载
- 命令安全过滤（远程模式、桥接模式）
- 技能与命令的集成

---

## 命令类型系统

### Command 类型 (核心)

Claude Code 有三种主要命令类型：

| 类型 | 说明 |
|------|------|
| `prompt` | AI驱动的命令，生成提示词给模型 |
| `local` | 本地执行命令，纯文本输出 |
| `local-jsx` | 本地React组件命令，渲染UI |

### 命令基本结构

```typescript
type Command = {
  // 基本信息
  name: string
  aliases?: string[]
  description: string
  type: 'prompt' | 'local' | 'local-jsx'
  source: 'builtin' | 'skills' | 'plugin' | 'bundled' | 'mcp'
  
  // 加载来源
  loadedFrom?: 'skills' | 'plugin' | 'bundled' | 'commands_DEPRECATED' | 'mcp'
  
  // 可用性控制
  availability?: Array<'claude-ai' | 'console'>
  isEnabled?(): boolean
  
  // Prompt命令特有
  getPromptForCommand?(args: string[], context: CommandContext): Promise<string>
  
  // 技能相关
  kind?: 'workflow'
  hasUserSpecifiedDescription?: boolean
  whenToUse?: string
  disableModelInvocation?: boolean
  
  // 其他
  contentLength?: number
  progressMessage?: string
  pluginInfo?: PluginInfo
}
```

---

## 命令注册与发现

### 1. 命令来源优先级

```typescript
// 命令加载顺序（优先级从高到低）
const commandOrder = [
  ...bundledSkills,              // 内置技能
  ...builtinPluginSkills,         // 内置插件技能
  ...skillDirCommands,            // 目录技能 (./skills/)
  ...workflowCommands,            // 工作流命令
  ...pluginCommands,              // 插件命令
  ...pluginSkills,                // 插件技能
  ...COMMANDS(),                   // 内置命令 (70+)
]
```

### 2. 动态命令加载

```typescript
// 使用 memoize 缓存加载结果
const loadAllCommands = memoize(async (cwd: string): Promise<Command[]> => {
  const [
    { skillDirCommands, pluginSkills, bundledSkills, builtinPluginSkills },
    pluginCommands,
    workflowCommands,
  ] = await Promise.all([
    getSkills(cwd),           // 并行加载技能
    getPluginCommands(),      // 并行加载插件
    getWorkflowCommands ? getWorkflowCommands(cwd) : Promise.resolve([]),
  ])
  
  return [
    ...bundledSkills,
    ...builtinPluginSkills,
    ...skillDirCommands,
    ...workflowCommands,
    ...pluginCommands,
    ...pluginSkills,
    ...COMMANDS(),
  ]
})
```

### 3. 命令获取入口

```typescript
async function getCommands(cwd: string): Promise<Command[]> {
  const allCommands = await loadAllCommands(cwd)
  const dynamicSkills = getDynamicSkills()  // 运行时发现的动态技能
  
  // 基础过滤
  const baseCommands = allCommands.filter(
    _ => meetsAvailabilityRequirement(_) && isCommandEnabled(_),
  )
  
  // 插入动态技能（去重）
  const baseCommandNames = new Set(baseCommands.map(c => c.name))
  const uniqueDynamicSkills = dynamicSkills.filter(
    s => !baseCommandNames.has(s.name) && 
         meetsAvailabilityRequirement(s) && 
         isCommandEnabled(s),
  )
  
  // 在插件技能后、内置命令前插入动态技能
  const builtInNames = new Set(COMMANDS().map(c => c.name))
  const insertIndex = baseCommands.findIndex(c => builtInNames.has(c.name))
  
  return insertIndex === -1
    ? [...baseCommands, ...uniqueDynamicSkills]
    : [
        ...baseCommands.slice(0, insertIndex),
        ...uniqueDynamicSkills,
        ...baseCommands.slice(insertIndex),
      ]
}
```

---

## 特性门控与条件加载

### 1. 构建时死代码消除 (DCE)

```typescript
// 使用 feature() 函数进行构建时消除
const proactive =
  feature('PROACTIVE') || feature('KAIROS')
    ? require('./commands/proactive.js').default
    : null

const briefCommand =
  feature('KAIROS') || feature('KAIROS_BRIEF')
    ? require('./commands/brief.js').default
    : null

// 只有内部用户才加载的命令
const agentsPlatform =
  process.env.USER_TYPE === 'ant'
    ? require('./commands/agents-platform/index.js').default
    : null
```

### 2. 可用性检查

```typescript
function meetsAvailabilityRequirement(cmd: Command): boolean {
  if (!cmd.availability) return true
  
  for (const a of cmd.availability) {
    switch (a) {
      case 'claude-ai':
        if (isClaudeAISubscriber()) return true
        break
      case 'console':
        // 仅直接 API 用户可用
        if (
          !isClaudeAISubscriber() &&
          !isUsing3PServices() &&
          isFirstPartyAnthropicBaseUrl()
        ) return true
        break
    }
  }
  return false
}
```

### 3. 内部命令列表

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
  // ...更多内部命令
].filter(Boolean)
```

---

## 命令安全过滤

### 1. 远程模式安全命令

```typescript
// 仅影响本地 TUI 状态，不依赖本地文件系统/Git/Shell
export const REMOTE_SAFE_COMMANDS: Set<Command> = new Set([
  session,    // 显示远程会话二维码
  exit,       // 退出 TUI
  clear,      // 清屏
  help,       // 显示帮助
  theme,      // 更改主题
  color,      // 更改颜色
  vim,        // Vim 模式切换
  cost,       // 会话成本
  usage,      // 使用信息
  copy,       // 复制消息
  btw,        // 快速笔记
  feedback,   // 发送反馈
  plan,       // 计划模式
  keybindings,// 快捷键管理
  statusline, // 状态栏切换
  stickers,   // 贴纸
  mobile,     // 移动二维码
])

// 远程模式预过滤
function filterCommandsForRemoteMode(commands: Command[]): Command[] {
  return commands.filter(cmd => REMOTE_SAFE_COMMANDS.has(cmd))
}
```

### 2. 桥接模式安全命令

```typescript
// 从远程控制桥接安全执行的本地命令
export const BRIDGE_SAFE_COMMANDS: Set<Command> = new Set(
  [
    compact,      // 压缩上下文
    clear,        // 清除会话记录
    cost,         // 显示成本
    summary,      // 对话摘要
    releaseNotes, // 变更日志
    files,        // 列出跟踪文件
  ].filter((c): c is Command => c !== null),
)

// 判断命令是否桥接安全
function isBridgeSafeCommand(cmd: Command): boolean {
  if (cmd.type === 'local-jsx') return false  // UI命令阻塞
  if (cmd.type === 'prompt') return true       // Prompt命令安全
  return BRIDGE_SAFE_COMMANDS.has(cmd)         // 本地命令需显式允许
}
```

---

## 技能与命令集成

### 1. 技能工具命令

```typescript
// SkillTool 显示所有模型可调用的 prompt 命令
const getSkillToolCommands = memoize(
  async (cwd: string): Promise<Command[]> => {
    const allCommands = await getCommands(cwd)
    return allCommands.filter(
      cmd =>
        cmd.type === 'prompt' &&
        !cmd.disableModelInvocation &&
        cmd.source !== 'builtin' &&
        (cmd.loadedFrom === 'bundled' ||
          cmd.loadedFrom === 'skills' ||
          cmd.loadedFrom === 'commands_DEPRECATED' ||
          cmd.hasUserSpecifiedDescription ||
          cmd.whenToUse),
    )
  },
)
```

### 2. 斜杠命令技能

```typescript
// 过滤出纯技能命令
const getSlashCommandToolSkills = memoize(
  async (cwd: string): Promise<Command[]> => {
    try {
      const allCommands = await getCommands(cwd)
      return allCommands.filter(
        cmd =>
          cmd.type === 'prompt' &&
          cmd.source !== 'builtin' &&
          (cmd.hasUserSpecifiedDescription || cmd.whenToUse) &&
          (cmd.loadedFrom === 'skills' ||
            cmd.loadedFrom === 'plugin' ||
            cmd.loadedFrom === 'bundled' ||
            cmd.disableModelInvocation),
      )
    } catch (error) {
      logError(toError(error))
      return []  // 技能加载失败不破坏整个系统
    }
  },
)
```

### 3. 缓存管理

```typescript
// 清除命令缓存（保留技能缓存）
function clearCommandMemoizationCaches(): void {
  loadAllCommands.cache?.clear?.()
  getSkillToolCommands.cache?.clear?.()
  getSlashCommandToolSkills.cache?.clear?.()
  clearSkillIndexCache?.()  // 必须显式清除外层缓存
}

// 完全清除所有缓存
function clearCommandsCache(): void {
  clearCommandMemoizationCaches()
  clearPluginCommandCache()
  clearPluginSkillsCache()
  clearSkillCaches()
}
```

---

## Python 实现示例 (简化版)

```python
from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable, Optional, Protocol
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

class CommandType(Enum):
    PROMPT = "prompt"
    LOCAL = "local"
    LOCAL_JSX = "local-jsx"

class CommandSource(Enum):
    BUILTIN = "builtin"
    SKILLS = "skills"
    PLUGIN = "plugin"
    BUNDLED = "bundled"
    MCP = "mcp"

@dataclass
class Command:
    name: str
    description: str
    type: CommandType
    source: CommandSource
    aliases: list[str] = None
    loaded_from: str = None
    is_enabled: Callable[[], bool] = None
    availability: list[str] = None
    
    def is_available(self) -> bool:
        """检查命令是否可用"""
        if not self.availability:
            return True
        # 实现可用性检查逻辑
        return True

class CommandRegistry:
    def __init__(self):
        self._commands: list[Command] = []
        self._dynamic_skills: list[Command] = []
    
    @lru_cache(maxsize=1)
    def get_commands(self, cwd: str) -> list[Command]:
        """获取所有可用命令（带缓存）"""
        all_commands = self._load_all_commands(cwd)
        base_commands = [
            cmd for cmd in all_commands
            if cmd.is_available() and (cmd.is_enabled is None or cmd.is_enabled())
        ]
        
        # 插入动态技能
        if self._dynamic_skills:
            base_names = {cmd.name for cmd in base_commands}
            unique_skills = [
                skill for skill in self._dynamic_skills
                if skill.name not in base_names and 
                   skill.is_available() and 
                   (skill.is_enabled is None or skill.is_enabled())
            ]
            # 在适当位置插入
            return self._insert_dynamic_skills(base_commands, unique_skills)
        
        return base_commands
    
    def _load_all_commands(self, cwd: str) -> list[Command]:
        """加载所有来源的命令（优先级顺序）"""
        # 实现并行加载
        commands = []
        commands.extend(self._get_bundled_skills())
        commands.extend(self._get_skill_dir_commands(cwd))
        commands.extend(self._get_plugin_commands())
        commands.extend(self._get_builtin_commands())
        return commands
    
    def _insert_dynamic_skills(self, base: list[Command], skills: list[Command]) -> list[Command]:
        """插入动态技能到正确位置"""
        builtin_names = {cmd.name for cmd in self._get_builtin_commands()}
        insert_idx = next(
            (i for i, cmd in enumerate(base) if cmd.name in builtin_names),
            len(base)
        )
        return base[:insert_idx] + skills + base[insert_idx:]
    
    def add_dynamic_skill(self, skill: Command):
        """添加运行时发现的动态技能"""
        self._dynamic_skills.append(skill)
        self.get_commands.cache_clear()  # 清除缓存
    
    def clear_cache(self):
        """清除所有缓存"""
        self.get_commands.cache_clear()

# 安全过滤
def filter_remote_safe(commands: list[Command]) -> list[Command]:
    """远程模式安全过滤"""
    remote_safe = {"session", "exit", "clear", "help", "theme", "color"}
    return [cmd for cmd in commands if cmd.name in remote_safe]

def is_bridge_safe(cmd: Command) -> bool:
    """桥接模式安全判断"""
    if cmd.type == CommandType.LOCAL_JSX:
        return False
    if cmd.type == CommandType.PROMPT:
        return True
    bridge_safe = {"compact", "clear", "cost", "summary", "files"}
    return cmd.name in bridge_safe
```

---

## 设计原则

### 1. 渐进式加载
- 使用 `memoize` 缓存昂贵的磁盘 I/O 操作
- 动态导入减少启动时间
- 懒加载重型模块（如 insights.ts 113KB）

### 2. 安全优先
- 远程模式预过滤命令
- 桥接模式显式允许列表
- 内部命令仅内部用户可用

### 3. 灵活扩展
- 多种命令来源（内置、技能、插件、MCP）
- 动态技能运行时添加
- 特性门控条件编译

### 4. 容错设计
- 技能加载失败返回空数组不破坏系统
- 可用性检查在启用检查之前
- 缓存独立清除

---

## 关键学习点

1. **命令优先级**: 内置技能 > 目录技能 > 插件 > 内置命令
2. **动态扩展**: 运行时添加技能，自动去重
3. **安全分层**: 远程模式、桥接模式多层安全过滤
4. **性能优化**: memoize缓存、并行加载、懒导入
5. **特性门控**: 构建时DCE + 运行时检查

---

*技能生成时间: 2026-04-07 10:35*
