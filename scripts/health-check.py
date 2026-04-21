#!/usr/bin/env python3
"""OpenClaw 健康检查 - 让我更鲁棒"""
import os
import sys
import json
import requests

OLLAMA_URL = "http://172.23.96.1:11434"
DB_FILE = os.environ.get("HOME") + "/.openclaw/memory/vectors.json"

def check_ollama():
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        models = [m['name'] for m in r.json().get('models', [])]
        has_bge = any('bge' in m.lower() for m in models)
        return {"status": "OK", "models": len(models), "has_bge": has_bge}
    except Exception as e:
        return {"status": "FAIL", "error": str(e)}

def check_memory():
    try:
        with open(DB_FILE) as f:
            db = json.load(f)
        return {"status": "OK", "count": len(db.get("memories", []))}
    except Exception as e:
        return {"status": "FAIL", "error": str(e)}

def check_openclaw():
    try:
        r = requests.get("http://127.0.0.1:18789/health", timeout=5)
        return {"status": "OK", "code": r.status_code}
    except Exception as e:
        return {"status": "FAIL", "error": str(e)}

if __name__ == "__main__":
    print("🔍 系统健康检查\n" + "="*40)
    
    checks = {
        "Ollama (embedding)": check_ollama(),
        "向量记忆": check_memory(),
        "OpenClaw Gateway": check_openclaw(),
    }
    
    all_ok = True
    for name, result in checks.items():
        status = result.get("status", "UNKNOWN")
        if status == "OK":
            print(f"✅ {name}")
            if "count" in result:
                print(f"   └─ {result['count']} 条记忆")
            if "models" in result:
                print(f"   └─ {result['models']} 个模型, bge: {'有' if result['has_bge'] else '无'}")
        else:
            print(f"❌ {name}: {result.get('error', 'unknown')}")
            all_ok = False
    
    print("="*40)
    if all_ok:
        print("🎉 所有系统正常！")
    else:
        print("⚠️ 有系统需要关注")