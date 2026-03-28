"use client";

import { useEffect, useState } from "react";
import {
  createExperimentRecord,
  defaultPersonaIds,
  featuredTopics,
  type ExperimentInput,
  type ExperimentRecord,
  type RewardMode,
} from "./experiment-engine";
import { saveExperimentRecord } from "./experiment-storage";

type HomeExperimentLabProps = {
  createExperiment?: (input: ExperimentInput) => Promise<ExperimentRecord>;
  onOpenExperiment?: (id: string) => void;
};

const WAIT_STEPS = [
  "正在生成两个世界",
  "正在寻找第一句带偏的话",
  "正在推演救援分支",
];

function validateTopic(topic: string) {
  const normalized = topic.trim();

  if (!normalized) {
    return "问题不能为空。";
  }

  if (normalized.length > 80) {
    return "问题不能超过 80 个字。";
  }

  if (/[\u0000-\u001f\u007f]/.test(normalized)) {
    return "问题里包含当前版本不支持的异常字符。";
  }

  return null;
}

async function defaultCreateExperiment(input: ExperimentInput) {
  const record = createExperimentRecord(input);

  saveExperimentRecord(record);

  return record;
}

export function HomeExperimentLab({
  createExperiment = defaultCreateExperiment,
  onOpenExperiment,
}: HomeExperimentLabProps) {
  const [featuredTopicId, setFeaturedTopicId] = useState<string>(
    featuredTopics[0].id,
  );
  const [topic, setTopic] = useState<string>(featuredTopics[0].prompt);
  const [rewardMode, setRewardMode] = useState<RewardMode>("on");
  const [formError, setFormError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      setActiveStep(null);
      return;
    }

    const timers = WAIT_STEPS.map((_, index) =>
      window.setTimeout(() => {
        setActiveStep(index);
      }, index * 220),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isRunning]);

  async function handleStart() {
    const error = validateTopic(topic);

    if (error) {
      setFormError(error);
      return;
    }

    if (isRunning) {
      return;
    }

    setFormError(null);
    setRunError(null);
    setIsRunning(true);

    try {
      const recordPromise = createExperiment({
        featuredTopicId,
        topic: topic.trim(),
        rewardMode,
        personaIds: defaultPersonaIds,
      });
      const waitPromise = new Promise((resolve) => {
        window.setTimeout(resolve, WAIT_STEPS.length * 220);
      });
      const [record] = await Promise.all([recordPromise, waitPromise]);
      const openExperiment =
        onOpenExperiment ??
        ((id: string) => {
          window.location.assign(`/experiments/${id}`);
        });

      openExperiment(record.id);
    } catch {
      setIsRunning(false);
      setRunError("这次实验没有成功生成，请稍后重试。");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-10 px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex items-center justify-between border-b border-[color:var(--line)] pb-4">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[color:var(--muted)]">
            agent-hub / evidence lab
          </p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            互联网舆论解剖台，不是 AI 讨论广场。
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[color:var(--muted)] sm:text-sm">
          <span className="border border-[color:var(--line)] px-3 py-1">
            双世界对照
          </span>
          <span className="border border-[color:var(--line)] px-3 py-1">
            10 轮 / 3 阶段
          </span>
        </div>
      </header>

      <section
        data-testid="hero-stage"
        className="grid gap-8 border border-[color:var(--rail)] bg-[rgba(242,235,222,0.92)] p-5 shadow-[10px_10px_0_rgba(24,21,18,0.1)] lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] lg:p-8"
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
            <span className="border border-[color:var(--line)] px-3 py-1">
              今日样本
            </span>
            <span className="border border-[color:var(--line)] px-3 py-1">
              第一轮仍有体面
            </span>
            <span className="border border-[color:var(--line)] px-3 py-1 text-[color:var(--oxide)]">
              第七轮开始奖励表演
            </span>
          </div>

          <div className="max-w-4xl space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
              现场问题
            </p>
            <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl lg:text-6xl">
              当体面讨论开始奖励情绪表演，问题会先死，还是人先变形？
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
              我们把同一个普通问题放进两个平行世界：左边保留迟缓、具体、带证据的回应，
              右边放大热度奖励和姿态竞争。你先看到结论，再一路追到第一句带偏的话。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleStart}
              disabled={isRunning}
              className="inline-flex min-h-11 items-center justify-center border border-[color:var(--rail)] bg-[color:var(--rail)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--paper)] transition hover:-translate-y-0.5 hover:bg-[color:var(--oxide)] disabled:cursor-progress disabled:opacity-80"
            >
              {isRunning ? "实验已开始生成" : "开始观察双世界实验"}
            </button>
            <p className="max-w-sm text-sm leading-7 text-[color:var(--muted)]">
              首屏只给一个动作：先看讨论怎么坏掉，再决定要不要改参数。
            </p>
          </div>

          <div
            aria-live="polite"
            className={`grid gap-2 border border-dashed border-[color:var(--line)] p-4 text-sm leading-7 text-[color:var(--muted)] ${isRunning ? "block" : "hidden"}`}
          >
            {WAIT_STEPS.map((step, index) => (
              <p
                key={step}
                className={
                  activeStep === index
                    ? "text-[color:var(--ink)]"
                    : "text-[color:var(--muted)]"
                }
              >
                <span className="mr-2" aria-hidden="true">
                  {activeStep === index ? ">" : "-"}
                </span>
                <span>{step}</span>
              </p>
            ))}
          </div>
        </div>

        {/* 右侧证据轨用于建立“调查板”感，而不是功能卖点卡片。 */}
        <aside className="grid gap-4 border-t border-[color:var(--line)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="space-y-3 border border-[color:var(--line)] bg-[rgba(24,21,18,0.04)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              双世界分叉预告
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="border-l-2 border-[color:var(--cold)] pl-3">
                <p className="text-sm font-semibold">世界 A / 迟缓世界</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                  具体经验还活着，争论围绕问题本身打转。
                </p>
              </div>
              <div className="border-l-2 border-[color:var(--oxide)] pl-3">
                <p className="text-sm font-semibold">
                  {rewardMode === "on"
                    ? "世界 B / 热度世界"
                    : "世界 B / 收紧后的热度世界"}
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                  {rewardMode === "on"
                    ? "立场宣言越来越像主角，问题越来越像背景布。"
                    : "冲突还在升温，但不再那么快掉进全面清算。"}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[color:var(--line)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              三阶段轨迹
            </p>
            <ol className="space-y-3 text-sm leading-7">
              <li className="border-b border-[color:var(--line)] pb-2">
                <strong>01 正常讨论</strong>
                <p className="text-[color:var(--muted)]">经验、建议、事实还在同桌。</p>
              </li>
              <li className="border-b border-[color:var(--line)] pb-2">
                <strong>02 立场固化</strong>
                <p className="text-[color:var(--muted)]">身份和姿态开始压过问题。</p>
              </li>
              <li>
                <strong>03 舆论失控</strong>
                <p className="text-[color:var(--muted)]">事实退场，只剩下引战效率。</p>
              </li>
            </ol>
          </div>
        </aside>
      </section>

      {/* 控制区刻意下沉到主舞台之后，避免首页第一眼被误读成参数面板。 */}
      <section
        data-testid="control-deck"
        className="grid gap-5 border border-[color:var(--line)] bg-[rgba(242,235,222,0.88)] p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              实验控制台
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl">
              先用默认样本开跑，再决定要换掉哪一个条件
            </h2>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              {featuredTopics.map((featuredTopic) => (
                <button
                  key={featuredTopic.id}
                  type="button"
                  onClick={() => {
                    setFeaturedTopicId(featuredTopic.id);
                    setTopic(featuredTopic.prompt);
                    setFormError(null);
                  }}
                  className={`min-h-11 border px-3 py-2 text-sm transition ${featuredTopicId === featuredTopic.id ? "border-[color:var(--rail)] bg-[color:var(--rail)] text-[color:var(--paper)]" : "border-[color:var(--line)] text-[color:var(--muted)]"}`}
                >
                  {featuredTopic.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">样本问题</span>
                <textarea
                  aria-label="样本问题"
                  value={topic}
                  onChange={(event) => {
                    setTopic(event.target.value);
                    setFormError(null);
                  }}
                  className="min-h-28 w-full resize-none border border-[color:var(--line)] bg-transparent px-3 py-3 text-sm leading-7 text-[color:var(--ink)] outline-none"
                />
              </label>

              <div className="grid gap-4">
                <div className="border border-[color:var(--line)] p-3">
                  <p className="text-sm font-medium">默认 4 人格</p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                    道德裁判官 / 经验分享者 / 冷眼犬儒者 / 热点搬运工
                  </p>
                </div>
                <div className="border border-[color:var(--line)] p-3">
                  <p className="text-sm font-medium">热度奖励开关</p>
                  <div className="mt-3 flex gap-2 text-sm">
                    <button
                      type="button"
                      aria-pressed={rewardMode === "on"}
                      onClick={() => setRewardMode("on")}
                      className={`min-h-11 border px-3 py-2 ${rewardMode === "on" ? "border-[color:var(--rail)] bg-[color:var(--rail)] text-[color:var(--paper)]" : "border-[color:var(--line)] text-[color:var(--muted)]"}`}
                    >
                      开
                    </button>
                    <button
                      type="button"
                      aria-pressed={rewardMode === "off"}
                      onClick={() => setRewardMode("off")}
                      className={`min-h-11 border px-3 py-2 ${rewardMode === "off" ? "border-[color:var(--rail)] bg-[color:var(--rail)] text-[color:var(--paper)]" : "border-[color:var(--line)] text-[color:var(--muted)]"}`}
                    >
                      关
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {formError ? (
              <p className="text-sm text-[color:var(--oxide)]">{formError}</p>
            ) : null}
            {runError ? (
              <p className="text-sm text-[color:var(--oxide)]">{runError}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 border-t border-[color:var(--line)] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="border border-[color:var(--line)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              本轮会产出
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--muted)]">
              <li>双世界差异摘要</li>
              <li>第一句带偏的话</li>
              <li>单次反事实救援结论</li>
              <li>10 轮完整证据时间线</li>
            </ul>
          </div>
          <div className="border border-[color:var(--line)] bg-[rgba(147,57,47,0.06)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              观察提醒
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              这不是为了找出谁更聪明，而是为了找出平台究竟奖励了哪种说法，
              又是哪一个转折点把问题本身挤出了现场。
            </p>
          </div>
          <button
            type="button"
            onClick={handleStart}
            disabled={isRunning}
            className="inline-flex min-h-11 items-center justify-center border border-[color:var(--rail)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--rail)] transition hover:-translate-y-0.5 hover:bg-[rgba(24,21,18,0.04)] disabled:cursor-progress disabled:opacity-70"
          >
            用当前条件生成实验
          </button>
        </div>
      </section>
    </main>
  );
}
