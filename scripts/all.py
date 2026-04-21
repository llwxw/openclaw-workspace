#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
阿里云 Coding Plan 半自动抢购脚本（优化版）
入口：活动页 → 点击"马上抢购" → 购买页抢购
依赖：pip install DrissionPage
"""

import time
import sys
from DrissionPage import ChromiumPage, ChromiumOptions

# ========== 配置区 ==========
ACTIVITY_URL = 'https://www.aliyun.com/benefit/scene/codingplan?spm=5176.30275541.J_ZGek9Blx07Hclc3Ddt9dg.1.41872f3dk1APRQ&scm=20140722.S_card@@%E6%B4%BB%E5%8A%A8@@4220167._.ID_card@@%E6%B4%BB%E5%8A%A8@@4220167-RL_codeplan-LOC_2024SPSearchCard-OR_ser-PAR1_213e6dde17757846480158405d080b-V_4-RE_new5-P0_0-P1_0'
BUY_PAGE_URL = 'https://common-buy.aliyun.com/coding-plan'   # 购买页，用于跳转后确认
CHECK_INTERVAL = 3          # 购买页状态检查间隔（秒），可低至0.5
ENTRY_CLICK_RETRY = 3         # 入口点击重试次数
# ============================

def safe_click(page, selector, description, timeout=5):
    """安全点击元素，带显式等待和重试"""
    ele = page.ele(selector, timeout=timeout)
    if ele:
        ele.click()
        print(f"✅ 已点击: {description}")
        return True
    else:
        print(f"❌ 未找到元素: {description} (选择器: {selector})")
        return False

def alert_sound():
    """跨平台提示音"""
    print('\a' * 3)  # 控制台响铃
    for _ in range(3):
        print("🔔 请注意！抢购已触发！")

def main():
    print("="*50)
    print("阿里云 Coding Plan 半自动抢购脚本（优化版）")
    print("="*50)
    print(f"活动入口: {ACTIVITY_URL[:60]}...")
    print(f"检查间隔: {CHECK_INTERVAL}秒")
    print("流程：活动页 → 点击马上抢购 → 购买页监控 → 自动下单 → 手动支付\n")
    
    # 浏览器配置（使用已打开的 Edge）
    co = ChromiumOptions()
    co.set_argument('--disable-blink-features=AutomationControlled')
    # 使用 local 地址连接已打开的浏览器
    co.set_local_port(9222)
    
    page = ChromiumPage(co)
    
    try:
        # ---------- 第一步：打开活动页并点击“马上抢购” ----------
        print("正在打开活动页面...")
        page.get(ACTIVITY_URL)
        time.sleep(3)   # 等待活动页初步加载
        
        # 检测是否需要登录
        if 'login' in page.url:
            print("⚠️ 请先登录阿里云账号！")
            input("登录完成后按回车继续...")
            # 登录后可能需要重新进入活动页
            page.get(ACTIVITY_URL)
            time.sleep(3)
        
        # 定位并点击“马上抢购”按钮（文本精确匹配，避免误点）
        # 常见文案："马上抢购"、"立即抢购"、"去抢购"
        entry_selector = 'tag:a@@text()=马上抢购'   # DrissionPage 的文本定位语法
        entry_clicked = False
        for i in range(ENTRY_CLICK_RETRY):
            btn = page.ele(entry_selector, timeout=2)
            if btn:
                # 滚动到可见区域并点击
                btn.scroll_to_see()
                btn.click()
                print(f"✅ 已点击入口按钮 (尝试 {i+1}/{ENTRY_CLICK_RETRY})")
                entry_clicked = True
                break
            else:
                # 尝试备用文本
                alt_texts = ['立即抢购', '去抢购', '马上购买']
                for txt in alt_texts:
                    btn = page.ele(f'tag:a@@text()={txt}', timeout=1)
                    if btn:
                        btn.scroll_to_see()
                        btn.click()
                        print(f"✅ 已点击入口按钮（备用文本: {txt}）")
                        entry_clicked = True
                        break
                if entry_clicked:
                    break
                print(f"⏳ 未找到入口按钮，重试中... ({i+1}/{ENTRY_CLICK_RETRY})")
                time.sleep(1)
        
        if not entry_clicked:
            print("❌ 无法点击入口按钮，请手动点击后按回车继续...")
            input()
        
        # 等待跳转到购买页（新标签页或当前页）
        print("等待跳转到购买页...")
        time.sleep(2)
        # 如果打开新标签页，切换到最新的
        if len(page.tabs) > 1:
            page = page.get_tab(-1)   # 切换到最新标签页
            page.bring_to_front()
        
        # 确认是否到达购买页（URL包含关键字）
        max_wait = 10
        for _ in range(max_wait):
            if 'common-buy.aliyun.com/coding-plan' in page.url:
                print("✅ 已到达购买页面")
                break
            time.sleep(1)
        else:
            print("⚠️ 未自动跳转到购买页，尝试直接访问...")
            page.get(BUY_PAGE_URL)
            time.sleep(2)
        
        # ---------- 第二步：在购买页监控并抢购 ----------
        print("\n开始监控购买页状态...\n")
        last_available = False
        
        while True:
            try:
                # 刷新购买页（保证最新状态）
                page.refresh()
                # 等待核心元素出现（例如价格、购买按钮区域）
                page.wait.ele_displayed('tag:button', timeout=3)
                
                # 获取页面文本，用于状态判断
                page_text = page.body.text.lower()
                
                # 判断可购买：包含"支付宝"且不包含"售罄"
                has_alipay = '支付宝' in page_text or 'alipay' in page_text
                sold_out = '售罄' in page_text or 'sold out' in page_text
                available = has_alipay and not sold_out
                
                status = "✅ 可购买" if available else "❌ 不可用"
                print(f"[{time.strftime('%H:%M:%S')}] {status}")
                
                # 状态从不可用变为可用时触发抢购
                if available and not last_available:
                    print("\n" + "="*50)
                    print("🔥 检测到可购买！开始自动抢购！")
                    print("="*50 + "\n")
                    
                    # ===== 抢购流程 =====
                    # 1. 点击购买按钮（优先"立即购买"或"订阅"）
                    buy_selectors = [
                        'tag:button@@text()=立即购买',
                        'tag:button@@text()=订阅',
                        'tag:button@@text():包含(购买)',
                    ]
                    for sel in buy_selectors:
                        btn = page.ele(sel, timeout=1)
                        if btn and btn.states.is_enabled:
                            btn.click()
                            print("✅ 点击购买按钮")
                            time.sleep(1)
                            break
                    
                    # 2. 选择支付宝（可能默认已选）
                    alipay_radio = page.ele('tag:input@@value=支付宝', timeout=1)
                    if alipay_radio:
                        alipay_radio.click()
                        print("✅ 选择支付宝支付")
                        time.sleep(0.5)
                    
                    # 3. 提交订单
                    submit_btn = page.ele('tag:button@@text()=提交订单', timeout=2)
                    if not submit_btn:
                        submit_btn = page.ele('tag:button@@text():包含(确认)', timeout=1)
                    if submit_btn:
                        submit_btn.click()
                        print("✅ 提交订单")
                    else:
                        print("⚠️ 未找到提交按钮，请手动提交")
                    
                    # 4. 提示用户支付
                    print("\n" + "="*50)
                    print("🎉 订单已提交！请立即手动完成支付验证！")
                    print("⚠️ 请在浏览器中继续操作")
                    print("="*50 + "\n")
                    alert_sound()
                    
                    # 保持浏览器打开，等待用户操作
                    print("支付完成后可以关闭浏览器")
                    break
                    
                elif not available and last_available:
                    print("⚠️ 状态变为不可用（可能已被抢完）")
                
                last_available = available
                time.sleep(CHECK_INTERVAL)
                
            except Exception as e:
                print(f"监控出错: {e}，2秒后重试...")
                time.sleep(2)
                
    except KeyboardInterrupt:
        print("\n用户中断脚本")
    finally:
        print("关闭浏览器...")
        page.quit()
        sys.exit(0)

if __name__ == "__main__":
    main()