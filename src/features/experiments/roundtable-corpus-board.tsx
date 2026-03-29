import { personaCatalog, platformActions } from "./experiment-engine";
import {
  listRoundtableCorpusExamples,
  listRoundtableCorpusPersonaOverviews,
  listRoundtableCorpusSources,
  roundtableCorpusSummary,
  type CorpusAction,
} from "./roundtable-corpus";

type RoundtableCorpusBoardProps = {
  featuredTopicId: string;
  selectedPersonaId: string;
  onSelectPersonaId: (personaId: string) => void;
};

const actionLabelMap: Record<CorpusAction, string> = {
  baseline: "正常讨论",
  "amplify-emotion": platformActions.find((action) => action.id === "amplify-emotion")?.label ?? "推高情绪",
  "amplify-conflict":
    platformActions.find((action) => action.id === "amplify-conflict")?.label ?? "放大对立",
  "reward-spectacle":
    platformActions.find((action) => action.id === "reward-spectacle")?.label ?? "奖励猎奇",
  "suppress-context":
    platformActions.find((action) => action.id === "suppress-context")?.label ?? "压低细节",
};

export function RoundtableCorpusBoard({
  featuredTopicId,
  selectedPersonaId,
  onSelectPersonaId,
}: RoundtableCorpusBoardProps) {
  const summary = roundtableCorpusSummary();
  const sources = listRoundtableCorpusSources();
  const personaOverviews = listRoundtableCorpusPersonaOverviews();
  const selectedPersona =
    personaCatalog.find((persona) => persona.id === selectedPersonaId) ?? personaCatalog[0];
  const selectedPersonaOverview =
    personaOverviews.find((overview) => overview.personaId === selectedPersona.id) ??
    personaOverviews[0];
  const examples = listRoundtableCorpusExamples({
    personaId: selectedPersona.id,
    featuredTopicId,
    limit: 4,
  });

  return (
    <section className="grid gap-4 border border-[color:var(--line)] bg-[rgba(242,235,222,0.88)] p-5">
      <div className="grid gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
          语料映射
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">语料映射看板</h2>
        <p className="text-sm leading-7 text-[color:var(--muted)]">
          首页先告诉你这张桌背后有哪些数据库能用、哪些角色会优先命中哪些话术。实验运行时会先匹配当前样本问题，再回退到通用语料。
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="border border-[color:var(--line)] px-3 py-2">
          {summary.sourceCount} 个来源
        </span>
        <span className="border border-[color:var(--line)] px-3 py-2">
          {summary.exampleCount} 条样本
        </span>
        <span className="border border-[color:var(--line)] px-3 py-2">
          {personaCatalog.length} 种角色
        </span>
      </div>

      <div className="grid gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
          可用数据库
        </p>
        <div className="grid gap-3">
          {sources.map((source) => (
            <article
              key={source.id}
              className="grid gap-2 border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{source.platform}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {source.title}
                  </p>
                </div>
                <span className="text-sm text-[color:var(--muted)]">{source.exampleCount} 条</span>
              </div>
              <p className="text-sm leading-7 text-[color:var(--muted)]">{source.notes}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-t border-[color:var(--line)] pt-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
          角色映射
        </p>
        <div className="flex flex-wrap gap-2">
          {personaCatalog.map((persona) => {
            const overview =
              personaOverviews.find((item) => item.personaId === persona.id) ??
              selectedPersonaOverview;
            const active = persona.id === selectedPersona.id;

            return (
              <button
                key={persona.id}
                type="button"
                aria-label={persona.name}
                onClick={() => onSelectPersonaId(persona.id)}
                className={`grid min-w-[136px] gap-1 border px-3 py-3 text-left transition ${
                  active
                    ? "border-[color:var(--rail)] bg-[color:var(--rail)] text-[color:var(--paper)]"
                    : "border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] text-[color:var(--ink)]"
                }`}
              >
                <span className="text-sm font-semibold">{persona.name}</span>
                <span
                  className={`text-xs uppercase tracking-[0.16em] ${
                    active ? "text-[rgba(242,235,222,0.72)]" : "text-[color:var(--muted)]"
                  }`}
                >
                  {overview?.exampleCount ?? 0} 条语料
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 border border-dashed border-[color:var(--line)] p-4">
        <div className="grid gap-1">
          <p className="text-sm font-semibold">{selectedPersona.name}</p>
          <p className="text-sm leading-7 text-[color:var(--muted)]">{selectedPersona.role}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
          {(selectedPersonaOverview?.sourceIds ?? []).map((sourceId) => {
            const source = sources.find((item) => item.id === sourceId);
            return (
              <span key={sourceId} className="border border-[color:var(--line)] px-2 py-1">
                {source?.platform ?? sourceId}
              </span>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {(selectedPersonaOverview?.dominantActions ?? []).slice(0, 3).map((entry) => (
            <span
              key={`${selectedPersona.id}-${entry.action}`}
              className="border border-[color:var(--line)] px-2 py-1 text-xs text-[color:var(--muted)]"
            >
              {actionLabelMap[entry.action]} × {entry.count}
            </span>
          ))}
        </div>

        <div className="grid gap-3">
          {examples.map((example) => (
            <article
              key={example.id}
              className="grid gap-2 border border-[color:var(--line)] bg-[rgba(242,235,222,0.72)] p-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
                <span>{example.source?.platform ?? example.sourceId}</span>
                <span>{actionLabelMap[example.dominantAction]}</span>
                <span>{example.topicMatched ? "命中当前样本" : "通用回退"}</span>
              </div>
              <p className="text-sm leading-7">{example.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
