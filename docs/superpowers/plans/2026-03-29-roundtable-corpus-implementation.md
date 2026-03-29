# Roundtable Corpus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为圆桌实验补一条“SQLite 语料库 -> 前端可读快照 -> 角色发言生成”的最小可用链路。

**Architecture:** 使用仓库内的 SQLite 文件承载角色语料与来源元数据，用 Node 脚本生成数据库并导出一份精简 JSON 快照。前端实验引擎只消费快照，不直接访问 SQLite；当语料不足时保留现有硬编码文案作为回退。

**Tech Stack:** Node.js scripts, SQLite, Next.js, Vitest, TypeScript

---

### Task 1: 固化测试断言，先证明引擎还不会用语料

**Files:**
- Modify: `src/features/experiments/experiment-engine.test.ts`
- Test: `src/features/experiments/experiment-engine.test.ts`

- [ ] **Step 1: 写失败测试**

在实验引擎测试里新增一条断言，验证某个角色的开场发言会优先命中语料快照中的真实样本，而不是继续只靠内置 `voiceBank`。

- [ ] **Step 2: 运行测试确认失败**

Run: `corepack pnpm test src/features/experiments/experiment-engine.test.ts`
Expected: FAIL，提示当前输出未命中语料快照样本或未包含语料层信号。

- [ ] **Step 3: 保持测试最小化**

断言只覆盖一个角色、一个话题、一个可预期样本，不把语料排序和整轮行为一次性绑死。

- [ ] **Step 4: 再跑一次确认仍为真实失败**

Run: `corepack pnpm test src/features/experiments/experiment-engine.test.ts`
Expected: FAIL，且失败原因仍是“未接入语料”，不是测试拼写或导入错误。

### Task 2: 建 SQLite 数据层和种子语料

**Files:**
- Create: `data/roundtable-corpus.sqlite`
- Create: `scripts/build-roundtable-corpus.mjs`
- Create: `src/features/experiments/roundtable-corpus.seed.json`
- Create: `src/features/experiments/roundtable-corpus.generated.json`
- Modify: `package.json`

- [ ] **Step 1: 定义最小 schema**

库中至少包含：
- `sources`：来源平台、来源类型、链接、许可、备注
- `persona_examples`：角色 ID、主题标签、动作标签、原始文本、摘要文本、细节线索、强度、来源 ID

- [ ] **Step 2: 准备首批种子语料**

按当前 4 个默认角色准备一批真实感更强、具体到生活场景的样本，覆盖至少：
- `baseline`
- `amplify-emotion`
- `amplify-conflict`
- `reward-spectacle`
- `suppress-context`

- [ ] **Step 3: 写数据库构建脚本**

脚本负责：
- 创建 SQLite 文件
- 建表
- 清空并重建种子数据
- 导出前端可用 JSON 快照

- [ ] **Step 4: 运行脚本产出 SQLite 和快照**

Run: `node scripts/build-roundtable-corpus.mjs`
Expected: 生成 `data/roundtable-corpus.sqlite` 和 `src/features/experiments/roundtable-corpus.generated.json`

### Task 3: 让实验引擎吃到语料快照

**Files:**
- Create: `src/features/experiments/roundtable-corpus.ts`
- Modify: `src/features/experiments/experiment-engine.ts`
- Test: `src/features/experiments/experiment-engine.test.ts`

- [ ] **Step 1: 写最小读取层**

封装语料快照的读取与筛选，按 `personaId + dominantAction` 优先匹配，未命中时回退到 `baseline`。

- [ ] **Step 2: 最小改动接入 `commentText()`**

让 `commentText()` 优先使用语料快照中的开场/跟进句，再保留当前 `voiceBank` 作为兜底。

- [ ] **Step 3: 跑单测确认转绿**

Run: `corepack pnpm test src/features/experiments/experiment-engine.test.ts`
Expected: PASS

- [ ] **Step 4: 只在绿灯后做轻量整理**

如果需要，只提取一个小 helper，避免把 `experiment-engine.ts` 再次堆大。

### Task 4: 验证整条链路

**Files:**
- Test: `src/features/experiments/experiment-engine.test.ts`
- Test: `src/features/experiments/experiment-report.test.tsx`
- Test: `src/features/experiments/home-experiment-lab.test.tsx`

- [ ] **Step 1: 跑全量测试**

Run: `corepack pnpm test`
Expected: PASS，全量测试通过。

- [ ] **Step 2: 跑构建验证**

Run: `corepack pnpm build`
Expected: PASS，Next 构建通过。

- [ ] **Step 3: 检查产物与脏区**

Run: `git status --short`
Expected: 只包含本次任务涉及的脚本、数据、快照和实验引擎改动。
