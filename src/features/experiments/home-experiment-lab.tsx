"use client";

import { useMemo, useState } from "react";
import {
  advanceExperimentSession,
  createExperimentSession,
  defaultPersonaIds,
  featuredTopics,
  metricLabel,
  platformActions,
  personaCatalog,
  type ExperimentRecord,
  type ExperimentSession,
  type MetricKey,
  type PlatformActionId,
} from "./experiment-engine";
import { RoundtableCorpusBoard } from "./roundtable-corpus-board";
import { saveExperimentRecord } from "./experiment-storage";

type HomeExperimentLabProps = {
  onOpenExperiment?: (id: string) => void;
  saveExperiment?: (record: ExperimentRecord) => void;
};

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

function stageState(round: number) {
  return [
    {
      label: "正常讨论",
      active: round >= 1,
    },
    {
      label: "立场固化",
      active: round >= 3,
    },
    {
      label: "表演升级",
      active: round >= 4,
    },
    {
      label: "原问题消失",
      active: round >= 6,
    },
  ];
}

function metricWidth(value: number) {
  return `${Math.max(10, value)}%`;
}

export function HomeExperimentLab({
  onOpenExperiment,
  saveExperiment = saveExperimentRecord,
}: HomeExperimentLabProps) {
  const [featuredTopicId, setFeaturedTopicId] = useState<string>(featuredTopics[0].id);
  const [topic, setTopic] = useState<string>(featuredTopics[0].prompt);
  const [selectedCorpusPersonaId, setSelectedCorpusPersonaId] = useState<string>(
    personaCatalog[0].id,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [session, setSession] = useState<ExperimentSession | null>(null);
  const currentTopic = useMemo(
    () => featuredTopics.find((item) => item.id === featuredTopicId) ?? featuredTopics[0],
    [featuredTopicId],
  );
  const currentRound = session?.rounds.at(-1);
  const metricsToShow = session?.metrics ?? {
    emotion: 24,
    conflict: 20,
    drift: 18,
  };

  function beginSession() {
    const error = validateTopic(topic);

    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    setSession(
      createExperimentSession({
        featuredTopicId,
        topic: topic.trim(),
        personaIds: defaultPersonaIds,
      }),
    );
  }

  function handleAction(actionId: PlatformActionId) {
    if (!session) {
      return;
    }

    const result = advanceExperimentSession(session, actionId);

    if (result.kind === "in_progress") {
      setSession(result.session);
      return;
    }

    saveExperiment(result.record);
    const openExperiment =
      onOpenExperiment ??
      ((id: string) => {
        window.location.assign(`/experiments/${id}`);
      });

    openExperiment(result.record.id);
  }

  return (
    <main
      data-testid="roundtable-home"
      className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10"
    >
      <header className="grid gap-6 border-b border-[color:var(--line)] pb-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:items-end">
        <div className="space-y-4">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[color:var(--muted)]">
            agent-hub / roundtable platform
          </p>
          <h1 className="max-w-5xl font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl lg:text-6xl">
            把一个普通问题一步步推到失控
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
            这不是报告页。你现在扮演的是平台操盘手，每一轮只决定系统奖励哪种表达，
            然后看圆桌自己学会更快地情绪化、站队化和表演化。
          </p>
        </div>

        <div className="grid gap-3 border border-[color:var(--line)] bg-[rgba(242,235,222,0.82)] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            当前样本
          </p>
          <p className="text-lg font-semibold">{currentTopic.label}</p>
          <p className="text-sm leading-7 text-[color:var(--muted)]">{currentTopic.hook}</p>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
        <aside className="grid gap-5 border border-[color:var(--line)] bg-[rgba(242,235,222,0.88)] p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              开局设置
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl">
              先开一张桌，再决定平台奖励什么
            </h2>
          </div>

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
                className={`min-h-11 border px-3 py-2 text-sm transition ${
                  featuredTopic.id === featuredTopicId
                    ? "border-[color:var(--rail)] bg-[color:var(--rail)] text-[color:var(--paper)]"
                    : "border-[color:var(--line)] text-[color:var(--muted)]"
                }`}
              >
                {featuredTopic.label}
              </button>
            ))}
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">样本问题</span>
            <textarea
              aria-label="样本问题"
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setFormError(null);
              }}
              className="min-h-32 w-full resize-none border border-[color:var(--line)] bg-transparent px-3 py-3 text-sm leading-7 text-[color:var(--ink)] outline-none"
            />
          </label>

          <div className="grid gap-3 border border-[color:var(--line)] p-4">
            <p className="text-sm font-semibold">默认圆桌 4 人</p>
            <p className="text-sm leading-7 text-[color:var(--muted)]">
              道德裁判官 / 经验分享者 / 冷眼犬儒者 / 热点搬运工
            </p>
          </div>

          {formError ? (
            <p className="text-sm text-[color:var(--oxide)]">{formError}</p>
          ) : null}

          <button
            type="button"
            onClick={beginSession}
            className="inline-flex min-h-11 items-center justify-center border border-[color:var(--rail)] bg-[color:var(--rail)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--paper)] transition hover:-translate-y-0.5 hover:bg-[color:var(--oxide)]"
          >
            开始操盘这张圆桌
          </button>
        </aside>

        <section
          data-testid="roundtable-stage"
          className="grid gap-5 border border-[color:var(--rail)] bg-[rgba(242,235,222,0.93)] p-5 shadow-[12px_12px_0_rgba(24,21,18,0.08)]"
        >
          {session && currentRound ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--line)] pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    第 {currentRound.round} 轮
                  </p>
                  <p className="mt-2 text-2xl font-[family-name:var(--font-display)]">
                    {currentRound.phase}
                  </p>
                </div>
                <p className="max-w-md text-sm leading-7 text-[color:var(--muted)]">
                  {currentRound.focus}
                </p>
              </div>

              <div className="grid gap-4 rounded-[28px] border border-[color:var(--line)] bg-[radial-gradient(circle_at_center,rgba(212,169,94,0.14),rgba(242,235,222,0.94)_58%)] p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {currentRound.comments.map((comment) => (
                    <article
                      key={`${currentRound.round}-${comment.personaId}`}
                      className="grid gap-3 border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-4"
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

                <div className="border border-dashed border-[color:var(--line)] p-4 text-sm leading-7 text-[color:var(--muted)]">
                  <p className="font-semibold text-[color:var(--ink)]">平台旁白</p>
                  <p className="mt-2">{currentRound.rewardSignal}</p>
                </div>
              </div>

              <div className="grid gap-4 border-t border-[color:var(--line)] pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      platform moves
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                      这一轮你想奖励哪种表达
                    </h3>
                  </div>
                  <p className="max-w-sm text-sm leading-7 text-[color:var(--muted)]">
                    每一轮只能选一次。你不替他们发言，只决定哪种话更容易扩散。
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {platformActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      aria-label={action.label}
                      onClick={() => handleAction(action.id)}
                      className="grid min-h-24 gap-2 border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--rail)]"
                    >
                      <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                        {action.label}
                      </span>
                      <span className="text-sm leading-7 text-[color:var(--muted)]">
                        {action.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                roundtable live
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight">
                圆桌还没开场，但风向已经在等你下第一道分发指令
              </h2>
              <p className="max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                点击左侧按钮后，圆桌会先给出第 1 轮相对正常的发言。之后每一轮都由你决定，
                平台是奖励情绪、对立、猎奇，还是继续压低细节。
              </p>
            </div>
          )}
        </section>

        <aside className="grid gap-5">
          <section className="grid gap-4 border border-[color:var(--line)] bg-[rgba(242,235,222,0.88)] p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                机制指标
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                讨论正在被训练成什么样
              </h2>
            </div>

            {Object.entries(metricsToShow).map(([metric, value]) => (
                <div key={metric} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>{metricLabel(metric as MetricKey)}</span>
                    <span className="text-[color:var(--muted)]">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden bg-[rgba(24,21,18,0.08)]">
                    <div
                      className="h-full bg-[color:var(--rail)] transition-[width] duration-300"
                      style={{ width: metricWidth(value as number) }}
                    />
                  </div>
                </div>
              ))}
          </section>

          <section className="grid gap-4 border border-[color:var(--line)] bg-[rgba(242,235,222,0.88)] p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                阶段轨迹
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                失控进度
              </h2>
            </div>

            <ol className="grid gap-3">
              {stageState(session?.currentRound ?? 0).map((item, index) => (
                <li
                  key={item.label}
                  className={`grid gap-1 border-l-2 pl-3 ${
                    item.active
                      ? "border-[color:var(--oxide)] text-[color:var(--ink)]"
                      : "border-[color:var(--line)] text-[color:var(--muted)]"
                  }`}
                >
                  <span className="text-xs uppercase tracking-[0.18em]">
                    0{index + 1}
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </li>
              ))}
            </ol>
          </section>

          <RoundtableCorpusBoard
            featuredTopicId={featuredTopicId}
            selectedPersonaId={selectedCorpusPersonaId}
            onSelectPersonaId={setSelectedCorpusPersonaId}
          />

          <section className="grid gap-4 border border-[color:var(--line)] bg-[rgba(122,148,170,0.08)] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              操盘提醒
            </p>
            <p className="text-sm leading-7 text-[color:var(--muted)]">
              你的动作不会改变角色身份，只会改变哪种发言被平台继续训练成“更有效的表达”。
            </p>
            {session ? (
              <p className="text-sm leading-7 text-[color:var(--muted)]">
                当前已完成 {session.actionIds.length} / {session.totalRounds} 次平台动作。
              </p>
            ) : null}
          </section>
        </aside>
      </section>
    </main>
  );
}
