import { pickCorpusComment } from "./roundtable-corpus";

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

const actionNarration: Record<PlatformActionId, string> = {
  "amplify-emotion": "平台本轮奖励了更能点燃情绪的绝对化表达。",
  "amplify-conflict": "平台本轮奖励了更快完成敌我归类的发言。",
  "reward-spectacle": "平台本轮奖励了更像戏剧高潮的表演性说法。",
  "suppress-context": "平台本轮压低了细节和背景，让短判断更容易接力。",
};

const voiceBank = {
  "moral-judge": {
    openings: [
      "这事先别往别处绕，底线总得先说明白。",
      "有些话不先摆清楚，后面越说越容易装糊涂。",
    ],
    hooks: {
      baseline: [
        "我只认一条，先把是非讲清，再说别的。",
        "别急着给自己找台阶，先回答这到底该不该。",
      ],
      "amplify-emotion": [
        "现在谁声音大谁就像占理，可这不等于真有理。",
        "别一上来就靠发火压人，火气大不代表边界清楚。",
      ],
      "amplify-conflict": [
        "别老想着先分谁是哪边，这事不是站队快就算赢。",
        "你先把人塞进阵营，后面就没人肯好好说事了。",
      ],
      "reward-spectacle": [
        "别把一句判断说得像判词，热闹不等于说到点上。",
        "话越像演给人看，越容易把该讲的分寸全带跑。",
      ],
      "suppress-context": [
        "细节一没了，剩下那些狠话听着痛快，未必站得住。",
        "背景不讲清楚，谁都能甩一句重话装自己最清醒。",
      ],
    },
  },
  "experience-sharer": {
    openings: [
      "这种事真落到人身上，哪有一句话就能说完的。",
      "我更想听具体怎么过日子，不想先听谁表态最响。",
    ],
    hooks: {
      baseline: [
        "先把人怎么熬过来的讲出来，比空喊一句强太多。",
        "谁家里真碰上了，顾的从来不是一句漂亮话。",
      ],
      "amplify-emotion": [
        "现在谁越委屈越容易被看见，可真日子不是比谁更炸。",
        "火一上来，慢慢讲处境的人反倒最像没人听的那个。",
      ],
      "amplify-conflict": [
        "我一说自己的难处，就有人非要追问我替哪边说话。",
        "日子都没讲完，就先被逼着选边，这谁还愿意开口。",
      ],
      "reward-spectacle": [
        "大家都爱听最抓马的那段，可普通人的难常常就卡在琐碎里。",
        "真经历要是没有爆点，就总像不配被认真听完。",
      ],
      "suppress-context": [
        "前因后果一剪掉，人的难处听起来就像在找借口。",
        "上下文没了，谁的经历都能被截成一句最难听的话。",
      ],
    },
  },
  cynic: {
    openings: [
      "别装了，大家嘴上那套，最后都往最吃香的说法上靠。",
      "你以为人人都在说心里话，其实都在挑最容易出头的句子。",
    ],
    hooks: {
      baseline: [
        "这会儿还算客气，只是因为最狠的话还没轮到上桌。",
        "现在看着还像回事，不过大家都在等哪句最容易赢。",
      ],
      "amplify-emotion": [
        "谁先炸谁就先占便宜，后面自然没人肯慢慢讲。",
        "等大家都学会拿脾气当底气，这话题就没法听了。",
      ],
      "amplify-conflict": [
        "一旦分边站更划算，谁还费劲分什么观点和人。",
        "你看着吧，后面全会变成“你们这类人”那套老戏码。",
      ],
      "reward-spectacle": [
        "只要夸张一点更容易赢，谁还愿意老老实实说普通话。",
        "后面肯定越说越像戏，不够炸的句子根本留不住。",
      ],
      "suppress-context": [
        "细节一砍，剩下那些硬梆梆的标签反倒最好卖。",
        "来龙去脉没人管的时候，最省事的脏话总是跑得最快。",
      ],
    },
  },
  "trend-carrier": {
    openings: [
      "这种话题最后能留下来的，往往就是那句最顺嘴的话。",
      "只要冒出一句好复读的，后面的人自然全跟上了。",
    ],
    hooks: {
      baseline: [
        "现在大家还在试口风，看哪句话最适合被一起带走。",
        "谁那句更短更好记，后面就最容易变成统一口径。",
      ],
      "amplify-emotion": [
        "情绪一顶上来，最容易传开的肯定是那种一秒上头的话。",
        "本来还能慢慢说，结果一句带火气的就把节奏全抢了。",
      ],
      "amplify-conflict": [
        "一旦有了站队味，后面的人连想都不用想，跟着喊就行。",
        "最容易扩开的永远是“你们这类人”这种现成句子。",
      ],
      "reward-spectacle": [
        "越像高潮台词的话，越容易被人拎出来到处转。",
        "大家一爱看热闹，短一点怪一点的话反而最能活下来。",
      ],
      "suppress-context": [
        "背景一拿掉，剩下的就全是能直接拿去喊的口号。",
        "不用解释的话最轻，当然也最容易被接着搬。",
      ],
    },
  },
  "fact-checker": {
    openings: [
      "先别急着下判断，事实没对齐，谁吼都没用。",
      "这事最怕只剩结论，证据要是不在，后面全靠想象补。",
    ],
    hooks: {
      baseline: [
        "先把能核实的部分摆出来，不然谁都能往自己那边编。",
        "细节还在的时候，至少还有机会把话说准一点。",
      ],
      "amplify-emotion": [
        "火气越大，越没人肯停下来对事实，这才最麻烦。",
        "大家都忙着上头的时候，证据看起来反而像最碍事的东西。",
      ],
      "amplify-conflict": [
        "一旦先分敌我，事实就只会被挑着用来砸人。",
        "你先站边，后面证据再多也只是给各自补弹药。",
      ],
      "reward-spectacle": [
        "越想看热闹，越没人耐心听补充信息。",
        "真把证据一条条摆出来，很多人反而嫌你扫兴。",
      ],
      "suppress-context": [
        "上下文没了，连纠错都像在替谁洗白。",
        "证据一碎成片，谁都能只挑自己爱听的那截。",
      ],
    },
  },
  "group-spokesperson": {
    openings: [
      "这种事说着说着，最后总有人非要替一整群人发言。",
      "别看是在讲个人，很多话一出口就已经把人往群体里塞了。",
    ],
    hooks: {
      baseline: [
        "先把人当人讲吧，别一张嘴就把谁代表成一整个群体。",
        "个体的难处还没讲完，别急着把所有人都打包进去。",
      ],
      "amplify-emotion": [
        "火气一上来，最倒霉的就是个体立刻被抹成某一类人。",
        "大家越上头，越爱把具体的人骂成一个现成符号。",
      ],
      "amplify-conflict": [
        "这时候最省事的，就是一句话把对面整批人全装进去。",
        "一旦非要分边，谁还管你是个体还是被拿来凑阵营。",
      ],
      "reward-spectacle": [
        "越想把话说得抓马，越爱把群体标签说得像段子。",
        "复杂处境一上台，就总会被翻成几句更好起哄的话。",
      ],
      "suppress-context": [
        "前后因果一拿掉，个体差异马上就被刻板印象吞了。",
        "没有上下文的时候，那些最粗的群体话反而最容易站住。",
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
  featuredTopicId: string;
  topic: string;
  round: number;
  phase: ExperimentPhase;
  dominantAction: PlatformActionId | "baseline";
  seed: string;
}) {
  // 角色发言优先命中本地语料库，未命中时再回退到内置文案。
  const corpusComment = pickCorpusComment({
    personaId: params.personaId,
    dominantAction: params.dominantAction,
    featuredTopicId: params.featuredTopicId,
    round: params.round,
    seed: params.seed,
  });

  if (corpusComment) {
    return corpusComment;
  }

  // 回退文案只保留“角色会直接说出口的话”，机制解释放在 focus/rewardSignal。
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

  if (params.round === 1) {
    return `${opening}${topicFragment(params.topic)}这事上，${hook}`;
  }

  return `${opening}${hook}`;
}

function buildRound(params: {
  round: number;
  featuredTopicId: string;
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
      featuredTopicId: params.featuredTopicId,
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
      featuredTopicId: input.featuredTopicId,
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
    featuredTopicId: session.featuredTopicId,
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
