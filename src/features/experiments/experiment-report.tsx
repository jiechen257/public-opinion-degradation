"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { metricLabel, type ExperimentRecord } from "./experiment-engine";
import { readExperimentState } from "./experiment-storage";

function ExperimentErrorState({ message }: { message: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[960px] flex-col gap-6 px-5 py-10 sm:px-8">
      <div className="border border-[color:var(--rail)] bg-[rgba(242,235,222,0.92)] p-6 shadow-[10px_10px_0_rgba(24,21,18,0.08)]">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
          experiment state
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl">
          这次结案页暂时无法直接阅读
        </h1>
        <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">{message}</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center border border-[color:var(--rail)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--rail)]"
        >
          返回首页重新操盘
        </Link>
      </div>
    </main>
  );
}

function ExperimentLoadingState() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
      <div className="h-24 animate-pulse border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)]" />
      <div className="h-80 animate-pulse border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)]" />
    </main>
  );
}

export function ExperimentReport({
  experiment,
  versionMessage,
}: {
  experiment: ExperimentRecord;
  versionMessage?: string;
}) {
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(experiment.rounds.length - 1);
  const selectedRound = experiment.rounds[selectedRoundIndex] ?? experiment.rounds[0];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-[color:var(--line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]"
          >
            返回圆桌
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
            experiment / closing board
          </p>
          <h1 className="max-w-5xl font-[family-name:var(--font-display)] text-3xl leading-tight sm:text-4xl lg:text-5xl">
            {experiment.topic}
          </h1>
        </div>

        <p className="max-w-xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          {experiment.stageSummary}
        </p>
      </header>

      {versionMessage ? (
        <section className="border border-[color:var(--signal)] bg-[rgba(212,169,94,0.12)] p-4 text-sm leading-7 text-[color:var(--muted)]">
          <p className="font-semibold text-[color:var(--ink)]">版本提示</p>
          <p className="mt-2">{versionMessage}</p>
        </section>
      ) : null}

      <section className="grid gap-4 border border-[color:var(--rail)] bg-[rgba(242,235,222,0.92)] p-5 shadow-[10px_10px_0_rgba(24,21,18,0.08)] lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-7">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            closing verdict
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            终局判定
          </h2>
          <p className="text-3xl leading-tight">{experiment.outcome.title}</p>
          <p className="text-base leading-8">{experiment.outcome.verdict}</p>
        </div>

        <div className="grid gap-4 border border-[color:var(--line)] bg-[rgba(147,57,47,0.06)] p-4">
          <p className="text-sm font-semibold">结案摘要</p>
          <p className="text-sm leading-7 text-[color:var(--muted)]">
            {experiment.outcome.summary}
          </p>
          <p className="text-sm leading-7 text-[color:var(--muted)]">
            {experiment.outcome.closingNote}
          </p>
        </div>
      </section>

      <section className="space-y-4 border border-[color:var(--line)] bg-[rgba(242,235,222,0.88)] p-5 lg:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              replay
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
              失控路径回放
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[color:var(--muted)]">
            这里回放的是你每一轮给平台下的分发指令，以及它如何改变下一轮的桌面。
          </p>
        </div>

        <ol className="grid gap-3">
          {experiment.rounds.map((round) => (
            <li
              key={`replay-${round.round}`}
              className="grid gap-2 border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-4 lg:grid-cols-[120px_minmax(0,0.9fr)_minmax(0,1.1fr)]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  第 {round.round} 轮
                </p>
                <p className="mt-2 text-sm font-semibold">{round.phase}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {round.selectedActionLabel ?? "系统先给出正常现场"}
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                  {round.selectedActionImpact ?? round.rewardSignal}
                </p>
              </div>
              <div className="grid gap-1 text-sm leading-7 text-[color:var(--muted)]">
                <p>{round.focus}</p>
                <p>{round.rewardSignal}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4 border border-[color:var(--line)] bg-[rgba(242,235,222,0.9)] p-5 lg:p-7">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            expression split
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            被奖励的表达 / 被挤掉的表达
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="grid gap-3 border border-[color:var(--oxide)] bg-[rgba(147,57,47,0.08)] p-4">
            <p className="text-sm font-semibold text-[color:var(--ink)]">被平台奖励出来的表达</p>
            <ul className="grid gap-2 text-sm leading-7">
              {experiment.promotedPatterns.map((pattern) => (
                <li key={pattern}>{pattern}</li>
              ))}
            </ul>
          </article>

          <article className="grid gap-3 border border-[color:var(--cold)] bg-[rgba(122,148,170,0.08)] p-4">
            <p className="text-sm font-semibold text-[color:var(--ink)]">最早被挤出桌面的表达</p>
            <ul className="grid gap-2 text-sm leading-7">
              {experiment.displacedPatterns.map((pattern) => (
                <li key={pattern}>{pattern}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="space-y-4 border border-[color:var(--line)] bg-[rgba(242,235,222,0.9)] p-5 lg:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              evidence
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
              圆桌证据回看
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[color:var(--muted)]">
            证据层不再抢第一视图，但每一轮的动作、指标和发言都能回看。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {experiment.rounds.map((round, index) => (
            <button
              key={`round-tab-${round.round}`}
              type="button"
              aria-pressed={selectedRoundIndex === index}
              onClick={() => setSelectedRoundIndex(index)}
              className={`min-h-11 border px-3 py-2 text-sm ${
                selectedRoundIndex === index
                  ? "border-[color:var(--rail)] bg-[color:var(--rail)] text-[color:var(--paper)]"
                  : "border-[color:var(--line)] text-[color:var(--muted)]"
              }`}
            >
              第 {round.round} 轮
            </button>
          ))}
        </div>

        <div className="grid gap-4 border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          <div className="grid gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                当前轮次
              </p>
              <p className="mt-2 text-2xl font-[family-name:var(--font-display)]">
                第 {selectedRound.round} 轮 / {selectedRound.phase}
              </p>
            </div>

            <div className="grid gap-3 border border-[color:var(--line)] p-4 text-sm leading-7 text-[color:var(--muted)]">
              <p className="font-semibold text-[color:var(--ink)]">平台动作</p>
              <p>{selectedRound.selectedActionLabel ?? "系统先给出初始现场"}</p>
              <p>{selectedRound.selectedActionImpact ?? selectedRound.rewardSignal}</p>
            </div>

            <div className="grid gap-3 border border-[color:var(--line)] p-4">
              <p className="text-sm font-semibold">指标快照</p>
              {Object.entries(selectedRound.metrics).map(([metric, value]) => (
                <div key={metric} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>{metricLabel(metric as keyof typeof selectedRound.metrics)}</span>
                    <span className="text-[color:var(--muted)]">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden bg-[rgba(24,21,18,0.08)]">
                    <div
                      className="h-full bg-[color:var(--rail)]"
                      style={{ width: `${Math.max(10, value as number)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {selectedRound.comments.map((comment) => (
              <article
                key={`${selectedRound.round}-${comment.personaId}`}
                className="grid gap-2 border border-[color:var(--line)] p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{comment.speaker}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {comment.role}
                  </p>
                </div>
                <p className="text-base leading-8">{comment.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function ExperimentReportShell({ experimentId }: { experimentId: string }) {
  const [state, setState] = useState<
    ReturnType<typeof readExperimentState> | { kind: "loading" }
  >({ kind: "loading" });

  useEffect(() => {
    setState(readExperimentState(experimentId));
  }, [experimentId]);

  if (state.kind === "loading") {
    return <ExperimentLoadingState />;
  }

  if (state.kind === "missing" || state.kind === "invalid") {
    return <ExperimentErrorState message={state.message} />;
  }

  return (
    <ExperimentReport
      experiment={state.experiment}
      versionMessage={state.versionMessage}
    />
  );
}
