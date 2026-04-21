#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
阿里云 Coding Plan 抢购脚本
依赖: pip install selenium webdriver-manager

运行: python aliyun_selenium.py
"""

import time
from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.edge.options import Options
from webdriver_manager.microsoft import EdgeChromiumDriverManager

# ========== 配置区 ==========
CHECK_INTERVAL = 1  # 检查间隔（秒）
# ============================

def main():
    print("="*50)
    print("阿里云 Coding Plan 抢购脚本")
    print("="*50)
    print(f"检查间隔: {CHECK_INTERVAL}秒")
    
    # 配置 Edge
    options = Options()
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    try:
        # 自动下载并使用 Edge_driver
        service = Service(EdgeChromiumDriverManager().install())
        driver = webdriver.Edge(service=service, options=options)
        
        # 打开目标页面
        print("打开阿里云页面...")
        driver.get('https://common-buy.aliyun.com/coding-plan')
        
        # 等待登录
        input("请登录阿里云，登录完成后按回车继续...")
        
        print("\n开始监控...\n")
        last_available = False
        
        while True:
            # 刷新页面
            driver.refresh()
            time.sleep(1)
            
            # 获取页面文本
            page_text = driver.page_source
            
            # 判断状态
            has_alipay = '支付宝' in page_text
            sold_out = '售罄' in page_text or '暂时售罄' in page_text
            available = has_alipay and not sold_out
            
            status = "✅ 可购买" if available else "❌ 不可用"
            print(f"[{time.strftime('%H:%M:%S')}] {status}", end='\r')
            
            if available and not last_available:
                print("\n\n🔥 检测到可购买！开始抢购！")
                
                # 点击购买按钮 (尝试多种选择器)
                try:
                    # 尝试点击 "立即购买" 或 "订阅"
                    buttons = driver.find_elements("tag name", "button")
                    for btn in buttons:
                        text = btn.text
                        if '购买' in text or '订阅' in text:
                            btn.click()
                            print("✅ 点击购买按钮")
                            time.sleep(1)
                            break
                except Exception as e:
                    print(f"点击按钮失败: {e}")
                
                # 响铃
                for _ in range(10):
                    print("\a")
                    time.sleep(0.1)
                
                print("\n请立即在浏览器中完成支付！")
                break
            
            last_available = available
            time.sleep(CHECK_INTERVAL)
            
    except Exception as e:
        print(f"错误: {e}")
    finally:
        input("\n按回车退出...")
        try:
            driver.quit()
        except:
            pass

if __name__ == "__main__":
    main()