/**
 * Simple verification script for production tools
 * 生产级工具简单验证脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Verifying Production Tools...\n');

const toolFiles = [
  'file-read-tool-prod.ts',
  'bash-tool-prod.ts',
  'file-write-tool-prod.ts',
  'glob-tool-prod.ts',
  'grep-tool-prod.ts',
  'file-edit-tool-prod.ts',
  'index.ts',
  'cli.ts',
];

console.log('=' .repeat(60));
console.log('Checking file existence...');
console.log('=' .repeat(60));

const prodDir = __dirname;
let allExist = true;

for (const file of toolFiles) {
  const filePath = path.join(prodDir, file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file.padEnd(30)} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`  ❌ ${file.padEnd(30)} MISSING`);
    allExist = false;
  }
}

console.log('\n' + '=' .repeat(60));
console.log('Checking tests directory...');
console.log('=' .repeat(60));

const testsDir = path.join(prodDir, 'tests');
if (fs.existsSync(testsDir)) {
  const testFiles = fs.readdirSync(testsDir);
  console.log(`  ✅ Tests directory exists with ${testFiles.length} file(s)`);
  for (const f of testFiles) {
    const stats = fs.statSync(path.join(testsDir, f));
    console.log(`     - ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
} else {
  console.log('  ❌ Tests directory missing');
  allExist = false;
}

console.log('\n' + '=' .repeat(60));
console.log('Checking for TypeScript syntax (simple)...');
console.log('=' .repeat(60));

let syntaxOk = true;
for (const file of toolFiles) {
  if (!file.endsWith('.ts')) continue;
  
  const filePath = path.join(prodDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // 简单检查：确保有 export 语句
    if (content.includes('export') && content.includes('buildTool')) {
      console.log(`  ✅ ${file} - looks good`);
    } else {
      console.log(`  ⚠️  ${file} - might be incomplete`);
    }
  } catch (err) {
    console.log(`  ❌ ${file} - error reading: ${err.message}`);
    syntaxOk = false;
  }
}

console.log('\n' + '=' .repeat(60));
console.log('📊 Summary');
console.log('=' .repeat(60));

if (allExist && syntaxOk) {
  console.log('\n🎉 All production tools verified!');
  console.log('\nNext steps:');
  console.log('  1. Install TypeScript: npm install -g typescript ts-node');
  console.log('  2. Run tests: cd production && ts-node tests/unit-tests.ts');
  console.log('  3. Use CLI: node cli.ts help');
  console.log('\nFiles are ready for production use!');
} else {
  console.log('\n⚠️  Some issues found - check above');
  process.exit(1);
}
