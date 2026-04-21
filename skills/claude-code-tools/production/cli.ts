#!/usr/bin/env node
/**
 * Claude Code Production CLI
 * 生产级 CLI 工具 - 完整复刻 Claude Code 体验
 * 
 * 使用方式：
 *   node cli.ts read /path/to/file.txt
 *   node cli.ts bash "ls -la"
 *   node cli.ts write /path/to/file.txt "content"
 *   node cli.ts glob "**\/*.ts"
 *   node cli.ts grep "pattern"
 */

import * as path from 'path';
import {
  FileReadToolProd,
  BashToolProd,
  FileWriteToolProd,
  GlobToolProd,
  GrepToolProd,
  FileEditToolProd,
} from './index';

// ==========================================
// CLI 解析器
// ==========================================

interface ParsedArgs {
  command: string;
  args: string[];
  flags: Record<string, string | boolean | number>;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const commandArgs: string[] = [];
  const flags: Record<string, string | boolean | number> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const equalsIndex = arg.indexOf('=');
      if (equalsIndex > -1) {
        const key = arg.slice(2, equalsIndex);
        const value = arg.slice(equalsIndex + 1);
        // 尝试转换为数字
        const numValue = parseFloat(value);
        flags[key] = isNaN(numValue) ? value : numValue;
      } else {
        flags[arg.slice(2)] = true;
      }
    } else if (arg.startsWith('-')) {
        const key = arg.slice(1);
        if (key.length === 1 && args[i + 1] && !args[i + 1].startsWith('-')) {
            flags[key] = args[++i];
        } else {
            flags[key] = true;
        }
    } else {
      commandArgs.push(arg);
    }
  }

  return { command, args: commandArgs, flags };
}

// ==========================================
// 命令处理器
// ==========================================

async function handleRead(args: string[], flags: any) {
  const filePath = args[0];
  if (!filePath) {
    console.error('Error: Please provide a file path');
    process.exit(1);
  }

  try {
    const result = await FileReadToolProd.execute({
      file_path: path.resolve(filePath),
      offset: flags.offset ? Number(flags.offset) : undefined,
      limit: flags.limit ? Number(flags.limit) : undefined,
    });

    if (result.type === 'text') {
      console.log(result.file.content);
    } else if (result.type === 'image') {
      console.log(`[Image: ${result.file.originalSize} bytes]`);
    } else if (result.type === 'error') {
      console.error(`Error: ${result.error.message}`);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
}

async function handleBash(args: string[], flags: any) {
  const command = args.join(' ');
  if (!command) {
    console.error('Error: Please provide a command');
    process.exit(1);
  }

  try {
    const result = await BashToolProd.execute({
      command,
      cwd: flags.cwd as string | undefined,
      timeout: flags.timeout ? Number(flags.timeout) : undefined,
      allow_dangerous: Boolean(flags['allow-dangerous']),
    });

    if (result.type === 'success') {
      if (result.stdout) console.log(result.stdout);
      if (result.stderr) console.error(result.stderr);
      process.exit(result.exitCode);
    } else if (result.type === 'timeout') {
      if (result.stdout) console.log(result.stdout);
      if (result.stderr) console.error(result.stderr);
      console.error(`\nTimeout after ${result.timeoutMs}ms`);
      process.exit(1);
    } else if (result.type === 'error') {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function handleWrite(args: string[], flags: any) {
  const filePath = args[0];
  const content = args[1] || '';
  if (!filePath) {
    console.error('Error: Please provide a file path');
    process.exit(1);
  }

  try {
    const result = await FileWriteToolProd.execute({
      file_path: path.resolve(filePath),
      content,
    });

    const action = result.type === 'create' ? 'Created' : 'Updated';
    console.log(`${action}: ${result.filePath}`);
    
    if (result.gitDiff) {
      console.log(`\nChanges: +${result.gitDiff.added} -${result.gitDiff.removed}`);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
}

async function handleGlob(args: string[], flags: any) {
  const pattern = args[0];
  if (!pattern) {
    console.error('Error: Please provide a glob pattern');
    process.exit(1);
  }

  try {
    const result = await GlobToolProd.execute({
      pattern,
      path: flags.path as string | undefined,
      ignore: flags.ignore ? (flags.ignore as string).split(',') : undefined,
      max_results: flags['max-results'] ? Number(flags['max-results']) : undefined,
      include_directories: Boolean(flags['include-directories']),
    });

    for (const match of result.matches) {
      console.log(match);
    }

    if (result.truncated) {
      console.log(`\n... (truncated, found more than ${result.count} results)`);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
}

async function handleGrep(args: string[], flags: any) {
  const pattern = args[0];
  if (!pattern) {
    console.error('Error: Please provide a search pattern');
    process.exit(1);
  }

  try {
    const result = await GrepToolProd.execute({
      pattern,
      path: flags.path as string | undefined,
      glob: flags.glob as string | undefined,
      output_mode: (flags['output-mode'] as any) || 'files_with_matches',
      '-n': flags.n !== false,
      '-i': Boolean(flags.i),
      '-C': flags.C ? Number(flags.C) : undefined,
      context: flags.context ? Number(flags.context) : undefined,
      head_limit: flags['head-limit'] ? Number(flags['head-limit']) : undefined,
      offset: flags.offset ? Number(flags.offset) : 0,
    });

    if (result.content) {
      console.log(result.content);
    }

    if (result.limitInfo) {
      console.log(`\n[${result.limitInfo}]`);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
}

async function handleEdit(args: string[], flags: any) {
  const filePath = args[0];
  const oldString = args[1];
  const newString = args[2] || '';
  
  if (!filePath || !oldString) {
    console.error('Error: Please provide file path, old string, and new string');
    process.exit(1);
  }

  try {
    const result = await FileEditToolProd.execute({
      file_path: path.resolve(filePath),
      old_string: oldString,
      new_string: newString,
      replace_all: Boolean(flags['replace-all']),
    });

    console.log(`Edited: ${result.filePath}`);
    console.log(`Replaced: ${result.replacedCount} occurrence(s)`);
    
    if (result.gitDiff) {
      console.log(`\nChanges: +${result.gitDiff.added} -${result.gitDiff.removed}`);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
}

function showHelp() {
  console.log(`
Claude Code Production CLI

Usage:
  node cli.ts <command> [options]

Commands:
  read <file> [--offset=N] [--limit=N]              Read a file
  bash <command> [--cwd=DIR] [--timeout=MS]         Execute bash command
  write <file> <content>                              Write to a file
  edit <file> <old> <new> [--replace-all]            Edit file (replace string)
  glob <pattern> [--path=DIR] [--max-results=N]     Search files
  grep <pattern> [options]                            Search file contents
  help                                                 Show this help

Examples:
  node cli.ts read package.json
  node cli.ts bash "ls -la"
  node cli.ts write hello.txt "Hello World"
  node cli.ts edit hello.txt "World" "Universe"
  node cli.ts glob "**/*.ts" --max-results=50
  node cli.ts grep "function" --output-mode=content -n
`);
}

// ==========================================
// 主函数
// ==========================================

async function main() {
  const { command, args, flags } = parseArgs();

  switch (command) {
    case 'read':
      await handleRead(args, flags);
      break;
    case 'bash':
      await handleBash(args, flags);
      break;
    case 'write':
      await handleWrite(args, flags);
      break;
    case 'edit':
      await handleEdit(args, flags);
      break;
    case 'glob':
      await handleGlob(args, flags);
      break;
    case 'grep':
      await handleGrep(args, flags);
      break;
    case 'help':
    default:
      showHelp();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
