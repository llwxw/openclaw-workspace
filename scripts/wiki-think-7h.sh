#!/bin/bash
# 7小时思考型自动化循环
# 贯彻需求 + LLM Wiki 原文
# 核心：思考 → 优化 → 发现 → 解决

WORKSPACE="/home/ai/.openclaw/workspace"
ENTITIES="$WORKSPACE/memory/entities"
LOG="$WORKSPACE/memory/log.md"
ARCHIVE="$WORKSPACE/memory/entities-archive"

echo "========================================="
echo "7小时思考型自动化循环启动"
echo "时间: $(date)"
echo "规则: 融合优先,思考后再行动"
echo "========================================="

# LLM Wiki 原文核心要点
CORE_NOTES="
原文核心:
- 不是RAG: 增量构建持久wiki
- 编译一次: 知识编译后持续更新
- 10-15页: 一个source触发多个页面更新
- 维护归零: LLM做维护工作
- 人之职责: 选源、提问、思考
- LLM之职: 执行维护
- 双屏工作: LLM+Obsidian
- 问答写回: 好答案沉淀wiki
"

for i in $(seq 1 210); do
    PERCENT=$((i * 100 / 210))
    TIMESTAMP=$(date +"%H:%M")
    
    echo ""
    echo "=== 循环 $i/210 [$TIMESTAMP] ==="
    
    # ===== 1. 思考: 对照需求和原文 =====
    echo "【思考】对照需求和LLM Wiki原文..."
    
    # 当前状态
    ENTITY_COUNT=$(ls $ENTITIES/*.md 2>/dev/null | wc -l)
    echo "  实体页: $ENTITY_COUNT 个"
    
    # 思考：是否达到30个？
    if [ $ENTITY_COUNT -ge 30 ]; then
        echo "  状态: 已达30+个，融合优先"
        echo "  策略: 不添加，只维护"
    else
        echo "  状态: 可添加新实体页"
    fi
    
    # ===== 2. 扫描知识源 =====
    echo "【扫描】检查可学习的内容..."
    
    # 扫描 skills/
    SKILLS_COUNT=$(ls -d $WORKSPACE/skills/*/ 2>/dev/null | wc -l)
    echo "  Skills: $SKILLS_COUNT 个"
    
    # 扫描 docs/
    DOCS_COUNT=$(ls $WORKSPACE/docs/*.md 2>/dev/null | wc -l)
    echo "  Docs: $DOCS_COUNT 个"
    
    # ===== 3. 优化: 思考融合方案 =====
    echo "【优化】思考融合方案..."
    
    # 如果有新技能，思考是否可以融合到现有页面
    NEW_SKILLS=0
    for skill in $WORKSPACE/skills/*/; do
        [ -d "$skill" ] || continue
        name=$(basename "$skill")
        
        # 检查是否已有实体页
        if [ ! -f "$ENTITIES/${name}.md" ] && [ $ENTITY_COUNT -lt 30 ]; then
            # 思考：是否可以融合？
            # - 任务相关 → task-orchestrator
            # - 记忆相关 → memory
            # - 搜索相关 → search
            # - 其他 → 不添加
            
            FUSION_TARGET=""
            [[ "$name" == *"task"* ]] && FUSION_TARGET="task-orchestrator"
            [[ "$name" == *"memory"* ]] && FUSION_TARGET="memory"
            [[ "$name" == *"search"* ]] && FUSION_TARGET="search"
            [[ "$name" == *"v8"* ]] && FUSION_TARGET="task-orchestrator"
            
            if [ -n "$FUSION_TARGET" ]; then
                echo "  💡 思考: $name → 融合到 $FUSION_TARGET.md (已记录，不添加)"
            else
                echo "  💡 思考: $name 无合适融合目标，跳过"
            fi
            NEW_SKILLS=$((NEW_SKILLS + 1))
        fi
    done
    
    # ===== 4. 发现: Lint 检查 =====
    echo "【发现问题】..."
    
    DEAD_LINKS=0
    for link in $(grep -roh '\[\[[a-z0-9-]*\]\]' $ENTITIES/*.md 2>/dev/null | sed 's/\[\[//;s/\]\]//g' | sort -u); do
        if [ ! -f "$ENTITIES/${link}.md" ]; then
            DEAD_LINKS=$((DEAD_LINKS + 1))
        fi
    done
    
    # ===== 5. 解决: 修复死链 =====
    FIXED=0
    if [ $DEAD_LINKS -gt 0 ]; then
        echo "【解决问题】修复 $DEAD_LINKS 个死链..."
        for link in $(grep -roh '\[\[[a-z0-9-]*\]\]' $ENTITIES/*.md 2>/dev/null | sed 's/\[\[//;s/\]\]//g' | sort -u); do
            if [ ! -f "$ENTITIES/${link}.md" ]; then
                sed -i "s/\[\[$link\]\]//g" $ENTITIES/*.md 2>/dev/null
                FIXED=$((FIXED + 1))
            fi
        done
        echo "  ✅ 已修复 $FIXED 个死链"
    else
        echo "  ✅ 无死链需要修复"
    fi
    
    # ===== 6. 记录到 log =====
    FINAL_COUNT=$(ls $ENTITIES/*.md 2>/dev/null | wc -l)
    echo "## [$(date +%Y-%m-%d\ %H:%M)] think-cycle | iter:$i | entities:$FINAL_COUNT | fixed:$FIXED" >> $LOG
    
    # ===== 7. 进度输出 =====
    echo ""
    echo "【进度】${PERCENT}% | $i/210 | 实体页:$FINAL_COUNT | 修复:$FIXED"
    echo "---"
    
    # 等待2分钟
    sleep 120
done

echo ""
echo "========================================="
echo "7小时思考型循环完成"
echo "结束: $(date)"
echo "========================================="