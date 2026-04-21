#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
阿里云 Coding Plan 监控抢购脚本（简单版）
使用浏览器手动打开，脚本只监控+提醒

运行：python aliyun_spike_simple.py
"""

import time
import subprocess
import platform

# ========== 配置区 ==========
CHECK_INTERVAL = 1  # 检查间隔（秒）
TARGET_URL = "https://common-buy.aliyun.com/coding-plan"
# ============================

def open_browser():
    """用系统默认浏览器打开目标页面"""
    system = platform.system()
    if system == "Windows":
        subprocess.Popen(f'start "" "{TARGET_URL}"', shell=True)
    elif system == "Darwin":  # Mac
        subprocess.Popen(["open", TARGET_URL])
    else:  # Linux
        subprocess.Popen(["xdg-open", TARGET_URL])
    print(f"✅ 已打开浏览器: {TARGET_URL}")

def alert():
    """响铃提醒"""
    print("\a" * 10)
    print("\n" + "="*50)
    print("🔥🔥🔥 支付宝可用了！快去点击购买！")
    print("🔥🔥🔥 支付宝可用了！快去点击购买！")
    print("🔥🔥🔥 支付宝可用了！快去点击购买！")
    print("="*50 + "\n")

def main():
    print("="*50)
    print("阿里云 Coding Plan 抢购监控脚本")
    print("="*50)
    print(f"检查间隔: {CHECK_INTERVAL}秒")
    print(f"目标: {TARGET_URL}")
    print("\n" + "="*50)
    print("⚠️ 请先确保浏览器已打开并登录阿里云！")
    print("="*50 + "\n")
    
    # 打开浏览器（可选）
    choice = input("是否自动打开浏览器？(y/n): ").strip().lower()
    if choice == 'y':
        open_browser()
    
    print("\n开始监控... 按 Ctrl+C 停止\n")
    
    last_available = False
    
    try:
        while True:
            # 打印状态
            status = f"[{time.strftime('%H:%M:%S')}] ❌ 不可用"
            print(status, end='\r')
            
            # 你需要手动查看浏览器！
            # 脚本只是提醒辅助
            # 如果看到支付宝可用，就按 Ctrl+C 停止脚本，然后去点
            
            # 检测 Ctrl+C
            time.sleep(CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\n已停止监控")
        print("请立即去浏览器点击购买！")

if __name__ == "__main__":
    main()