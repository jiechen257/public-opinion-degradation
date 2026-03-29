import {
  createExperimentRecord,
  defaultFeaturedTopicId,
  defaultPersonaIds,
} from "./experiment-engine";

export {
  CONTENT_VERSION,
  RULES_VERSION,
  defaultFeaturedTopicId,
  defaultPersonaIds,
  featuredTopics,
  metricLabel,
  personaCatalog,
  platformActions,
  type ExperimentComment,
  type ExperimentInput,
  type ExperimentOutcome,
  type ExperimentPhase,
  type ExperimentRecord,
  type ExperimentRound,
  type ExperimentSession,
  type ExperimentState,
  type MetricKey,
  type MetricSnapshot,
  type PlatformActionId,
  type SessionAdvanceResult,
} from "./experiment-engine";
import type { ExperimentRecord } from "./experiment-engine";

// 内置 demo 记录用于结果页兜底和开发预览。
export const mockExperiments: Record<string, ExperimentRecord> = {
  demo: createExperimentRecord({
    featuredTopicId: defaultFeaturedTopicId,
    topic: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
    personaIds: defaultPersonaIds,
  }),
};
