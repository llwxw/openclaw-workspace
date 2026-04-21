---
title: LLM Wiki Original
type: reference
status: active
last_updated: 2026-04-11
tags: [llm-wiki, original, source]
---

# 📄 LLM Wiki 原文

> 原文来自用户分享，完整保存

---

## 核心思想

Most people's experience with LLMs and documents looks like RAG: you upload a collection of files, the LLM retrieves relevant chunks at query time, and generates an answer. This works, but the LLM is rediscovering knowledge from scratch on every question. There's no accumulation. Ask a subtle question that requires synthesizing five documents, and the LLM has to find and piece together the relevant fragments every time. Nothing is built up. NotebookLM, ChatGPT file uploads, and most RAG systems work this way.

The idea here is different. Instead of just retrieving from raw documents at query time, the LLM incrementally builds and maintains a persistent wiki — a structured, interlinked collection of markdown files that sits between you and the raw sources. When you add a new source, the LLM doesn't just index it for later retrieval. It reads it, extracts the key information, and integrates it into the existing wiki — updating entity pages, revising topic summaries, noting where new data contradicts old claims, strengthening or challenging the evolving synthesis. The knowledge is compiled once and then kept current, not re-derived on every query.

This is the key difference: the wiki is a persistent, compounding artifact. The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read. The wiki keeps getting richer with every source you add and every question you ask.

You never (or rarely) write the wiki yourself — the LLM writes and maintains all of it. You're in charge of sourcing, exploration, and asking the right questions. The LLM does all the grunt work — the summarizing, cross-referencing, filing, and bookkeeping that makes a knowledge base actually useful over time. In practice, I have the LLM agent open on one side and Obsidian open on the other. The LLM makes edits based on our conversation, and I browse the results in real time — following links, checking the graph view, reading the updated pages. Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase.

---

## 应用场景

This can apply to a lot of different contexts. A few examples:

- **Personal**: tracking your own goals, health, psychology, self-improvement — filing journal entries, articles, podcast notes, and building up a structured picture of yourself over time.

- **Research**: going deep on a topic over weeks or months — reading papers, articles, reports, and incrementally building a comprehensive wiki with an evolving thesis.

- **Reading a book**: filing each chapter as you go, building out pages for characters, themes, plot threads, and how they connect. By the end you have a rich companion wiki. Think of fan wikis like Tolkien Gateway — thousands of interlinked pages covering characters, places, events, languages, built by a community of volunteers over years. You could build something like that personally as you read, with the LLM doing all the cross-referencing and maintenance.

- **Business/team**: an internal wiki maintained by LLMs, fed by Slack threads, meeting transcripts, project documents, customer calls. Possibly with humans in the loop reviewing updates. The wiki stays current because the LLM does the maintenance that no one on the team wants to do.

- **Competitive analysis, due diligence, trip planning, course notes, hobby deep-dives** — anything where you're accumulating knowledge over time and want it organized rather than scattered.

---

## 架构 (三层次)

### 1. Raw Sources

your curated collection of source documents. Articles, papers, images, data files. These are immutable — the LLM reads from them but never modifies them. This is your source of truth.

### 2. Wiki

a directory of LLM-generated markdown files. Summaries, entity pages, concept pages, comparisons, an overview, a synthesis. The LLM owns this layer entirely. It creates pages, updates them when new sources arrive, maintains cross-references, and keeps everything consistent. You read it; the LLM writes it.

### 3. Schema

a document (e.g. CLAUDE.md for Claude Code or AGENTS.md for Codex) that tells the LLM how the wiki is structured, what the conventions are, and what workflows to follow when ingesting sources, answering questions, or maintaining the wiki. This is the key configuration file — it's what makes the LLM a disciplined wiki maintainer rather than a generic chatbot.

---

## Operations (三大操作)

### Ingest

You drop a new source into the raw collection and tell the LLM to process it. An example flow: the LLM reads the source, discusses key takeaways with you, writes a summary page in the wiki, updates the index, updates relevant entity and concept pages across the wiki, and appends an entry to the log. **A single source might touch 10-15 wiki pages.** Personally I prefer to ingest sources one at a time and stay involved — I read the summaries, check the updates, and guide the LLM on what to emphasize.

### Query

You ask questions against the wiki. The LLM searches for relevant pages, reads them, and synthesizes an answer with citations. Answers can take different forms depending on the question — a markdown page, a comparison table, a slide deck (Marp), a chart (matplotlib), a canvas. **The important insight: good answers can be filed back into the wiki as new pages.** A comparison you asked for, an analysis, a connection you discovered — these are valuable and shouldn't disappear into chat history.

### Lint

Periodically, ask the LLM to health-check the wiki. Look for:
- contradictions between pages
- stale claims that newer sources have superseded
- orphan pages with no inbound links
- important concepts mentioned but lacking their own page
- missing cross-references
- data gaps that could be filled with a web search

---

## Index 和 Log

### index.md (内容导向)

a catalog of everything in the wiki — each page listed with a link, a one-line summary, and optionally metadata like date or source count. Organized by category. The LLM updates it on every ingest. This works surprisingly well at moderate scale (~100 sources, ~hundreds of pages) and avoids the need for embedding-based RAG infrastructure.

### log.md (时间导向)

an append-only record of what happened and when — ingests, queries, lint passes. A useful tip: if each entry starts with a consistent prefix (e.g. `## [2026-04-02] ingest | Article Title`), the log becomes parseable with simple unix tools — `grep "^## \[" log.md | tail -5` gives you the last 5 entries.

---

## CLI 工具

### qmd

a local search engine for markdown files with hybrid BM25/vector search and LLM re-ranking, all on-device. It has both a CLI and an MCP server.

---

## Tips and Tricks

- **Obsidian Web Clipper**: browser extension that converts web articles to markdown
- **Download images locally**: set Attachment folder path to raw/assets/, bind Ctrl+Shift+D to download
- **Graph View**: best way to see the shape of your wiki
- **Marp**: markdown-based slide deck format
- **Dataview**: plugin that runs queries over page frontmatter
- **Git**: the wiki is just a git repo — version history, branching, collaboration for free

---

## Why This Works

The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping. Updating cross-references, keeping summaries current, noting when new data contradicts old claims, maintaining consistency across dozens of pages. Humans abandon wikis because the maintenance burden grows faster than the value. **LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass. The wiki stays maintained because the cost of maintenance is near zero.**

**The human's job is to curate sources, direct the analysis, ask good questions, and think about what it all means. The LLM's job is everything else.**

The idea is related in spirit to Vannevar Bush's Memex (1945) — a personal, curated knowledge store with associative trails between documents. Bush's vision was closer to this than to what the web became: private, actively curated, with the connections between documents as valuable as the documents themselves. **The part he couldn't solve was who does the maintenance. The LLM handles that.**

---

## 关键要点速记

| 要点 | 原文 |
|------|------|
| 不可类比 RAG | "Instead of just retrieving... incrementally builds and maintains a persistent wiki" |
| 编译一次，持续更新 | "knowledge is compiled once and then kept current" |
| 增量更新 | "a single source might touch 10-15 wiki pages" |
| 维护归零 | "cost of maintenance is near zero" |
| 人之职责 | "curate sources, direct the analysis, ask good questions" |
| LLM 之职 | "everything else" |
| 双屏工作 | "LLM on one side and Obsidian on the other" |
| 问答写回 | "good answers can be filed back into the wiki as new pages" |
| Memex | "The part he couldn't solve was who does the maintenance. The LLM handles that." |

---

*最后更新：2026-04-11*
---

## 相关页面

- [[openclaw]]
- [[memory]]
