#!/usr/bin/env python3
"""
LLM Wiki Auto-Learning Framework
高鲁棒、高质量、高性能自动化学习循环

基于需求 + LLM Wiki 原文设计
"""

import os
import time
import subprocess
import re
from datetime import datetime
from pathlib import Path

# 配置
WORKSPACE = "/home/ai/.openclaw/workspace"
ENTITIES_DIR = f"{WORKSPACE}/memory/entities"
RAW_SOURCES_DIR = f"{WORKSPACE}/memory/raw"
LOG_FILE = f"{WORKSPACE}/memory/log.md"
ARCHIVE_DIR = f"{WORKSPACE}/memory/entities-archive"

# LLM Wiki 原文核心要点
CORE_PRINCIPLES = {
    "not_rag": "不是RAG，是增量构建持久wiki",
    "compile_once": "知识编译一次，持续更新",
    "touch_10_15": "一个source触发10-15页更新",
    "maintenance_zero": "维护成本接近零",
    "human_role": "人负责选源、提问、思考",
    "llm_role": "LLM负责执行维护",
    "query_writeback": "好答案写回wiki",
    "memex": "LLM解决维护问题"
}

class WikiAutoLearn:
    def __init__(self):
        self.stats = {
            "iterations": 0,
            "ingested": 0,
            "fixed": 0,
            "queries": 0,
            "errors": 0
        }
        
    def log(self, msg):
        """带时间戳的日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {msg}")
        
    def scan_sources(self):
        """1. 扫描知识源 (Ingest)"""
        sources = []
        
        # 扫描 docs/
        docs_dir = Path(f"{WORKSPACE}/docs")
        if docs_dir.exists():
            for f in docs_dir.glob("*.md"):
                sources.append(("doc", str(f)))
        
        # 扫描 skills/
        skills_dir = Path(f"{WORKSPACE}/skills")
        if skills_dir.exists():
            for f in skills_dir.iterdir():
                if f.is_dir():
                    sources.append(("skill", str(f)))
        
        return sources
    
    def synthesize(self, source):
        """2. 思考合成 (Synthesize) - 对照原文核心"""
        source_type, source_path = source
        name = Path(source_path).name
        
        # 对照 LLM Wiki 原文核心
        analysis = {
            "name": name,
            "type": source_type,
            "value": "unknown",
            "relevance": "unknown",
            "action": "skip"
        }
        
        # 根据原文：知识是否与现有 wiki 相关？
        # 是否值得编译到 wiki？
        # 是否能增强现有实体页？
        
        # 简单判断：与 OpenClaw、Claude Code、Skills 相关则入
        keywords = ["claude", "code", "openclaw", "skill", "tool", "agent"]
        if any(k in name.lower() for k in keywords):
            analysis["value"] = "high"
            analysis["action"] = "ingest"
        
        return analysis
    
    def write_back(self, analysis):
        """3. 写回 (Write-back)"""
        if analysis["action"] != "ingest":
            return False
        
        # 根据原文：更新实体页、索引、log
        # 一个 source 最多可影响 10-15 页
        
        # 检查是否已有对应实体页
        entity_name = analysis["name"].lower().replace(".md", "").replace(" ", "-")
        entity_file = Path(ENTITIES_DIR) / f"{entity_name}.md"
        
        # 检查 blocklist（防止重复摄入已标记的 entity）
        blocklist_path = Path(WORKSPACE) / "memory" / ".wiki-learn-blocklist"
        if blocklist_path.exists():
            blocklist = blocklist_path.read_text().strip().split('\n')
            if entity_name in [b.strip() for b in blocklist if b.strip()]:
                self.log(f"  ⏭️  跳过 blocklisted: {entity_name}")
                return False
        
        # 检查 archive（已被 wiki-learn-once 移出的 entity）
        archive_file = Path(ARCHIVE_DIR) / f"{entity_name}.md"
        if archive_file.exists():
            self.log(f"  ⏭️  跳过已归档: {entity_name}")
            return False
        
        if not entity_file.exists():
            # 创建新实体页
            content = f"""---
title: {analysis['name']}
type: entity
status: auto-ingested
last_updated: {datetime.now().strftime('%Y-%m-%d')}
tags: [auto, {analysis['type']}]
---

# {analysis['name']}

> 自动从 {analysis['type']} 摄入

## 来源

- 类型: {analysis['type']}
- 路径: {analysis['name']}
- 摄入时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## 分析

基于 LLM Wiki 原文分析：
- 价值评估: {analysis['value']}
- 相关性: {analysis['relevance']}

## 相关页面

- [[llm-wiki]] - LLM Wiki 模式
- [[ai-usage]] - AI 如何使用
"""
            entity_file.write_text(content, encoding='utf-8')
            self.log(f"  📝 创建实体页: {entity_name}")
            return True
        
        return False
    
    def lint_check(self):
        """4. Lint 检查"""
        issues = {
            "dead_links": [],
            "orphans": [],
            "stale": []
        }
        
        # 死链检查
        entity_files = list(Path(ENTITIES_DIR).glob("*.md"))
        all_links = set()
        
        for ef in entity_files:
            content = ef.read_text(encoding='utf-8')
            # 提取 [[link]] 格式
            links = re.findall(r'\[\[([a-z0-9-]+)\]\]', content)
            all_links.update(links)
        
        # 检查死链
        for link in all_links:
            if not (Path(ENTITIES_DIR) / f"{link}.md").exists():
                issues["dead_links"].append(link)
        
        # 修复死链
        for dl in issues["dead_links"]:
            # 简单处理：移除死链引用
            for ef in entity_files:
                content = ef.read_text(encoding='utf-8')
                new_content = content.replace(f"[[{dl}]]", "")
                if new_content != content:
                    ef.write_text(new_content, encoding='utf-8')
                    self.log(f"  🔧 修复死链: {dl}")
        
        return issues
    
    def run_cycle(self, cycle_num):
        """执行一个完整循环"""
        self.stats["iterations"] += 1
        
        # 1. Ingest - 扫描新知识
        sources = self.scan_sources()
        
        # 2. Synthesize - 思考每个源
        ingested_count = 0
        for source in sources:
            analysis = self.synthesize(source)
            if self.write_back(analysis):
                ingested_count += 1
                self.stats["ingested"] += 1
        
        # 3. Lint - 检查健康
        issues = self.lint_check()
        fixed = len(issues["dead_links"])
        self.stats["fixed"] += fixed
        
        # 4. 记录到 log (符合原文格式)
        self._append_log(cycle_num, sources, issues)
        
        # 输出状态
        self.log(f"  循环 {cycle_num}: 扫描 {len(sources)} 个源, "
                f"摄入 {ingested_count} 个, 修复 {fixed} 个死链")
        
        return {
            "sources": len(sources),
            "ingested": ingested_count,
            "fixed": fixed,
            "dead_links": len(issues["dead_links"])
        }
    
    def _append_log(self, cycle, sources, issues):
        """追加到 log.md (符合原文格式)"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        entry = f"\n## [{timestamp}] auto-cycle | iter {cycle} | sources:{len(sources)} | fixed:{len(issues['dead_links'])}"
        
        with open(LOG_FILE, "a", encoding='utf-8') as f:
            f.write(entry)
    
    def run(self, duration_minutes=420, interval_seconds=120):
        """运行自动化循环"""
        cycles = (duration_minutes * 60) // interval_seconds
        
        self.log(f"=== 启动 {duration_minutes} 分钟自动化学习循环 ===")
        self.log(f"周期: {interval_seconds}秒, 总循环: {cycles} 次")
        self.log(f"核心原则: {CORE_PRINCIPLES}")
        
        for i in range(1, cycles + 1):
            try:
                result = self.run_cycle(i)
                
                # 进度
                percent = int(i * 100 / cycles)
                print(f"[PROGRESS] {percent}% | {i}/{cycles} | ing:{result['ingested']} fix:{result['fixed']}")
                
            except Exception as e:
                self.log(f"  ❌ 错误: {e}")
                self.stats["errors"] += 1
            
            time.sleep(interval_seconds)
        
        self.log(f"=== 循环完成 ===")
        self.log(f"统计: {self.stats}")


if __name__ == "__main__":
    wiki = WikiAutoLearn()
    wiki.run(duration_minutes=420, interval_seconds=120)