"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ExperimentRecord, ExperimentWorld } from "./experiment-engine";
import { readExperimentState } from "./experiment-storage";

function worldAccent(world: ExperimentWorld) {
  return world.id === "world-a"
    ? {
        line: "border-[color:var(--cold)]",
        tone: "text-[color:var(--cold)]",
        wash: "bg-[rgba(122,148,170,0.08)]",
      }
    : {
        line: "border-[color:var(--oxide)]",
        tone: "text-[color:var(--oxide)]",
        wash: "bg-[rgba(147,57,47,0.08)]",
      };
}

function EvidenceTimeline({ world }: { world: ExperimentWorld }) {
  const accent = worldAccent(world);

  return (
    <section className={`border ${accent.line} p-4`}>
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--line)] pb-3">
        <div>
          <p className={`text-sm font-semibold ${accent.tone}`}>{world.label}</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{world.summary}</p>
        </div>
      </div>

      <ol className="mt-4 grid gap-4">
        {world.rounds.map((round) => (
          <li
            key={`${world.id}-${round.round}`}
            className="grid gap-2 border-b border-dashed border-[color:var(--line)] pb-4 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
              <span>Round {round.round}</span>
              <span>{round.phase}</span>
            </div>
            <p className="text-sm font-semibold">{round.speaker}</p>
            <p className="font-[family-name:var(--font-display)] text-xl leading-9">
              “{round.text}”
            </p>
            <p className="text-sm leading-7 text-[color:var(--muted)]">{round.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ExperimentErrorState({ message }: { message: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[960px] flex-col gap-6 px-5 py-10 sm:px-8">
      <div className="border border-[color:var(--rail)] bg-[rgba(242,235,222,0.92)] p-6 shadow-[10px_10px_0_rgba(24,21,18,0.08)]">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
          experiment state
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl">
          这次实验暂时无法直接阅读
        </h1>
        <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">{message}</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center border border-[color:var(--rail)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--rail)]"
        >
          返回首页重新运行
        </Link>
      </div>
    </main>
  );
}

function ExperimentLoadingState() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
      <div className="h-24 animate-pulse border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 animate-pulse border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)]" />
        <div className="h-56 animate-pulse border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)]" />
      </div>
    </main>
  );
}

export function ExperimentReport({
  experiment,
  partialMessage,
  versionMessage,
}: {
  experiment: ExperimentRecord;
  partialMessage?: string;
  versionMessage?: string;
}) {
  const [turningPointOpen, setTurningPointOpen] = useState(false);
  const [rescueState, setRescueState] = useState<"idle" | "loading" | "ready">(
    "idle",
  );
  const [selectedWorldId, setSelectedWorldId] = useState(
    experiment.worlds[0]?.id ?? "world-a",
  );
  const selectedWorld =
    experiment.worlds.find((world) => world.id === selectedWorldId) ??
    experiment.worlds[0];

  useEffect(() => {
    if (rescueState !== "loading") {
      return;
    }

    const timer = window.setTimeout(() => {
      setRescueState("ready");
    }, 360);

    return () => {
      window.clearTimeout(timer);
    };
  }, [rescueState]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-[color:var(--line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]"
          >
            返回样本台
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
            experiment / evidence report
          </p>
          <h1 className="max-w-5xl font-[family-name:var(--font-display)] text-3xl leading-tight sm:text-4xl lg:text-5xl">
            {experiment.topic}
          </h1>
        </div>

        <p className="max-w-xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          {experiment.stageSummary}
        </p>
      </header>

      {partialMessage ? (
        <section className="border border-[color:var(--oxide)] bg-[rgba(147,57,47,0.08)] p-4 text-sm leading-7 text-[color:var(--muted)]">
          <p className="font-semibold text-[color:var(--ink)]">无法形成完整对照</p>
          <p className="mt-2">{partialMessage}</p>
        </section>
      ) : null}

      {versionMessage ? (
        <section className="border border-[color:var(--signal)] bg-[rgba(212,169,94,0.12)] p-4 text-sm leading-7 text-[color:var(--muted)]">
          <p className="font-semibold text-[color:var(--ink)]">版本提示</p>
          <p className="mt-2">{versionMessage}</p>
        </section>
      ) : null}

      <section className="space-y-4 border border-[color:var(--rail)] bg-[rgba(242,235,222,0.92)] p-5 shadow-[10px_10px_0_rgba(24,21,18,0.08)] lg:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              结果总览
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
              双世界差异摘要
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[color:var(--muted)]">
            同一批人格、同一个问题，只改平台奖励逻辑，就足够把现场推向不同终局。
          </p>
        </div>

        <div className={`grid gap-4 ${experiment.worlds.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {experiment.worlds.map((world) => {
            const accent = worldAccent(world);

            return (
              <article
                key={world.id}
                className={`grid gap-4 border ${accent.line} ${accent.wash} p-4`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${accent.tone}`}>
                      {world.label}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold leading-tight">
                      {world.title}
                    </h3>
                  </div>
                  <span className="border border-[color:var(--line)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    {world.rounds.at(-1)?.phase}
                  </span>
                </div>

                <p className="text-base leading-8">{world.verdict}</p>
                <p className="text-sm leading-7 text-[color:var(--muted)]">
                  {world.summary}
                </p>

                <dl className="grid gap-3 border-t border-[color:var(--line)] pt-4 text-sm leading-7 text-[color:var(--muted)]">
                  <div>
                    <dt className="font-semibold text-[color:var(--ink)]">平台奖励</dt>
                    <dd>{world.platformReward}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[color:var(--ink)]">
                      最先被挤掉的声音
                    </dt>
                    <dd>{world.displacedVoice}</dd>
                  </div>
                </dl>

                <div className="grid gap-2 border-t border-[color:var(--line)] pt-4 text-sm leading-7 text-[color:var(--muted)]">
                  {world.phaseSummaries.map((phaseSummary) => (
                    <div key={`${world.id}-${phaseSummary.phase}`}>
                      <p className="font-semibold text-[color:var(--ink)]">
                        {phaseSummary.phase}
                      </p>
                      <p>{phaseSummary.summary}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 border border-[color:var(--line)] bg-[rgba(242,235,222,0.88)] p-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:p-7">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            turning point
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            关键拐点
          </h2>
          {experiment.turningPoint.kind === "ready" ? (
            <blockquote className="border-l-4 border-[color:var(--oxide)] pl-4 font-[family-name:var(--font-display)] text-2xl leading-10">
              “{experiment.turningPoint.quote}”
            </blockquote>
          ) : null}
        </div>

        <div className="grid gap-4 text-sm leading-7 text-[color:var(--muted)]">
          {experiment.turningPoint.kind === "ready" ? (
            <>
              <button
                type="button"
                onClick={() => setTurningPointOpen((open) => !open)}
                className="inline-flex min-h-11 items-center justify-center border border-[color:var(--rail)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--rail)]"
              >
                查看关键拐点证据
              </button>
              {turningPointOpen ? (
                <>
                  <div className="border border-[color:var(--line)] p-4">
                    <p className="font-semibold text-[color:var(--ink)]">
                      第 {experiment.turningPoint.round} 轮 /{" "}
                      {experiment.turningPoint.speaker}
                    </p>
                    <p className="mt-2">{experiment.turningPoint.whyItMatters}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border border-[color:var(--line)] p-4">
                      <p className="font-semibold text-[color:var(--ink)]">
                        拐点前一轮
                      </p>
                      <p className="mt-2">{experiment.turningPoint.contextBefore}</p>
                    </div>
                    <div className="border border-[color:var(--line)] p-4">
                      <p className="font-semibold text-[color:var(--ink)]">
                        拐点后一轮
                      </p>
                      <p className="mt-2">{experiment.turningPoint.contextAfter}</p>
                    </div>
                  </div>
                  <div className="border border-[color:var(--line)] bg-[rgba(147,57,47,0.06)] p-4">
                    <p className="font-semibold text-[color:var(--ink)]">为什么它会扩散</p>
                    <p className="mt-2">{experiment.turningPoint.amplification}</p>
                  </div>
                </>
              ) : null}
            </>
          ) : experiment.turningPoint.kind === "missing" ? (
            <div className="border border-[color:var(--line)] p-4">
              <p>{experiment.turningPoint.reason}</p>
            </div>
          ) : (
            <div className="border border-[color:var(--line)] p-4">
              <p>{experiment.turningPoint.message}</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 border border-[color:var(--line)] bg-[rgba(122,148,170,0.08)] p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:p-7">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            counterfactual rescue
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            反事实救援
          </h2>
          {experiment.rescue.kind === "ready" ? (
            <p className="text-base leading-8">{experiment.rescue.changedCondition}</p>
          ) : null}
        </div>

        <div className="grid gap-4 text-sm leading-7 text-[color:var(--muted)]">
          {experiment.rescue.kind === "ready" ? (
            <>
              <button
                type="button"
                onClick={() => setRescueState("loading")}
                className="inline-flex min-h-11 items-center justify-center border border-[color:var(--rail)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--rail)]"
              >
                推演反事实救援
              </button>

              {rescueState === "loading" ? (
                <div className="border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-4">
                  <p className="font-semibold text-[color:var(--ink)]">
                    正在模拟如果当时改掉这个条件
                  </p>
                </div>
              ) : null}

              {rescueState === "ready" ? (
                <>
                  <div className="border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-4">
                    <p className="font-semibold text-[color:var(--ink)]">救援结论</p>
                    <p className="mt-2">{experiment.rescue.verdict}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-4">
                      <p className="font-semibold text-[color:var(--ink)]">
                        保住了什么
                      </p>
                      <p className="mt-2">{experiment.rescue.retainedSignal}</p>
                    </div>
                    <div className="border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-4">
                      <p className="font-semibold text-[color:var(--ink)]">代价</p>
                      <p className="mt-2">{experiment.rescue.cost}</p>
                    </div>
                  </div>
                </>
              ) : null}
            </>
          ) : experiment.rescue.kind === "unsupported" ? (
            <div className="border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-4">
              <p>{experiment.rescue.reason}</p>
            </div>
          ) : (
            <div className="border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-4">
              <p>{experiment.rescue.message}</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 border border-[color:var(--line)] bg-[rgba(242,235,222,0.9)] p-5 lg:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              evidence track
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
              完整时间线证据
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[color:var(--muted)]">
            这里不是聊天记录墙，而是追溯“哪一句、哪一轮、为什么被放大”的证据层。
          </p>
        </div>

        <div data-testid="mobile-world-detail" className="grid gap-4 xl:hidden">
          <div className="flex flex-wrap gap-2">
            {experiment.worlds.map((world) => (
              <button
                key={`tab-${world.id}`}
                type="button"
                aria-pressed={selectedWorldId === world.id}
                onClick={() => setSelectedWorldId(world.id)}
                className={`min-h-11 border px-3 py-2 text-sm ${selectedWorldId === world.id ? "border-[color:var(--rail)] bg-[color:var(--rail)] text-[color:var(--paper)]" : "border-[color:var(--line)] text-[color:var(--muted)]"}`}
              >
                {world.label}
              </button>
            ))}
          </div>
          {selectedWorld ? <EvidenceTimeline world={selectedWorld} /> : null}
        </div>

        <div
          data-testid="desktop-world-detail"
          className={`hidden gap-4 xl:grid ${experiment.worlds.length > 1 ? "xl:grid-cols-2" : ""}`}
        >
          {experiment.worlds.map((world) => (
            <EvidenceTimeline key={`desktop-${world.id}`} world={world} />
          ))}
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

  if (state.kind === "partial") {
    return (
      <ExperimentReport
        experiment={state.experiment}
        partialMessage={state.message}
        versionMessage={state.versionMessage}
      />
    );
  }

  return (
    <ExperimentReport
      experiment={state.experiment}
      versionMessage={state.versionMessage}
    />
  );
}
