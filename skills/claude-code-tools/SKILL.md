# Claude Code 工具系统设计技能

**技能名称**: claude-code-tools
**版本**: 1.0
**学习来源**: Claude Code v2.1.88 源码分析
**分析文件**: `src/Tool.ts` (792行)

---

## 技能描述

本技能提供 Claude Code 工具系统的完整设计模式，包括：
- 工具基类完整接口定义
- 工具构建器模式
- 权限系统集成
- 进度上报机制
- UI渲染接口

---

## 核心设计模式

### 1. 工具基类接口 (Tool 接口)

```typescript
// 核心工具接口定义
type Tool<Input, Output, Progress> = {
  // 基本信息
  name: string
  aliases?: string[]
  searchHint?: string
  
  // 核心执行方法
  call(
    args: Input,
    context: ToolUseContext,
    canUseTool: CanUseToolFn,
    parentMessage: AssistantMessage,
    onProgress?: ToolCallProgress<Progress>,
  ): Promise<ToolResult<Output>>
  
  // Schema定义
  inputSchema: AnyObject  // Zod schema
  inputJSONSchema?: ToolInputJSONSchema
  outputSchema?: z.ZodType<unknown>
  
  // 权限与验证
  validateInput?(input: Input, context: ToolUseContext): Promise<ValidationResult>
  checkPermissions(input: Input, context: ToolUseContext): Promise<PermissionResult>
  
  // 行为特性
  isEnabled(): boolean
  isReadOnly(input: Input): boolean
  isDestructive?(input: Input): boolean
  isConcurrencySafe(input: Input): boolean
  interruptBehavior?(): 'cancel' | 'block'
  
  // UI相关
  description(input: Input, options: {...}): Promise<string>
  userFacingName(input: Partial<Input> | undefined): string
  renderToolUseMessage(input: Partial<Input>, options: {...}): React.ReactNode
  renderToolResultMessage(content: Output, ...): React.ReactNode
  
  // 搜索/分类
  isSearchOrReadCommand?(input: Input): {
    isSearch: boolean
    isRead: boolean
    isList?: boolean
  }
  
  // 其他
  maxResultSizeChars: number
  shouldDefer?: boolean
  alwaysLoad?: boolean
}
```

---

## 工具构建器 (buildTool)

### 使用方式

```typescript
import { buildTool } from './Tool'

const MyTool = buildTool({
  name: 'my_tool',
  inputSchema: z.object({
    path: z.string(),
    content: z.string()
  }),
  
  async call(args, context, canUseTool, parentMessage, onProgress) {
    // 工具实现
    return { data: result }
  },
  
  async description(input, options) {
    return `My tool description`
  },
  
  // 可选：覆盖默认行为
  isReadOnly: () => true,
  isConcurrencySafe: () => true
})
```

### 默认值

`buildTool` 自动提供以下默认值（fail-closed 策略）：

| 方法 | 默认值 | 说明 |
|------|--------|------|
| `isEnabled()` | `true` | 默认启用 |
| `isConcurrencySafe()` | `false` | 默认不安全 |
| `isReadOnly()` | `false` | 默认会写入 |
| `isDestructive()` | `false` | 默认非破坏性 |
| `checkPermissions()` | `{ behavior: 'allow' }` |  defer to general system |
| `toAutoClassifierInput()` | `''` | 跳过安全分类 |
| `userFacingName()` | `name` | 使用工具名 |

---

## 核心类型定义

### ToolUseContext (工具使用上下文)

```typescript
type ToolUseContext = {
  // 工具选项
  options: {
    commands: Command[]
    tools: Tools
    mainLoopModel: string
    mcpClients: MCPServerConnection[]
    // ...更多选项
  }
  
  // 状态管理
  abortController: AbortController
  getAppState(): AppState
  setAppState(f: (prev: AppState) => AppState): void
  
  // UI 回调
  setToolJSX?: SetToolJSXFn
  addNotification?: (notif: Notification) => void
  appendSystemMessage?: (msg: SystemMessage) => void
  
  // 权限
  toolPermissionContext: ToolPermissionContext
  
  // ...更多字段
}
```

### ToolResult (工具结果)

```typescript
type ToolResult<T> = {
  data: T
  newMessages?: (UserMessage | AssistantMessage | ...)[]
  contextModifier?: (context: ToolUseContext) => ToolUseContext
  mcpMeta?: {
    _meta?: Record<string, unknown>
    structuredContent?: Record<string, unknown>
  }
}
```

---

## 设计原则

### 1. Fail-Closed 安全策略
- 默认不安全的默认行为是 `false`
- 默认只读是 `false` (假设会写入)
- 默认并发安全是 `false`

### 2. 特性门控
- 使用 `buildTool` 统一默认值
- 类型安全保证
- 可选方法灵活扩展

### 3. UI与逻辑分离
- 工具逻辑在 `call()` 中
- UI 渲染在 `render*` 方法中
- 描述在 `description()` 中

---

## Python 实现示例 (简化版)

```python
from dataclasses import dataclass
from typing import Any, Callable, Optional, Protocol
from abc import ABC, abstractmethod

class Tool(ABC):
    name: str
    aliases: list[str] = []
    
    @abstractmethod
    def call(self, args: dict[str, Any], context: "ToolUseContext") -> dict[str, Any]:
        pass
    
    def is_enabled(self) -> bool:
        return True
    
    def is_read_only(self, args: dict[str, Any]) -> bool:
        return False
    
    def is_concurrency_safe(self, args: dict[str, Any]) -> bool:
        return False

def build_tool(definition: dict) -> Tool:
    """工具构建器，填充默认值
    """
    # 实现类似于 TypeScript buildTool 的 Python 版本
    pass
```

---

## 关键学习点

1. **类型安全**: 完整的 TypeScript 类型系统
2. **默认安全**: fail-closed 策略防止意外行为
3. **UI分离**: 逻辑与UI渲染清晰分离
4. **可扩展**: 可选方法允许灵活定制
5. **统一构建**: `buildTool` 确保一致性

---

*技能生成时间: 2026-04-07 10:30*
