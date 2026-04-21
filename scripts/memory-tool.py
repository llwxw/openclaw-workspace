#!/usr/bin/env python3
"""OpenClaw 向量记忆工具 - 直接添加/搜索记忆"""
import json
import os
import sys
import numpy as np
import requests

OLLAMA_URL = "http://172.23.96.1:11434"
MODEL = "bge-m3:latest"
DB_FILE = os.environ.get("HOME") + "/.openclaw/memory/vectors.json"

def get_embedding(text):
    resp = requests.post(f"{OLLAMA_URL}/api/embeddings", 
        json={"model": MODEL, "prompt": text}, timeout=30)
    return np.array(resp.json()["embedding"])

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

def load_db():
    try:
        with open(DB_FILE) as f:
            return json.load(f)
    except:
        return {"memories": []}

def save_db(db):
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    with open(DB_FILE, "w") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

def add_memory(text, source="chat"):
    emb = get_embedding(text)
    db = load_db()
    db["memories"].append({
        "text": text,
        "source": source,
        "embedding": emb.tolist()
    })
    save_db(db)
    return f"✅ 已记住: {text}"

def search_memory(query, top_k=5):
    q_emb = get_embedding(query)
    db = load_db()
    if not db["memories"]:
        return []
    
    results = []
    for m in db["memories"]:
        m_emb = np.array(m["embedding"])
        score = cosine_sim(q_emb, m_emb)
        results.append((score, m))
    
    results.sort(reverse=True)
    return results[:top_k]

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: memory-tool.py <add|search> <text>")
        sys.exit(1)
    
    action = sys.argv[1]
    text = " ".join(sys.argv[2:])
    
    if action == "add":
        print(add_memory(text))
    elif action == "search":
        results = search_memory(text)
        if not results:
            print("没有找到相关记忆")
        else:
            print(f"找到 {len(results)} 条相关记忆:")
            for score, m in results:
                print(f"  [{score:.2f}] {m['text']}")
    else:
        print(f"Unknown action: {action}")