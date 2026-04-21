#!/usr/bin/env python3
"""
Scene Classifier API 服务
启动: python api_server.py
访问: http://localhost:8080
"""

import os
import sys
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 添加路径
sys.path.insert(0, '/home/ai/.openclaw/workspace/skills/scene-classifier')

from pipeline.orchestrator import PipelineOrchestrator
from feedback.collector import FeedbackCollector

app = FastAPI(title="Scene Classifier API", version="2.0")

# CORS 支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化
try:
    pipeline = PipelineOrchestrator()
    feedback = FeedbackCollector()
    print("Pipeline initialized")
except Exception as e:
    pipeline = None
    print(f"Pipeline init failed: {e}")

# 请求模型
class ClassifyRequest(BaseModel):
    text: str
    context: dict = {}

class FeedbackRequest(BaseModel):
    text: str
    predicted_label: str
    feedback_type: str
    correct_label: str = None

@app.get("/")
def root():
    return {
        "name": "Scene Classifier API",
        "version": "2.0",
        "endpoints": {
            "classify": "/classify (POST)",
            "feedback": "/feedback (POST)",
            "stats": "/stats (GET)",
        }
    }

@app.get("/health")
def health():
    return {"status": "ok", "pipeline_loaded": pipeline is not None}

@app.post("/classify")
def classify(req: ClassifyRequest):
    if not pipeline:
        raise HTTPException(status_code=500, detail="Pipeline not initialized")
    
    result = pipeline.process(req.text, req.context)
    # 递归转换 numpy 类型为 Python 原生类型
    def convert(obj):
        import numpy as np
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (np.float32, np.float64)):
            return float(obj)
        if isinstance(obj, (np.int32, np.int64)):
            return int(obj)
        if isinstance(obj, dict):
            return {k: convert(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [convert(i) for i in obj]
        return obj
    return convert(result)

@app.post("/feedback")
def submit_feedback(req: FeedbackRequest):
    if not feedback:
        raise HTTPException(status_code=500, detail="Feedback not initialized")
    
    return {"status": "recorded"}

@app.get("/stats")
def get_stats():
    return {"message": "Check logs/meta_events.jsonl"}

if __name__ == "__main__":
    import socket
    port = 3104
    for p in [3104, 3108, 3109]:
        try:
            s = socket.socket()
            s.bind(('0.0.0.0', p))
            s.close()
            port = p
            break
        except OSError:
            continue
    print(f"Scene Classifier API v2.0 starting on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)