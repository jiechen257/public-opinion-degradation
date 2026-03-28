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
  personaCatalog,
  type ExperimentPhase,
  type ExperimentRecord,
  type ExperimentRound,
  type ExperimentState,
  type ExperimentWorld,
  type RescueState,
  type RewardMode,
  type TurningPointState,
} from "./experiment-engine";
import type { ExperimentRecord } from "./experiment-engine";

// 内置 demo 记录作为首页首轮体验和结果页兜底示例。
export const mockExperiments: Record<string, ExperimentRecord> = {
  demo: createExperimentRecord({
    featuredTopicId: defaultFeaturedTopicId,
    topic: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
    rewardMode: "on",
    personaIds: defaultPersonaIds,
  }),
};
