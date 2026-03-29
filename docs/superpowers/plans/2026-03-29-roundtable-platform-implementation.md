# Roundtable Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把首页和结果页重构成“圆桌讨论 + 每轮平台动作 + 终局结案页”的完整主链路。

**Architecture:** 使用纯函数实验引擎维护 `6` 轮讨论状态、平台动作、指标变化和终局判定；首页驱动逐轮交互并在完成后保存实验记录；结果页从已保存记录中渲染结案页与证据回放。实现保留现有 Next.js App Router 和 localStorage 持久化方式，但重写实验数据模型以匹配新体验。

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library

---

### Task 1: 重写实验引擎数据模型

**Files:**
- Modify: `src/features/experiments/experiment-engine.ts`
- Test: `src/features/experiments/experiment-engine.test.ts`

- [ ] **Step 1: 写出失败测试**

验证会话能逐轮推进、指标递增、6 轮后生成终局记录。

- [ ] **Step 2: 运行测试确认失败**

Run: `corepack pnpm test src/features/experiments/experiment-engine.test.ts`

- [ ] **Step 3: 最小实现新引擎**

新增 roundtable session、platform action、metric history、result summary 等模型。

- [ ] **Step 4: 运行测试确认通过**

Run: `corepack pnpm test src/features/experiments/experiment-engine.test.ts`

### Task 2: 重写首页交互链路

**Files:**
- Modify: `src/features/experiments/home-experiment-lab.tsx`
- Modify: `src/app/page.tsx`
- Test: `src/features/experiments/home-experiment-lab.test.tsx`
- Test: `src/app/page.test.tsx`

- [ ] **Step 1: 写出失败测试**

验证首页能开始圆桌讨论、每轮只能选择一次平台动作、完成 6 轮后跳转结果页。

- [ ] **Step 2: 运行测试确认失败**

Run: `corepack pnpm test src/features/experiments/home-experiment-lab.test.tsx src/app/page.test.tsx`

- [ ] **Step 3: 最小实现首页主舞台**

实现话题选择、圆桌发言、动作面板、指标区、阶段轨迹和轮次推进。

- [ ] **Step 4: 运行测试确认通过**

Run: `corepack pnpm test src/features/experiments/home-experiment-lab.test.tsx src/app/page.test.tsx`

### Task 3: 重写结果页结案结构

**Files:**
- Modify: `src/features/experiments/experiment-report.tsx`
- Modify: `src/features/experiments/mock-experiments.ts`
- Modify: `src/features/experiments/experiment-storage.ts`
- Test: `src/features/experiments/experiment-report.test.tsx`

- [ ] **Step 1: 写出失败测试**

验证结果页按“终局判定 -> 操作回放 -> 表达分化 -> 证据回看”顺序渲染，并支持轮次回看。

- [ ] **Step 2: 运行测试确认失败**

Run: `corepack pnpm test src/features/experiments/experiment-report.test.tsx`

- [ ] **Step 3: 最小实现结案页**

按新模型渲染终局、平台动作回放、表达分化和证据时间线。

- [ ] **Step 4: 运行测试确认通过**

Run: `corepack pnpm test src/features/experiments/experiment-report.test.tsx`

### Task 4: 全量回归与文案收口

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/features/experiments/*.tsx`

- [ ] **Step 1: 运行全量测试**

Run: `corepack pnpm test`

- [ ] **Step 2: 收口页面文案与关键注释**

确认首页、结果页、状态提示和关键代码注释与设计一致。

- [ ] **Step 3: 再次运行全量测试**

Run: `corepack pnpm test`

## 执行选择

计划已保存到 `docs/superpowers/plans/2026-03-29-roundtable-platform-implementation.md`。本次按用户“继续”的意图，默认采用 Inline Execution，在当前会话直接按计划实现。
