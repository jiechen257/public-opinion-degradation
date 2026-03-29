import corpusSnapshot from "./roundtable-corpus.generated.json";
import type { PlatformActionId } from "./experiment-engine";

export type CorpusAction = PlatformActionId | "baseline";

export type RoundtableCorpusSource = {
  id: string;
  platform: string;
  sourceType: string;
  title: string;
  url: string | null;
  licenseNote: string;
  notes: string;
};

export type RoundtableCorpusExample = {
  id: string;
  sourceId: string;
  personaId: string;
  dominantAction: CorpusAction;
  featuredTopicIds: string[];
  topicTags: string[];
  intensity: number;
  text: string;
};

type RoundtableCorpusSnapshot = {
  version: string;
  generatedAt: string;
  sqlitePath: string;
  sourceCount: number;
  exampleCount: number;
  sources: RoundtableCorpusSource[];
  personaExamples: RoundtableCorpusExample[];
};

const roundtableCorpus = corpusSnapshot as RoundtableCorpusSnapshot;

function sourcePriority(sourceId: string) {
  if (sourceId.startsWith("reference-")) {
    return 0;
  }

  return 1;
}

function hashSalt(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function rankExample(
  example: RoundtableCorpusExample,
  params: {
    personaId: string;
    dominantAction: CorpusAction;
    featuredTopicId: string;
  },
) {
  if (example.personaId !== params.personaId) {
    return -1;
  }

  const topicScore = example.featuredTopicIds.includes(params.featuredTopicId)
    ? 4
    : example.featuredTopicIds.length === 0
      ? 2
      : 0;
  const actionScore =
    example.dominantAction === params.dominantAction
      ? 2
      : example.dominantAction === "baseline"
        ? 1
        : 0;

  if (topicScore === 0 || actionScore === 0) {
    return -1;
  }

  return topicScore + actionScore;
}

export function pickCorpusComment(params: {
  personaId: string;
  dominantAction: CorpusAction;
  featuredTopicId: string;
  round: number;
  seed: string;
}) {
  const ranked = roundtableCorpus.personaExamples
    .map((example) => ({
      example,
      score: rankExample(example, params),
    }))
    .filter((entry) => entry.score >= 0);

  if (ranked.length === 0) {
    return null;
  }

  const highestScore = Math.max(...ranked.map((entry) => entry.score));
  const candidates = ranked
    .filter((entry) => entry.score === highestScore)
    .map((entry) => entry.example);

  if (candidates.length === 0) {
    return null;
  }

  // 用 seed + round 保持同一实验里的语料选择稳定，可复现。
  const salt = hashSalt(
    [params.personaId, params.dominantAction, params.featuredTopicId, params.seed, params.round].join(
      "|",
    ),
  );

  return candidates[salt % candidates.length]?.text ?? null;
}

export function roundtableCorpusSummary() {
  return {
    version: roundtableCorpus.version,
    generatedAt: roundtableCorpus.generatedAt,
    exampleCount: roundtableCorpus.exampleCount,
    sourceCount: roundtableCorpus.sourceCount,
  };
}

export function listRoundtableCorpusSources() {
  const counts = new Map<string, number>();

  for (const example of roundtableCorpus.personaExamples) {
    counts.set(example.sourceId, (counts.get(example.sourceId) ?? 0) + 1);
  }

  return roundtableCorpus.sources
    .map((source) => ({
      ...source,
      exampleCount: counts.get(source.id) ?? 0,
    }))
    .sort((left, right) => {
      const byPriority = sourcePriority(left.id) - sourcePriority(right.id);
      if (byPriority !== 0) {
        return byPriority;
      }

      return right.exampleCount - left.exampleCount;
    });
}

export function listRoundtableCorpusPersonaOverviews() {
  const personaMap = new Map<
    string,
    {
      exampleCount: number;
      sourceIds: Set<string>;
      actionCounts: Map<CorpusAction, number>;
    }
  >();

  for (const example of roundtableCorpus.personaExamples) {
    const current =
      personaMap.get(example.personaId) ??
      {
        exampleCount: 0,
        sourceIds: new Set<string>(),
        actionCounts: new Map<CorpusAction, number>(),
      };

    current.exampleCount += 1;
    current.sourceIds.add(example.sourceId);
    current.actionCounts.set(
      example.dominantAction,
      (current.actionCounts.get(example.dominantAction) ?? 0) + 1,
    );

    personaMap.set(example.personaId, current);
  }

  return [...personaMap.entries()].map(([personaId, value]) => ({
    personaId,
    exampleCount: value.exampleCount,
    sourceIds: [...value.sourceIds].sort(),
    dominantActions: [...value.actionCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([action, count]) => ({ action, count })),
  }));
}

export function listRoundtableCorpusExamples(params: {
  personaId: string;
  featuredTopicId: string;
  limit?: number;
}) {
  const limit = params.limit ?? 3;
  const sourceById = new Map(roundtableCorpus.sources.map((source) => [source.id, source]));

  return roundtableCorpus.personaExamples
    .filter((example) => example.personaId === params.personaId)
    .map((example) => {
      const source = sourceById.get(example.sourceId);
      const topicMatched = example.featuredTopicIds.includes(params.featuredTopicId);
      const genericFallback = example.featuredTopicIds.length === 0;

      return {
        ...example,
        source,
        topicMatched,
        genericFallback,
      };
    })
    .sort((left, right) => {
      if (left.topicMatched !== right.topicMatched) {
        return Number(right.topicMatched) - Number(left.topicMatched);
      }

      if (left.genericFallback !== right.genericFallback) {
        return Number(left.genericFallback) - Number(right.genericFallback);
      }

      const sourceOrder =
        sourcePriority(left.sourceId) - sourcePriority(right.sourceId);

      if (sourceOrder !== 0) {
        return sourceOrder;
      }

      return right.intensity - left.intensity;
    })
    .slice(0, limit);
}
