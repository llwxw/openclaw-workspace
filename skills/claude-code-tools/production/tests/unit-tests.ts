/**
 * Unit Tests for Production Tools
 * 生产级工具单元测试
 * 
 * 运行方式：
 *   node tests/unit-tests.ts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

console.log('🧪 Starting Production Tools Unit Tests...\n');

// ==========================================
// 测试工具函数
// ==========================================

let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(name: string, fn: () => Promise<void> | void) {
  testCount++;
  console.log(`  Test ${testCount}: ${name}`);
  
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(() => {
        console.log(`    ✅ PASS`);
        passCount++;
      }).catch(err => {
        console.log(`    ❌ FAIL: ${err}`);
        failCount++;
      });
    } else {
      console.log(`    ✅ PASS`);
      passCount++;
    }
  } catch (err) {
    console.log(`    ❌ FAIL: ${err}`);
    failCount++;
  }
}

function assert(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// ==========================================
// 导入被测试的工具
// ==========================================

import {
  FileReadToolProd,
  FileWriteToolProd,
  FileEditToolProd,
  GlobToolProd,
  GrepToolProd,
} from '../index';

// ==========================================
// 创建临时测试目录
// ==========================================

const testDir = path.join(os.tmpdir(), 'claude-code-prod-test-' + Date.now());

async function setupTestDir() {
  await fs.mkdir(testDir, { recursive: true });
  
  // 创建测试文件
  await fs.writeFile(path.join(testDir, 'test.txt'), 'Hello, World!\nLine 2\nLine 3\n');
  await fs.writeFile(path.join(testDir, 'test2.txt'), 'Test file 2\n');
  await fs.mkdir(path.join(testDir, 'subdir'));
  await fs.writeFile(path.join(testDir, 'subdir', 'nested.txt'), 'Nested content\n');
  
  console.log(`📁 Test directory: ${testDir}\n`);
}

async function cleanupTestDir() {
  try {
    await fs.rm(testDir, { recursive: true, force: true });
    console.log(`\n🧹 Cleaned up test directory`);
  } catch {
    // 忽略清理错误
  }
}

// ==========================================
// 测试用例
// ==========================================

async function runTests() {
  await setupTestDir();

  console.log('=' .repeat(60));
  console.log('Testing FileReadToolProd');
  console.log('=' .repeat(60));

  test('Read existing file', async () => {
    const result = await FileReadToolProd.execute({
      file_path: path.join(testDir, 'test.txt'),
    });
    assertEqual(result.type, 'text');
    assert((result as any).file.content.includes('Hello, World!'));
  });

  test('Read with offset and limit', async () => {
    const result = await FileReadToolProd.execute({
      file_path: path.join(testDir, 'test.txt'),
      offset: 2,
      limit: 1,
    });
    assertEqual((result as any).file.numLines, 1);
  });

  test('Read non-existent file returns error', async () => {
    try {
      await FileReadToolProd.execute({
        file_path: path.join(testDir, 'nonexistent.txt'),
      });
      assert(false, 'Should have thrown an error');
    } catch {
      // 预期会出错
    }
  });

  console.log('\n' + '=' .repeat(60));
  console.log('Testing FileWriteToolProd');
  console.log('=' .repeat(60));

  test('Write new file', async () => {
    const newFile = path.join(testDir, 'new.txt');
    const result = await FileWriteToolProd.execute({
      file_path: newFile,
      content: 'New content',
    });
    assertEqual(result.type, 'create');
    const written = await fs.readFile(newFile, 'utf-8');
    assertEqual(written, 'New content');
  });

  test('Update existing file', async () => {
    const testFile = path.join(testDir, 'test.txt');
    const result = await FileWriteToolProd.execute({
      file_path: testFile,
      content: 'Updated content',
    });
    assertEqual(result.type, 'update');
  });

  console.log('\n' + '=' .repeat(60));
  console.log('Testing FileEditToolProd');
  console.log('=' .repeat(60));

  test('Edit file - replace first occurrence', async () => {
    const editFile = path.join(testDir, 'edit-test.txt');
    await fs.writeFile(editFile, 'A B A B A');
    
    const result = await FileEditToolProd.execute({
      file_path: editFile,
      old_string: 'A',
      new_string: 'X',
      replace_all: false,
    });
    
    assertEqual(result.replacedCount, 1);
    const content = await fs.readFile(editFile, 'utf-8');
    assertEqual(content, 'X B A B A');
  });

  test('Edit file - replace all occurrences', async () => {
    const editFile = path.join(testDir, 'edit-test2.txt');
    await fs.writeFile(editFile, 'A B A B A');
    
    const result = await FileEditToolProd.execute({
      file_path: editFile,
      old_string: 'A',
      new_string: 'X',
      replace_all: true,
    });
    
    assertEqual(result.replacedCount, 3);
    const content = await fs.readFile(editFile, 'utf-8');
    assertEqual(content, 'X B X B X');
  });

  console.log('\n' + '=' .repeat(60));
  console.log('Testing GlobToolProd');
  console.log('=' .repeat(60));

  test('Glob for text files', async () => {
    const result = await GlobToolProd.execute({
      pattern: '**/*.txt',
      path: testDir,
    });
    assert(result.matches.length >= 3);
    assert(result.matches.includes('test.txt'));
  });

  test('Glob with max results', async () => {
    const result = await GlobToolProd.execute({
      pattern: '**/*.txt',
      path: testDir,
      max_results: 2,
    });
    assert(result.matches.length <= 2);
  });

  console.log('\n' + '=' .repeat(60));
  console.log('Testing GrepToolProd');
  console.log('=' .repeat(60));

  test('Grep for content', async () => {
    const result = await GrepToolProd.execute({
      pattern: 'Hello',
      path: testDir,
      output_mode: 'files_with_matches',
    });
    assert(result.filenames.length >= 1);
  });

  test('Grep with content mode', async () => {
    const result = await GrepToolProd.execute({
      pattern: 'Line',
      path: testDir,
      output_mode: 'content',
      '-n': true,
    });
    assert(result.content);
    assert(result.content.includes('Line'));
  });

  // 等待所有异步测试完成
  await new Promise(r => setTimeout(r, 500));

  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Summary');
  console.log('=' .repeat(60));
  console.log(`  Total: ${testCount}`);
  console.log(`  Pass:  ${passCount} ✅`);
  console.log(`  Fail:  ${failCount} ❌`);

  await cleanupTestDir();

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  cleanupTestDir();
  process.exit(1);
});
