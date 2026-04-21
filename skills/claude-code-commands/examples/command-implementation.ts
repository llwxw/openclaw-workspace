/**
 * Claude Code 命令实现示例
 * 演示如何创建高质量的命令
 */

import { z } from 'zod';
import type { Command } from '../commands.js';

// ==========================================
// 示例1: 简单的 Echo 命令
// ==========================================

export const echoCommand: Command = {
  name: 'echo',
  description: 'Prints the input text',
  type: 'local',
  hidden: false,
  
  async run({ args }) {
    const text = args.join(' ');
    console.log(text);
    return { success: true };
  },
};

// ==========================================
// 示例2: 带参数解析的命令
// ==========================================

const GreetInput = z.object({
  name: z.string().describe('Name of the person to greet'),
  times: z.number().default(1).describe('Number of times to greet'),
  uppercase: z.boolean().default(false).describe('Uppercase the output'),
});

type GreetInput = z.infer<typeof GreetInput>;

export const greetCommand: Command = {
  name: 'greet',
  description: 'Greet someone',
  type: 'local',
  hidden: false,
  inputSchema: GreetInput,
  
  async run({ args, flags }) {
    // 解析参数
    const input = GreetInput.parse({
      name: args[0],
      times: flags.times ? parseInt(flags.times) : 1,
      uppercase: flags.uppercase === 'true',
    });
    
    let greeting = `Hello, ${input.name}!`;
    if (input.uppercase) {
      greeting = greeting.toUpperCase();
    }
    
    for (let i = 0; i < input.times; i++) {
      console.log(greeting);
    }
    
    return { success: true };
  },
};

// ==========================================
// 示例3: Prompt 类型命令（模型可调用）
// ==========================================

export const todoCommand: Command = {
  name: 'todo',
  description: 'Manage your todo list',
  type: 'prompt',
  hidden: false,
  userFacingName: 'Todo List',
  
  async prompt({ args, context }) {
    const action = args[0] || 'list';
    
    if (action === 'add') {
      const task = args.slice(1).join(' ');
      return {
        promptMessages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: `Add this task to the todo list: "${task}"` },
            ],
          },
        ],
      };
    }
    
    if (action === 'list') {
      return {
        promptMessages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'List all tasks in the todo list.' },
            ],
          },
        ],
      };
    }
    
    return {
      promptMessages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Unknown todo action: ${action}. Use "add" or "list".` },
          ],
        },
      ],
    };
  },
};

// ==========================================
// 示例4: 带可用性检查的命令
// ==========================================

export const gitCommand: Command = {
  name: 'git',
  description: 'Git operations',
  type: 'local',
  hidden: false,
  
  availability: {
    provider: 'github', // 仅在 GitHub 认证后可用
  },
  
  isEnabled() {
    // 检查 git 是否可用
    const { execSync } = require('child_process');
    try {
      execSync('git --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  },
  
  async run({ args }) {
    const { execSync } = require('child_process');
    const result = execSync(`git ${args.join(' ')}`, { encoding: 'utf-8' });
    console.log(result);
    return { success: true };
  },
};

// ==========================================
// 示例5: 带渲染的命令
// ==========================================

import React from 'react';

export const statusCommand: Command = {
  name: 'status',
  description: 'Show system status',
  type: 'local',
  hidden: false,
  
  render({ context }) {
    const { cwd, gitStatus } = context;
    
    return (
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>System Status</h3>
        <p><strong>Directory:</strong> {cwd}</p>
        <p><strong>Git Status:</strong> {gitStatus || 'Not a git repo'}</p>
        <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
      </div>
    );
  },
  
  async run() {
    return { success: true };
  },
};

// ==========================================
// 命令注册
// ==========================================

export const ALL_COMMANDS: Command[] = [
  echoCommand,
  greetCommand,
  todoCommand,
  gitCommand,
  statusCommand,
];

export function getCommands(): Command[] {
  return ALL_COMMANDS.filter(cmd => !cmd.isEnabled || cmd.isEnabled());
}
