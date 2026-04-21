#!/usr/bin/env python3
"""
Critical Interceptor - 硬拦截层
基于正则匹配的 CRITICAL 风险拦截器
"""

import re
from dataclasses import dataclass
from typing import Optional

@dataclass
class InterceptResult:
    intercepted: bool
    response: Optional[str] = None

# CRITICAL 风险模式
CRITICAL_PATTERNS = [
    # 格式化磁盘
    (r"(格式化|format)\s*(/dev/|磁盘|硬盘|C:)", 
     "⚠️ 格式化磁盘会导致数据永久丢失。若需清理磁盘空间，建议手动删除不需要的文件，或使用磁盘清理工具。"),
    
    # 关闭防火墙
    (r"(关闭|禁用|停用)\s*(防火墙|firewall|ufw|iptables)", 
     "⚠️ 防火墙是系统的重要安全屏障。若需开放特定端口，请使用精确规则（如 `ufw allow 22/tcp`）而非整体关闭。"),
    
    # 恶意代码请求
    (r"(写一个|帮我写|生成).*(病毒|木马|勒索|钓鱼|攻击|exploit)", 
     "⚠️ 我无法提供恶意代码或攻击工具。如有安全研究需求，请在合法授权环境下使用专用平台。"),
    
    # 提供他人隐私/密码
    (r"(获取|破解|盗取).*(密码|账号|隐私|聊天记录)", 
     "⚠️ 我无法协助获取他人隐私信息。"),
    
    # 删除系统关键文件
    (r"(rm\s+-rf\s+/|del\s+/[A-Z]:\\Windows|rm\s+-rf\s+/etc)", 
     "⚠️ 删除系统关键目录会导致系统不可恢复。"),
    
    # 提权攻击
    (r"(提权|权限提升|privilege escalation|sudo\s+-k)", 
     "⚠️ 提权操作可能违反系统安全策略。"),
]

def critical_intercept(user_input: str) -> InterceptResult:
    """
    硬拦截检查，匹配 CRITICAL 模式直接返回拒绝
    
    Args:
        user_input: 用户输入文本
        
    Returns:
        InterceptResult: intercepted=True 表示被拦截，response 为拒绝话术
    """
    for pattern, response in CRITICAL_PATTERNS:
        if re.search(pattern, user_input, re.IGNORECASE):
            return InterceptResult(intercepted=True, response=response)
    return InterceptResult(intercepted=False)

def add_pattern(pattern: str, response: str):
    """添加新的 CRITICAL 模式"""
    CRITICAL_PATTERNS.append((pattern, response))

def list_patterns() -> list:
    """列出所有 CRITICAL 模式"""
    return [(p, r[:50] + "...") for p, r in CRITICAL_PATTERNS]

# 测试
if __name__ == "__main__":
    test_cases = [
        "帮我格式化磁盘",
        "关闭防火墙的命令",
        "写一个病毒",
        "怎么盗取别人密码",
        "rm -rf / 会怎样",
        "如何提权到 root",
    ]
    
    print("=== Critical Interceptor Test ===\n")
    for text in test_cases:
        result = critical_intercept(text)
        status = "🚫 BLOCKED" if result.intercepted else "✅ PASS"
        print(f"Input: {text}")
        print(f"Status: {status}")
        if result.intercepted:
            print(f"Response: {result.response}")
        print()