/**
 * 阿里云 Coding Plan 监控脚本
 * 使用方法: node aliyun-monitor.js
 */

const https = require('https');
const { exec } = require('child_process');

// 配置
const CHECK_INTERVAL = 3000; // 每3秒检查一次
const TARGET_URL = 'https://common-buy.aliyun.com/coding-plan';

// Cookie（替换为你的最新Cookie）
const COOKIE = '，你的Cookie';

function checkAlipay() {
  return new Promise((resolve) => {
    const req = https.get(TARGET_URL, {
      headers: {
        'Cookie': COOKIE,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // 检查是否包含"支付宝"且不是"售罄"
        const hasAlipay = data.includes('支付宝');
        const isSoldOut = data.includes('售罄') || data.includes('售罄');
        
        resolve({ available: hasAlipay && !isSoldOut, content: data });
      });
    });
    
    req.on('error', () => resolve({ available: false, error: true }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ available: false, timeout: true });
    });
  });
}

async function main() {
  console.log('=== 阿里云 Coding Plan 监控器 ===');
  console.log(`检查间隔: ${CHECK_INTERVAL/1000}秒`);
  console.log('按 Ctrl+C 停止\n');
  
  let lastStatus = false;
  
  setInterval(async () => {
    const result = await checkAlipay();
    
    if (result.error) {
      console.log(`[${new Date().toLocaleTimeString()}] ❌ 请求失败`);
      return;
    }
    
    if (result.timeout) {
      console.log(`[${new Date().toLocaleTimeString()}] ⏱️ 请求超时`);
      return;
    }
    
    if (result.available && !lastStatus) {
      // 首次发现可用，响警报
      console.log('\n🎉 支付宝已开放！快去购买！\n');
      
      // 播放提示音 (macOS)
      exec('say "支付宝已开放"', () => {});
      
      lastStatus = true;
    } else if (!result.available && lastStatus) {
      console.log(`[${new Date().toLocaleTimeString()}] ⚠️ 支付宝已售罄`);
      lastStatus = false;
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] 🔄 监控中...${result.available ? '✅ 可用' : '❌ 不可用'}`);
    }
  }, CHECK_INTERVAL);
}

main();