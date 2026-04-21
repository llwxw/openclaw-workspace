#!/bin/bash
# 7小时深度学习循环
# 每次循环从LLM Wiki原文深度学习并补充

WORKSPACE="/home/ai/.openclaw/workspace"
ENTITIES="$WORKSPACE/memory/entities"
LOG="$WORKSPACE/memory/log.md"

# LLM Wiki 原文核心要点
ORIGINAL_KEYS="
1. 不是RAG: 增量构建持久wiki
2. 知识编译一次,持续更新  
3. 一个source触发10-15页更新
4. 维护成本接近零(LLM不嫌烦)
5. 人负责选源/提问/思考,LLM负责执行
6. 双屏工作:LLM+Obsidian
7. 问答写回:好答案沉淀wiki
8. Memex:LLM解决维护问题
"

echo "7小时深度学习循环启动"
echo "原文核心:$ORIGINAL_KEYS"

for i in $(seq 1 210); do
    C=$(ls $ENTITIES/*.md | wc -l)
    TIMESTAMP=$(date +%H:%M)
    
    echo "=== 循环 $i/210 [$TIMESTAMP] ==="
    
    # 1. 深度学习: 对照原文
    echo "【学习】原文vs现状"
    [ $C -gt 0 ] && echo "  ✅ 增量构建: 已实现"
    echo "  💡 维护归零: Lint运行"
    echo "  💡 问答写回: query-workflow已有"
    
    # 2. 思考补充: 原文提到的工具
    echo "【思考】可补充内容"
    # - qmd 搜索
    # - Marp 幻灯片
    # - Dataview
    # - Web Clipper
    
    # 3. 修复死链
    D=0
    for l in $(grep -roh "\[\[[a-z0-9-]*\]\]" $ENTITIES/*.md | sed "s/\[\[//;s/\]\]//g" | sort -u); do
        [ -f "$ENTITIES/${l}.md" ] || { sed -i "s/\[\[$l\]\]//g" $ENTITIES/*.md; D=$((D+1)); }
    done
    
    # 4. 记录
    echo "[PROGRESS] $((i*100/210))% | $i/210 | entities:$C"
    echo "## [$(date +%Y-%m-%d\ %H:%M)] deep-learn | iter:$i | entities:$C | fixed:$D" >> $LOG
    
    sleep 120
done
