# Roundtable Reference Importer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为圆桌语料库补一个可复用的公开参考语料导入器，优先支持 Hugging Face 上的微博评论风格 JSONL 数据。

**Architecture:** 将下载与文件读取放在脚本层，将“抽取文本 -> 判断是否可用 -> 映射角色/动作 -> 产出 persona example”封装为可测试的纯函数。导入脚本把筛选后的样本写回 SQLite，并重新导出前端快照。

**Tech Stack:** Node.js scripts, SQLite, JSONL, Vitest, TypeScript/JavaScript

---

### Task 1: 先写导入映射失败测试

**Files:**
- Create: `src/features/experiments/roundtable-corpus-import.test.ts`
- Create: `src/features/experiments/roundtable-corpus-import.js`

- [ ] **Step 1: 写失败测试**

新增测试覆盖三件事：
- 能从常见 JSONL 结构里抽出中文文本
- 能过滤太短或明显不是评论现场的话
- 能把样本文本映射到圆桌角色和 dominant action

- [ ] **Step 2: 跑测试确认失败**

Run: `corepack pnpm test src/features/experiments/roundtable-corpus-import.test.ts`
Expected: FAIL，提示缺少导入映射函数或行为不符。

### Task 2: 实现纯函数导入层

**Files:**
- Create: `src/features/experiments/roundtable-corpus-import.js`
- Test: `src/features/experiments/roundtable-corpus-import.test.ts`

- [ ] **Step 1: 实现最小文本抽取**

兼容：
- `{ text }`
- `{ output }`
- `{ response }`
- `{ conversations: [...] }`

- [ ] **Step 2: 实现可用性过滤**

至少过滤：
- 非字符串
- 过短文本
- 明显系统提示/问答模板/纯英文

- [ ] **Step 3: 实现 persona 和 action 启发式映射**

角色优先支持：
- `moral-judge`
- `experience-sharer`
- `cynic`
- `trend-carrier`

- [ ] **Step 4: 跑测试转绿**

Run: `corepack pnpm test src/features/experiments/roundtable-corpus-import.test.ts`
Expected: PASS

### Task 3: 实现参考语料导入脚本

**Files:**
- Create: `scripts/import-roundtable-reference.mjs`
- Modify: `scripts/build-roundtable-corpus.mjs`
- Modify: `package.json`

- [ ] **Step 1: 让导入脚本支持 3 种入口**

支持：
- `--input <local-jsonl>`
- `--url <remote-jsonl-url>`
- `--source robert-llm-data` 使用内置默认 URL

- [ ] **Step 2: 导入到 SQLite**

导入前清理同一 source 的旧导入记录，再写入新的 `persona_examples`。

- [ ] **Step 3: 导出最新快照**

导入完成后自动调用已有构建流程或共用导出逻辑，保证前端快照同步更新。

### Task 4: 验证整条导入链路

**Files:**
- Test: `src/features/experiments/roundtable-corpus-import.test.ts`

- [ ] **Step 1: 运行导入单测**

Run: `corepack pnpm test src/features/experiments/roundtable-corpus-import.test.ts`
Expected: PASS

- [ ] **Step 2: 运行全量测试**

Run: `corepack pnpm test`
Expected: PASS

- [ ] **Step 3: 运行构建**

Run: `corepack pnpm build`
Expected: PASS
