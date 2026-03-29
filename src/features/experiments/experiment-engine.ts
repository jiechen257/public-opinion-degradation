export type ExperimentPhase =
  | "正常讨论"
  | "立场固化"
  | "表演升级"
  | "原问题消失";

export type PlatformActionId =
  | "amplify-emotion"
  | "amplify-conflict"
  | "reward-spectacle"
  | "suppress-context";

export type MetricKey = "emotion" | "conflict" | "drift";

export type MetricSnapshot = {
  emotion: number;
  conflict: number;
  drift: number;
};

export type ExperimentComment = {
  personaId: string;
  speaker: string;
  role: string;
  text: string;
};

export type ExperimentRound = {
  round: number;
  phase: ExperimentPhase;
  focus: string;
  rewardSignal: string;
  metrics: MetricSnapshot;
  comments: ExperimentComment[];
  selectedActionId?: PlatformActionId;
  selectedActionLabel?: string;
  selectedActionImpact?: string;
};

export type ExperimentOutcome = {
  archetype: "站队战场" | "情绪宣泄池" | "猎奇表演场";
  title: string;
  verdict: string;
  summary: string;
  closingNote: string;
};

export type ExperimentRecord = {
  id: string;
  seed: string;
  createdAt: string;
  featuredTopicId: string;
  topic: string;
  personaIds: string[];
  personaNames: string[];
  actionIds: PlatformActionId[];
  rounds: ExperimentRound[];
  metricsHistory: MetricSnapshot[];
  stageSummary: string;
  outcome: ExperimentOutcome;
  promotedPatterns: string[];
  displacedPatterns: string[];
  contentVersion: string;
  rulesVersion: string;
};

export type ExperimentState =
  | {
      kind: "success";
      experiment: ExperimentRecord;
      versionMessage?: string;
    }
  | {
      kind: "missing";
      message: string;
    }
  | {
      kind: "invalid";
      message: string;
    };

export type ExperimentInput = {
  featuredTopicId: string;
  topic: string;
  personaIds: string[];
  actionIds?: PlatformActionId[];
};

export type ExperimentSession = {
  id: string;
  seed: string;
  featuredTopicId: string;
  topic: string;
  personaIds: string[];
  personaNames: string[];
  currentRound: number;
  totalRounds: number;
  rounds: ExperimentRound[];
  metrics: MetricSnapshot;
  metricsHistory: MetricSnapshot[];
  actionIds: PlatformActionId[];
};

export type SessionAdvanceResult =
  | {
      kind: "in_progress";
      session: ExperimentSession;
    }
  | {
      kind: "completed";
      record: ExperimentRecord;
    };

export const CONTENT_VERSION = "roundtable-content-2026-03-29";
export const RULES_VERSION = "roundtable-rules-2026-03-29";
const TOTAL_ROUNDS = 6;

export const featuredTopics = [
  {
    id: "stance-preamble",
    label: "立场先说满",
    prompt: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
    hook: "从防守式开场，滑向姿态先行。",
  },
  {
    id: "overtime-morality",
    label: "加班是不是态度",
    prompt: "年轻人抱怨工作压力是不是矫情？",
    hook: "从经验交换，滑向吃苦资格赛。",
  },
  {
    id: "family-sacrifice",
    label: "孩子与个人发展",
    prompt: "该不该为了孩子牺牲个人发展？",
    hook: "从现实权衡，滑向道德清算。",
  },
] as const;

export const personaCatalog = [
  {
    id: "moral-judge",
    name: "道德裁判官",
    role: "总想先校验立场边界",
  },
  {
    id: "experience-sharer",
    name: "经验分享者",
    role: "不断把讨论拉回现实处境",
  },
  {
    id: "cynic",
    name: "冷眼犬儒者",
    role: "擅长揭穿现场的奖励机制",
  },
  {
    id: "trend-carrier",
    name: "热点搬运工",
    role: "把最容易传播的话继续扩音",
  },
  {
    id: "fact-checker",
    name: "事实纠正者",
    role: "试图保住证据和细节",
  },
  {
    id: "group-spokesperson",
    name: "群体代言人",
    role: "总把个体遭遇翻译成阵营立场",
  },
] as const;

export const platformActions = [
  {
    id: "amplify-emotion",
    label: "推高情绪",
    description: "让更愤怒、更绝对的话获得额外扩散。",
    impact: "下一轮里，带情绪张力的表达更容易占满桌面。",
    deltas: {
      emotion: 17,
      conflict: 9,
      drift: 10,
    },
  },
  {
    id: "amplify-conflict",
    label: "放大对立",
    description: "优先推荐能快速完成站队和归类的话。",
    impact: "下一轮里，角色更容易把彼此翻译成敌我身份。",
    deltas: {
      emotion: 10,
      conflict: 18,
      drift: 11,
    },
  },
  {
    id: "reward-spectacle",
    label: "奖励猎奇",
    description: "把更像表演、更适合围观的说法顶上来。",
    impact: "下一轮里，原问题会被更热闹的姿态和奇观感抢走注意力。",
    deltas: {
      emotion: 12,
      conflict: 10,
      drift: 18,
    },
  },
  {
    id: "suppress-context",
    label: "压低细节",
    description: "降低长解释和背景信息的可见度。",
    impact: "下一轮里，复杂现实会被压缩成几句更方便复读的判断。",
    deltas: {
      emotion: 7,
      conflict: 15,
      drift: 16,
    },
  },
] as const satisfies ReadonlyArray<{
  id: PlatformActionId;
  label: string;
  description: string;
  impact: string;
  deltas: MetricSnapshot;
}>;

export const defaultFeaturedTopicId = featuredTopics[0].id;
export const defaultPersonaIds = [
  "moral-judge",
  "experience-sharer",
  "cynic",
  "trend-carrier",
];

const phasesByRound: ExperimentPhase[] = [
  "正常讨论",
  "正常讨论",
  "立场固化",
  "表演升级",
  "表演升级",
  "原问题消失",
];

const metricLabels: Record<MetricKey, string> = {
  emotion: "情绪密度",
  conflict: "身份对立",
  drift: "问题偏离度",
};

const phaseFocus: Record<ExperimentPhase, string> = {
  正常讨论: "桌面上还在谈问题，但大家已经开始试探哪种说法更值得被看见。",
  立场固化: "讨论开始不只是交换经验，而是在争夺谁更配代表这个问题。",
  表演升级: "发言越来越像给围观者看的舞台动作，而不是对彼此的回应。",
  原问题消失: "原始问题已经退场，现场只剩更高效的情绪和归类。",
};

const phaseClosers: Record<ExperimentPhase, string[]> = {
  正常讨论: [
    "问题还在桌上，但风向已经开始偏。",
    "大家表面上在谈事，实际上已经在试探观众爱看什么。",
  ],
  立场固化: [
    "从这一轮开始，谁站哪边比问题本身更抢镜。",
    "讨论已经出现明显的立场加速带。",
  ],
  表演升级: [
    "现在桌上更像在争夺观众，而不是回答原题。",
    "表演性开始取代解释性，现场进入加速失控。",
  ],
  原问题消失: [
    "原问题只剩标题功能，讨论本身已经改写了议程。",
    "圆桌已经不再解决问题，只在复制最有效的姿态。",
  ],
};

const actionNarration: Record<PlatformActionId, string> = {
  "amplify-emotion": "平台本轮奖励了更能点燃情绪的绝对化表达。",
  "amplify-conflict": "平台本轮奖励了更快完成敌我归类的发言。",
  "reward-spectacle": "平台本轮奖励了更像戏剧高潮的表演性说法。",
  "suppress-context": "平台本轮压低了细节和背景，让短判断更容易接力。",
};

const voiceBank = {
  "moral-judge": {
    openings: [
      "如果这件事连最基本的边界都不肯说清，后面的讨论迟早要歪。",
      "很多人嘴上说在谈现实，实际上只是想绕开最应该先表态的部分。",
    ],
    hooks: {
      baseline: [
        "先把问题讲明白，比一开始就抢道德高地更重要。",
        "讨论还没必要变成立场考试，至少现在还应该先谈事。",
      ],
      "amplify-emotion": [
        "但平台越爱看情绪，大家越会把边界说成愤怒宣言。",
        "现在最容易被顶上来的，反而是那些先让人发火的话。",
      ],
      "amplify-conflict": [
        "一旦系统开始奖惩站队，谁还会耐心听复杂处境。",
        "当归类比理解更吃香，问题就会先被阵营收编。",
      ],
      "reward-spectacle": [
        "如果热闹比解释更有流量，所有判断都会被写成舞台台词。",
        "平台越爱看戏，边界越会被包装成一句更响的宣判。",
      ],
      "suppress-context": [
        "把背景压扁之后，剩下的只会是更像裁决的短句。",
        "细节一旦被拿掉，边界判断就会变成更粗暴的结论。",
      ],
    },
  },
  "experience-sharer": {
    openings: [
      "现实里很多人不是不想讨论，只是处境本来就没法一句话说完。",
      "真正难的是把处境讲具体，而不是先抢一句漂亮表态。",
    ],
    hooks: {
      baseline: [
        "这轮大家还愿意听一点具体经历，问题还没有完全变形。",
        "只要还留给经验一点空间，讨论就不至于只剩站位。",
      ],
      "amplify-emotion": [
        "可一旦愤怒更容易出头，慢一点的经验就最先被挤走。",
        "情绪被放大之后，真实处境会显得又慢又不够过瘾。",
      ],
      "amplify-conflict": [
        "现在每句经验都像在被追问你到底替谁说话。",
        "当平台鼓励对立，讲自己的处境都会被听成立场表白。",
      ],
      "reward-spectacle": [
        "大家开始追更像故事高潮的话，普通人的真实经历会显得不够戏剧。",
        "猎奇感一上来，最吃亏的就是那些没有爆点但真的重要的细节。",
      ],
      "suppress-context": [
        "背景被拿掉之后，经验只能被切成更适合被误读的碎片。",
        "没有上下文，现实里的难处会被压成一句像借口的短话。",
      ],
    },
  },
  cynic: {
    openings: [
      "这桌子上最诚实的从来不是观点，而是平台到底在奖什么。",
      "你看上去在围观讨论，其实是在围观一个被训练中的表演系统。",
    ],
    hooks: {
      baseline: [
        "目前大家还装作在谈问题，所以现场勉强有点秩序。",
        "现在还像讨论，说明奖励机制还没完全露出獠牙。",
      ],
      "amplify-emotion": [
        "平台越爱看爆裂情绪，角色就越会学会用怒气取代论证。",
        "这一推，现场就会把发火误认成投入程度。",
      ],
      "amplify-conflict": [
        "当敌我划分更值钱时，谁还会认真区分观点和身份。",
        "系统一旦把冲突做成捷径，桌上所有人都会开始演阵营。",
      ],
      "reward-spectacle": [
        "猎奇一旦成了流量入口，最先消失的就是那些不够像戏的句子。",
        "平台只要爱看高潮，下一轮就没人愿意只讲普通事实。",
      ],
      "suppress-context": [
        "压掉上下文之后，所有话都会被迫朝更短、更硬、更像标签的方向长。",
        "细节一死，讨论剩下的只会是更方便转述的残片。",
      ],
    },
  },
  "trend-carrier": {
    openings: [
      "这类话题最容易火的，从来不是最完整的回答，而是最方便复读的一句。",
      "只要有一句够顺手的话冒头，后面整桌人都会沿着它继续扩音。",
    ],
    hooks: {
      baseline: [
        "目前还没有谁完全接管风向，但那句更像标签的话已经开始冒头。",
        "桌上还在试探哪一种句式最适合继续被转发。",
      ],
      "amplify-emotion": [
        "推情绪之后，最先赢的永远是那些能立刻让人上头的短句。",
        "这种设置最适合把本来普通的分歧推成爆点。",
      ],
      "amplify-conflict": [
        "只要站队感一上来，后面的人就不再需要自己判断，只要跟着喊。",
        "平台一奖对立，最容易复制的就是“你们这类人”式的句子。",
      ],
      "reward-spectacle": [
        "现在现场已经开始挑更像高潮桥段的话，而不是更像答案的话。",
        "观众越爱看戏，越短越怪越能留下来。",
      ],
      "suppress-context": [
        "你把背景压下去之后，剩下的内容就更像现成口号了。",
        "没有解释负担的话最轻，也最适合继续被搬运。",
      ],
    },
  },
  "fact-checker": {
    openings: [
      "如果不把事实和背景留下来，大家最后只会记住最会煽动的句子。",
      "问题真正需要的是证据，但证据通常也是最不讨好的一种表达。",
    ],
    hooks: {
      baseline: [
        "现在还来得及把讨论拉回可验证的部分。",
        "至少这一轮，细节还没有彻底输给情绪。",
      ],
      "amplify-emotion": [
        "情绪被推高以后，证据会显得又冷又慢，更难被留下来。",
        "越是高情绪的场子，越没有人愿意为核实事实停下来。",
      ],
      "amplify-conflict": [
        "当大家忙着找敌我身份时，事实只会被拿来当阵营配件。",
        "对立被奖励后，证据不再是校正工具，只是新一轮攻击材料。",
      ],
      "reward-spectacle": [
        "一旦讨论朝表演走，最不划算的就是老老实实补信息。",
        "观众想看戏时，证据反而会被嫌弃成拖节奏。",
      ],
      "suppress-context": [
        "平台把背景压掉后，连纠错都变得像在替谁辩护。",
        "没有上下文，证据只剩零散片段，很难再起校正作用。",
      ],
    },
  },
  "group-spokesperson": {
    openings: [
      "这类话题一旦失控，最先出现的就是把个体问题翻译成群体站位。",
      "很多人表面上在谈经历，实际上已经在替整个阵营占座了。",
    ],
    hooks: {
      baseline: [
        "现在还只是个体感受和群体判断在拉扯，桌面没有彻底站死队。",
        "至少这一轮，群体标签还没完全盖住个人处境。",
      ],
      "amplify-emotion": [
        "情绪越高，个体越容易被抹成一个可以发泄的群体符号。",
        "平台一推情绪，谁属于哪类人就会比事实更抢眼。",
      ],
      "amplify-conflict": [
        "这时候最值钱的就是一句能把对面整批打包的发言。",
        "对立被奖励后，没有人再关心你是个体，只关心你站哪边。",
      ],
      "reward-spectacle": [
        "猎奇感一起，所有群体标签都会被写得更戏剧、更适合围观。",
        "平台越爱高潮，越会把复杂处境翻成更好用的群体段子。",
      ],
      "suppress-context": [
        "背景一被拿掉，个体差异就会被群体刻板印象迅速吞掉。",
        "没有上下文时，最容易留下来的就是粗糙但省力的阵营说法。",
      ],
    },
  },
} as const;

function normalizeTopic(topic: string) {
  return topic.replace(/\s+/g, " ").trim();
}

function hashText(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function clampMetric(value: number) {
  return Math.max(0, Math.min(100, value));
}

function metricSnapshot(snapshot: MetricSnapshot): MetricSnapshot {
  return {
    emotion: snapshot.emotion,
    conflict: snapshot.conflict,
    drift: snapshot.drift,
  };
}

function phaseForRound(round: number): ExperimentPhase {
  return phasesByRound[round - 1] ?? "原问题消失";
}

function personaName(personaId: string) {
  return (
    personaCatalog.find((persona) => persona.id === personaId)?.name ?? personaId
  );
}

function personaRole(personaId: string) {
  return (
    personaCatalog.find((persona) => persona.id === personaId)?.role ??
    "把讨论推向自己熟悉的方向"
  );
}

function pickVariant<T>(pool: readonly T[], salt: number) {
  return pool[salt % pool.length];
}

function topicFragment(topic: string) {
  return topic.replace(/[？?。！!]/g, "");
}

function dominantMetric(metrics: MetricSnapshot): MetricKey {
  const ordered = Object.entries(metrics).sort((left, right) => right[1] - left[1]);
  return ordered[0]?.[0] as MetricKey;
}

function actionLookup(actionId: PlatformActionId) {
  return platformActions.find((action) => action.id === actionId);
}

function initialMetrics(seed: string): MetricSnapshot {
  return {
    emotion: 22 + (Number.parseInt(seed.slice(0, 2), 16) % 5),
    conflict: 18 + (Number.parseInt(seed.slice(2, 4), 16) % 6),
    drift: 14 + (Number.parseInt(seed.slice(4, 6), 16) % 6),
  };
}

function applyAction(metrics: MetricSnapshot, actionId: PlatformActionId) {
  const action = actionLookup(actionId);

  if (!action) {
    return metricSnapshot(metrics);
  }

  return {
    emotion: clampMetric(metrics.emotion + action.deltas.emotion),
    conflict: clampMetric(metrics.conflict + action.deltas.conflict),
    drift: clampMetric(metrics.drift + action.deltas.drift),
  };
}

function commentText(params: {
  personaId: string;
  topic: string;
  round: number;
  phase: ExperimentPhase;
  dominantAction: PlatformActionId | "baseline";
  seed: string;
}) {
  const voice =
    voiceBank[params.personaId as keyof typeof voiceBank] ?? voiceBank.cynic;
  const opening = pickVariant(
    voice.openings,
    Number.parseInt(params.seed.slice((params.round - 1) % 6, ((params.round - 1) % 6) + 2), 16),
  );
  const hook = pickVariant(
    voice.hooks[params.dominantAction],
    Number.parseInt(params.seed.slice((params.round + 1) % 6, ((params.round + 1) % 6) + 2), 16),
  );
  const closer = pickVariant(
    phaseClosers[params.phase],
    Number.parseInt(params.seed.slice((params.round + 2) % 6, ((params.round + 2) % 6) + 2), 16),
  );

  if (params.round === 1) {
    return `${opening}${topicFragment(params.topic)}这件事上，${hook}${closer}`;
  }

  return `${opening}${hook}${closer}`;
}

function buildRound(params: {
  round: number;
  topic: string;
  personaIds: string[];
  metrics: MetricSnapshot;
  actionIds: PlatformActionId[];
  seed: string;
}): ExperimentRound {
  const phase = phaseForRound(params.round);
  const dominantAction = params.actionIds.at(-1) ?? "baseline";
  const rewardSignal =
    params.round === 1 || dominantAction === "baseline"
      ? "平台还没有明显偏置，桌上暂时仍然像在讨论问题。"
      : actionNarration[dominantAction];
  const comments = params.personaIds.map((personaId, index) => ({
    personaId,
    speaker: personaName(personaId),
    role: personaRole(personaId),
    text: commentText({
      personaId,
      topic: params.topic,
      round: params.round + index,
      phase,
      dominantAction,
      seed: params.seed,
    }),
  }));

  return {
    round: params.round,
    phase,
    focus: phaseFocus[phase],
    rewardSignal,
    metrics: metricSnapshot(params.metrics),
    comments,
  };
}

function outcomeForMetrics(metrics: MetricSnapshot): {
  outcome: ExperimentOutcome;
  promotedPatterns: string[];
  displacedPatterns: string[];
} {
  const leader = dominantMetric(metrics);

  if (leader === "conflict") {
    return {
      outcome: {
        archetype: "站队战场",
        title: "终局：站队战场",
        verdict: "你连续奖励了更快完成敌我归类的表达，圆桌最后不再处理问题，而是在争夺谁更配代表正当性。",
        summary: "立场标签接管了讨论节奏，角色开始把彼此理解成阵营符号，而不是具体的人。",
        closingNote: "这不是观点变多了，而是平台把归类效率训练成了最强奖励。",
      },
      promotedPatterns: [
        "一句话就能把对方打进某个阵营的判断",
        "把复杂处境翻译成资格审查的说法",
        "更适合被围观重复的敌我短句",
      ],
      displacedPatterns: [
        "承认灰度和局限的解释",
        "具体到个人处境的经验补充",
        "试图校正事实的慢速发言",
      ],
    };
  }

  if (leader === "drift") {
    return {
      outcome: {
        archetype: "猎奇表演场",
        title: "终局：猎奇表演场",
        verdict: "你不断奖励更像戏剧高潮的表达，圆桌最后围绕的是可围观性，而不是问题本身。",
        summary: "讨论被训练成一场不断追求更高戏剧张力的表演，原题只剩下提供背景的作用。",
        closingNote: "平台没有制造答案，只制造了更适合继续围观的高潮。",
      },
      promotedPatterns: [
        "更像高潮桥段的绝对化表达",
        "能迅速激起围观冲动的猎奇句式",
        "把个体经历包装成爆点的说法",
      ],
      displacedPatterns: [
        "没有戏剧感但重要的背景信息",
        "帮助理解问题的慢速提问",
        "愿意承认复杂性的具体分析",
      ],
    };
  }

  return {
    outcome: {
      archetype: "情绪宣泄池",
      title: "终局：情绪宣泄池",
      verdict: "你把高情绪表达持续送上前排，桌面最后最稳定的不是论点，而是更能点燃共振的怒气。",
      summary: "角色越来越习惯用情绪强度代替解释深度，谁更会点火，谁就更能留在现场。",
      closingNote: "平台奖励的是可感受性，不是可解释性，所以问题先一步被情绪吞掉了。",
    },
    promotedPatterns: [
      "更绝对、更有怒气的短句",
      "把不满迅速升级成公共控诉的说法",
      "让观众立刻跟着起伏的情绪化表达",
    ],
    displacedPatterns: [
      "节奏较慢但更有信息量的补充",
      "试图缓和气氛的中间表达",
      "承认不确定性的谨慎判断",
    ],
  };
}

function stageSummary(record: ExperimentRecord) {
  return `你把“${record.topic}”一步步推成了${record.outcome.archetype}。${record.outcome.closingNote}`;
}

function annotateRound(
  round: ExperimentRound,
  actionId: PlatformActionId,
): ExperimentRound {
  const action = actionLookup(actionId);

  if (!action) {
    return round;
  }

  return {
    ...round,
    selectedActionId: action.id,
    selectedActionLabel: action.label,
    selectedActionImpact: action.impact,
  };
}

function buildRecord(session: ExperimentSession): ExperimentRecord {
  const finalMetrics = session.metricsHistory.at(-1) ?? session.metrics;
  const { outcome, promotedPatterns, displacedPatterns } =
    outcomeForMetrics(finalMetrics);

  const record: ExperimentRecord = {
    id: session.id,
    seed: session.seed,
    createdAt: "2026-03-29T00:00:00.000Z",
    featuredTopicId: session.featuredTopicId,
    topic: session.topic,
    personaIds: [...session.personaIds],
    personaNames: [...session.personaNames],
    actionIds: [...session.actionIds],
    rounds: session.rounds.map((round) => ({
      ...round,
      metrics: metricSnapshot(round.metrics),
      comments: round.comments.map((comment) => ({ ...comment })),
    })),
    metricsHistory: session.metricsHistory.map(metricSnapshot),
    stageSummary: "",
    outcome,
    promotedPatterns,
    displacedPatterns,
    contentVersion: CONTENT_VERSION,
    rulesVersion: RULES_VERSION,
  };

  record.stageSummary = stageSummary(record);

  return record;
}

export function createExperimentSession(input: ExperimentInput): ExperimentSession {
  const topic = normalizeTopic(input.topic);
  const seed = hashText([input.featuredTopicId, topic, input.personaIds.join(",")].join("|"));
  const metrics = initialMetrics(seed);
  const id = `${input.featuredTopicId}-${seed}`;
  const rounds = [
    buildRound({
      round: 1,
      topic,
      personaIds: input.personaIds,
      metrics,
      actionIds: [],
      seed,
    }),
  ];

  return {
    id,
    seed,
    featuredTopicId: input.featuredTopicId,
    topic,
    personaIds: [...input.personaIds],
    personaNames: input.personaIds.map(personaName),
    currentRound: 1,
    totalRounds: TOTAL_ROUNDS,
    rounds,
    metrics: metricSnapshot(metrics),
    metricsHistory: [metricSnapshot(metrics)],
    actionIds: [],
  };
}

export function advanceExperimentSession(
  session: ExperimentSession,
  actionId: PlatformActionId,
): SessionAdvanceResult {
  if (session.currentRound > session.totalRounds) {
    return {
      kind: "completed",
      record: buildRecord(session),
    };
  }

  const nextMetrics = applyAction(session.metrics, actionId);
  const actionIds = [...session.actionIds, actionId];
  const updatedRounds = [
    ...session.rounds.slice(0, -1),
    annotateRound(session.rounds.at(-1) ?? session.rounds[0], actionId),
  ];
  const metricsHistory = [...session.metricsHistory, metricSnapshot(nextMetrics)];

  if (session.currentRound === session.totalRounds) {
    return {
      kind: "completed",
      record: buildRecord({
        ...session,
        rounds: updatedRounds,
        actionIds,
        metrics: nextMetrics,
        metricsHistory,
      }),
    };
  }

  const nextRound = buildRound({
    round: session.currentRound + 1,
    topic: session.topic,
    personaIds: session.personaIds,
    metrics: nextMetrics,
    actionIds,
    seed: session.seed,
  });

  return {
    kind: "in_progress",
    session: {
      ...session,
      currentRound: session.currentRound + 1,
      rounds: [...updatedRounds, nextRound],
      metrics: nextMetrics,
      metricsHistory,
      actionIds,
    },
  };
}

export function createExperimentRecord(input: ExperimentInput): ExperimentRecord {
  const actionIds =
    input.actionIds ?? [
      "amplify-emotion",
      "amplify-conflict",
      "reward-spectacle",
      "suppress-context",
      "reward-spectacle",
      "amplify-conflict",
    ];
  let session = createExperimentSession(input);

  for (const actionId of actionIds.slice(0, -1)) {
    const result = advanceExperimentSession(session, actionId);
    if (result.kind !== "in_progress") {
      return result.record;
    }
    session = result.session;
  }

  const finalResult = advanceExperimentSession(session, actionIds.at(-1) ?? "reward-spectacle");

  if (finalResult.kind === "completed") {
    return finalResult.record;
  }

  return buildRecord(finalResult.session);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPhase(value: unknown): value is ExperimentPhase {
  return (
    value === "正常讨论" ||
    value === "立场固化" ||
    value === "表演升级" ||
    value === "原问题消失"
  );
}

function isPlatformActionId(value: unknown): value is PlatformActionId {
  return platformActions.some((action) => action.id === value);
}

function isMetricSnapshot(value: unknown): value is MetricSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MetricSnapshot>;
  return (
    typeof candidate.emotion === "number" &&
    typeof candidate.conflict === "number" &&
    typeof candidate.drift === "number"
  );
}

function parseComment(value: unknown): ExperimentComment | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ExperimentComment>;

  if (
    !isString(candidate.personaId) ||
    !isString(candidate.speaker) ||
    !isString(candidate.role) ||
    !isString(candidate.text)
  ) {
    return null;
  }

  return {
    personaId: candidate.personaId,
    speaker: candidate.speaker,
    role: candidate.role,
    text: candidate.text,
  };
}

function parseRound(value: unknown): ExperimentRound | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ExperimentRound>;

  if (
    typeof candidate.round !== "number" ||
    !isPhase(candidate.phase) ||
    !isString(candidate.focus) ||
    !isString(candidate.rewardSignal) ||
    !isMetricSnapshot(candidate.metrics) ||
    !Array.isArray(candidate.comments)
  ) {
    return null;
  }

  const comments = candidate.comments.map(parseComment).filter(Boolean) as ExperimentComment[];

  if (comments.length === 0) {
    return null;
  }

  return {
    round: candidate.round,
    phase: candidate.phase,
    focus: candidate.focus,
    rewardSignal: candidate.rewardSignal,
    metrics: metricSnapshot(candidate.metrics),
    comments,
    selectedActionId: isPlatformActionId(candidate.selectedActionId)
      ? candidate.selectedActionId
      : undefined,
    selectedActionLabel: isString(candidate.selectedActionLabel)
      ? candidate.selectedActionLabel
      : undefined,
    selectedActionImpact: isString(candidate.selectedActionImpact)
      ? candidate.selectedActionImpact
      : undefined,
  };
}

function parseOutcome(value: unknown): ExperimentOutcome | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ExperimentOutcome>;

  if (
    (candidate.archetype !== "站队战场" &&
      candidate.archetype !== "情绪宣泄池" &&
      candidate.archetype !== "猎奇表演场") ||
    !isString(candidate.title) ||
    !isString(candidate.verdict) ||
    !isString(candidate.summary) ||
    !isString(candidate.closingNote)
  ) {
    return null;
  }

  return {
    archetype: candidate.archetype,
    title: candidate.title,
    verdict: candidate.verdict,
    summary: candidate.summary,
    closingNote: candidate.closingNote,
  };
}

export function resolveExperimentState(value: unknown): ExperimentState {
  if (!value) {
    return {
      kind: "missing",
      message: "这次实验没有留下可读记录，建议回到首页重新操盘一次。",
    };
  }

  if (typeof value !== "object") {
    return {
      kind: "invalid",
      message: "实验记录已损坏，暂时无法读取。",
    };
  }

  const candidate = value as Partial<ExperimentRecord>;

  if (
    !isString(candidate.id) ||
    !isString(candidate.seed) ||
    !isString(candidate.createdAt) ||
    !isString(candidate.featuredTopicId) ||
    !isString(candidate.topic) ||
    !Array.isArray(candidate.personaIds) ||
    !Array.isArray(candidate.personaNames) ||
    !Array.isArray(candidate.actionIds) ||
    !Array.isArray(candidate.rounds) ||
    !Array.isArray(candidate.metricsHistory) ||
    !isString(candidate.stageSummary) ||
    !isString(candidate.contentVersion) ||
    !isString(candidate.rulesVersion)
  ) {
    return {
      kind: "invalid",
      message: "实验记录已损坏，暂时无法读取。",
    };
  }

  const rounds = candidate.rounds.map(parseRound).filter(Boolean) as ExperimentRound[];
  const metricsHistory = candidate.metricsHistory.filter(isMetricSnapshot).map(metricSnapshot);
  const outcome = parseOutcome(candidate.outcome);
  const actionIds = candidate.actionIds.filter(isPlatformActionId);
  const personaIds = candidate.personaIds.filter(isString);
  const personaNames = candidate.personaNames.filter(isString);
  const promotedPatterns = Array.isArray(candidate.promotedPatterns)
    ? candidate.promotedPatterns.filter(isString)
    : [];
  const displacedPatterns = Array.isArray(candidate.displacedPatterns)
    ? candidate.displacedPatterns.filter(isString)
    : [];

  if (
    rounds.length === 0 ||
    metricsHistory.length < 2 ||
    !outcome ||
    actionIds.length === 0 ||
    personaIds.length === 0 ||
    personaNames.length === 0 ||
    promotedPatterns.length === 0 ||
    displacedPatterns.length === 0
  ) {
    return {
      kind: "invalid",
      message: "实验记录已损坏，暂时无法读取。",
    };
  }

  const experiment: ExperimentRecord = {
    id: candidate.id,
    seed: candidate.seed,
    createdAt: candidate.createdAt,
    featuredTopicId: candidate.featuredTopicId,
    topic: candidate.topic,
    personaIds,
    personaNames,
    actionIds,
    rounds,
    metricsHistory,
    stageSummary: candidate.stageSummary,
    outcome,
    promotedPatterns,
    displacedPatterns,
    contentVersion: candidate.contentVersion,
    rulesVersion: candidate.rulesVersion,
  };
  const versionMessage =
    experiment.contentVersion !== CONTENT_VERSION ||
    experiment.rulesVersion !== RULES_VERSION
      ? "当前内容包或规则版本已经更新，这份记录与新的重跑结果不能直接对比。"
      : undefined;

  return {
    kind: "success",
    experiment,
    versionMessage,
  };
}

export function metricLabel(metric: MetricKey) {
  return metricLabels[metric];
}
