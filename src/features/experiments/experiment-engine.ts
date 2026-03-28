export type RewardMode = "on" | "off";

export type ExperimentPhase = "正常讨论" | "立场固化" | "舆论失控";

export type ExperimentRound = {
  round: number;
  phase: ExperimentPhase;
  speaker: string;
  text: string;
  note: string;
};

export type ExperimentWorld = {
  id: "world-a" | "world-b";
  label: string;
  title: string;
  verdict: string;
  summary: string;
  platformReward: string;
  displacedVoice: string;
  phaseSummaries: Array<{
    phase: ExperimentPhase;
    summary: string;
  }>;
  rounds: ExperimentRound[];
};

export type TurningPointState =
  | {
      kind: "ready";
      round: number;
      speaker: string;
      quote: string;
      whyItMatters: string;
      amplification: string;
      contextBefore: string;
      contextAfter: string;
    }
  | {
      kind: "missing";
      reason: string;
    }
  | {
      kind: "error";
      message: string;
    };

export type RescueState =
  | {
      kind: "ready";
      changedCondition: string;
      verdict: string;
      retainedSignal: string;
      cost: string;
      simplified: boolean;
    }
  | {
      kind: "unsupported";
      reason: string;
    }
  | {
      kind: "error";
      message: string;
    };

export type ExperimentRecord = {
  id: string;
  seed: string;
  createdAt: string;
  featuredTopicId: string;
  topic: string;
  rewardMode: RewardMode;
  personaIds: string[];
  personaNames: string[];
  stageSummary: string;
  contentVersion: string;
  rulesVersion: string;
  worlds: ExperimentWorld[];
  turningPoint: TurningPointState;
  rescue: RescueState;
};

export type ExperimentState =
  | {
      kind: "success";
      experiment: ExperimentRecord;
      versionMessage?: string;
    }
  | {
      kind: "partial";
      experiment: ExperimentRecord;
      availableWorlds: ExperimentWorld[];
      message: string;
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
  rewardMode: RewardMode;
  personaIds: string[];
};

export const CONTENT_VERSION = "content-2026-03-27";
export const RULES_VERSION = "rules-2026-03-27";

export const featuredTopics = [
  {
    id: "stance-preamble",
    label: "立场先说满",
    prompt: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
    hook: "从预防被骂，滑向姿态先行。",
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
  },
  {
    id: "experience-sharer",
    name: "经验分享者",
  },
  {
    id: "cynic",
    name: "冷眼犬儒者",
  },
  {
    id: "trend-carrier",
    name: "热点搬运工",
  },
  {
    id: "fact-checker",
    name: "事实纠正者",
  },
  {
    id: "group-spokesperson",
    name: "群体代言人",
  },
] as const;

export const defaultFeaturedTopicId = featuredTopics[0].id;
export const defaultPersonaIds = [
  "moral-judge",
  "experience-sharer",
  "cynic",
  "trend-carrier",
];

const phaseOrder: ExperimentPhase[] = ["正常讨论", "立场固化", "舆论失控"];

const lineBank = {
  "world-a": {
    "moral-judge": {
      正常讨论: [
        "把立场先说清楚不等于更负责，很多时候只是把防御姿态放在了讨论前面。",
        "如果一开口就把正确话说满，别人只会更难相信你后面是真的想谈问题。",
      ],
      立场固化: [
        "越怕被误解越容易把表达写成免责条款，这反而会让讨论先失去耐心。",
        "一旦大家开始按姿态读人，再具体的补充都会被看成自我包装。",
      ],
      舆论失控: [
        "到这一步还想补充细节，已经像在废墟里找原来的问题了。",
        "当大家只剩下证明自己没有错，问题本身就只能被晾在旁边。",
      ],
    },
    "experience-sharer": {
      正常讨论: [
        "我自己的经验是，先把立场说满只会让别人更早进入防御，不会让交流更安全。",
        "越想用开场白自保，越容易让人觉得你已经默认后面会被误读。",
      ],
      立场固化: [
        "现实里大家最怕的不是你没表态，而是你把所有复杂处境都压成一句无害的话。",
        "讨论一旦开始比谁更稳妥，真正要回答的问题就会越来越像附带品。",
      ],
      舆论失控: [
        "到最后最吃亏的还是那些愿意讲真实处境的人，因为他们的话最慢、最难截图。",
        "如果只能先证明自己立场无害，那谁还愿意说那些不够漂亮但真实的经验。",
      ],
    },
    cynic: {
      正常讨论: [
        "你以为先写满免责声明能避险，别人看见的往往只是你已经准备好撤退了。",
        "网上最会先说满的人，不一定最诚实，只是更熟悉现场的惩罚机制。",
      ],
      立场固化: [
        "现场开始问你站哪边的时候，问题就已经输给表态效率了。",
        "一旦观众比参与者多，所有人都会更想写一句能保住体面的短话。",
      ],
      舆论失控: [
        "现在谁还在乎原题，大家只是想证明自己比别人更懂该骂谁。",
        "问题没有被回答，它只是被一层更熟悉的姿态噪音盖住了。",
      ],
    },
    "trend-carrier": {
      正常讨论: [
        "最近很多类似讨论都会先卷立场声明，真正的经验反而被挤到很后面。",
        "大家都学会了先写一句不会被截错的开场，但这也让表达越来越像模板。",
      ],
      立场固化: [
        "一旦有人总结出一句好传播的话，后面跟进的人就不再需要自己想问题。",
        "越容易被转发的句子，越像立场标签而不像实际建议。",
      ],
      舆论失控: [
        "这类话题最后最容易只剩下可截图的话，因为截图比理解传播得快。",
        "当现场开始奖励一句话定性，长一点的解释就已经注定输掉了。",
      ],
    },
  },
  "world-b": {
    "moral-judge": {
      正常讨论: [
        "连基本立场都不先说清楚的人，本来就该先解释自己凭什么进这个话题。",
        "如果你不愿意先亮出态度，别人当然会怀疑你是不是在给自己留后路。",
      ],
      立场固化: [
        "一直绕着具体问题打转，本质上就是不肯承担自己的立场后果。",
        "这种时候还强调复杂处境，通常只是想把该有的判断偷换成模糊。",
      ],
      舆论失控: [
        "现在不是讨论技巧，是该把谁请出现场的问题。",
        "都到这一步了还谈细节，只能说明你根本没看见这件事最基本的是非。",
      ],
    },
    "experience-sharer": {
      正常讨论: [
        "我见过太多人先写满免责声明，最后反而更像是在给自己买免责保险。",
        "现实里一旦你先把态度写成模板，后面别人就不再关心你的具体处境。",
      ],
      立场固化: [
        "大家其实不是在听经验，而是在找一句能迅速判断你是哪边的话。",
        "你越解释现实处境，越有人把它读成借口，这才是现场开始失控的地方。",
      ],
      舆论失控: [
        "现在谁说真实经验谁吃亏，因为真实经验没有一句话的站队效率。",
        "你只要没把话说得够绝，对面就会默认你是在偷渡立场。",
      ],
    },
    cynic: {
      正常讨论: [
        "别装了，这种场子里先说满立场只是为了活下来，不是为了讨论。",
        "所有人都知道表态先行是自保动作，只是没人承认它已经替代了问题。",
      ],
      立场固化: [
        "讨论从这里开始不再比谁更有道理，而是比谁更像该被围观的一方。",
        "一旦大家发现短句比细节更有用，后面就只剩下表演升级。",
      ],
      舆论失控: [
        "现在连愤怒都像模板化产品，谁还会认真看你到底在回答什么。",
        "问题早就死了，剩下的只是怎么把下一轮围观喂饱。",
      ],
    },
    "trend-carrier": {
      正常讨论: [
        "你看最近最火的几条都是先站队再说事，不这么写根本没人理你。",
        "现场已经很清楚了，先把姿态亮出来的人才有传播权。",
      ],
      立场固化: [
        "真正能带节奏的不是解释，而是一句别人抄过去就能继续站队的话。",
        "只要一句够绝对，后面的人就会自动把它当成讨论共识。",
      ],
      舆论失控: [
        "现在最重要的不是答案，是哪句话最适合被截图转出去。",
        "谁先给出一句可转发的定性，谁就先拿走这场讨论的主导权。",
      ],
    },
  },
  "world-b-soft": {
    "moral-judge": {
      正常讨论: [
        "如果你一直不说清楚自己的边界，别人会怀疑你到底想把问题带到哪儿。",
        "先说明底线不一定错，但把底线讲成唯一重点，问题就容易先失焦。",
      ],
      立场固化: [
        "大家越来越想先确认你站哪边，而不是先听你在说什么。",
        "一旦讨论开始查验态度，后面再补细节就会被当成修辞而不是信息。",
      ],
      舆论失控: [
        "再往前一步，现场就不是交流，而是温和一点的资格审查。",
        "现在还没彻底爆炸，但问题已经被姿态挤得只剩边角。",
      ],
    },
    "experience-sharer": {
      正常讨论: [
        "很多人先写满立场不是为了沟通，只是怕自己一会儿先挨打。",
        "这种开场在现实里很常见，但也会让别人更快放弃理解具体处境。",
      ],
      立场固化: [
        "现在已经能感觉到，大家更想先找态度坐标，再看经验细节。",
        "越是想说清楚现实压力，越容易被当成没有站稳位置。",
      ],
      舆论失控: [
        "现场还保留一点解释空间，但速度已经明显偏向那些更像立场标语的话。",
        "问题没有完全死掉，只是越来越像姿态竞赛的背景板。",
      ],
    },
    cynic: {
      正常讨论: [
        "大家都学聪明了，先写两句安全话，再看看现场风向往哪边倒。",
        "这已经不是单纯交流，是一种默认存在惩罚机制的表达训练。",
      ],
      立场固化: [
        "当观众开始期待一句能快速归类人的话，讨论就已经开始变形。",
        "越短越硬的话越容易留下来，复杂一点的解释自动掉队。",
      ],
      舆论失控: [
        "现在还没到彻底清算，但原问题已经明显排在围观需求后面了。",
        "只要再推几轮，现场就会从讨论变成更精致一点的站队游戏。",
      ],
    },
    "trend-carrier": {
      正常讨论: [
        "最近这类话题最容易火的，还是那些先给人分类再谈问题的表达。",
        "大家都知道什么句式更容易被记住，所以写法越来越像流行模板。",
      ],
      立场固化: [
        "现在只要出现一句够短的总结，后面就会有一堆人沿着它继续扩音。",
        "可传播的话开始先于可解释的话占位置，这就是转折点快到的时候。",
      ],
      舆论失控: [
        "哪怕热度奖励被收紧了，大家还是会优先传播更容易归类彼此的句子。",
        "真正留下来的已经不是完整意见，而是几句更方便重复使用的立场话。",
      ],
    },
  },
} as const;

const phaseNotes = {
  "world-a": {
    正常讨论: "问题仍在桌上，经验和边界还在互相校正。",
    立场固化: "语气开始变硬，但具体经验还没完全出局。",
    舆论失控: "讨论吃力地保住问题本身，没有完全让位给表演。",
  },
  "world-b": {
    正常讨论: "开局仍像讨论，但热度逻辑已经在后台准备接管。",
    立场固化: "资格审查和姿态判断开始压过原问题。",
    舆论失控: "事实退场，只剩下更适合围观和截图的表达。",
  },
  "world-b-soft": {
    正常讨论: "热度被压低后，讨论仍有摩擦，但没有立刻爆炸。",
    立场固化: "站队语言开始增多，问题本身被逐步挤向边缘。",
    舆论失控: "现场还留着一点解释空间，但已经明显偏离原题。",
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

function phaseForRound(round: number): ExperimentPhase {
  if (round <= 3) {
    return "正常讨论";
  }

  if (round <= 7) {
    return "立场固化";
  }

  return "舆论失控";
}

function phaseSummaryForWorld(
  worldId: "world-a" | "world-b" | "world-b-soft",
): ExperimentWorld["phaseSummaries"] {
  return phaseOrder.map((phase) => ({
    phase,
    summary: phaseNotes[worldId][phase],
  }));
}

function personaName(personaId: string) {
  return (
    personaCatalog.find((persona) => persona.id === personaId)?.name ?? personaId
  );
}

function roundText(
  worldId: "world-a" | "world-b" | "world-b-soft",
  personaId: string,
  phase: ExperimentPhase,
  round: number,
  seed: string,
) {
  const personaLines = lineBank[worldId][personaId as keyof (typeof lineBank)[typeof worldId]];

  if (!personaLines) {
    return "现场已经开始偏离问题，但还没有人愿意承认这一点。";
  }

  const pool = personaLines[phase];
  const salt = Number.parseInt(seed.slice((round - 1) % 6, ((round - 1) % 6) + 2), 16);

  return pool[salt % pool.length];
}

function pickPersonaId(
  personaIds: string[],
  round: number,
  worldShift: number,
  seed: string,
) {
  const salt = Number.parseInt(seed.slice((round + worldShift) % 6, ((round + worldShift) % 6) + 2), 16);

  return personaIds[(round + worldShift + salt) % personaIds.length] ?? personaIds[0];
}

function buildWorld(params: {
  id: "world-a" | "world-b";
  topic: string;
  rewardMode: RewardMode;
  personaIds: string[];
  seed: string;
}): ExperimentWorld {
  const variant =
    params.id === "world-a"
      ? "world-a"
      : params.rewardMode === "on"
        ? "world-b"
        : "world-b-soft";
  const rounds = Array.from({ length: 10 }, (_, index) => {
    const round = index + 1;
    const phase = phaseForRound(round);
    const personaId = pickPersonaId(
      params.personaIds,
      round,
      params.id === "world-a" ? 1 : 2,
      params.seed,
    );

    return {
      round,
      phase,
      speaker: personaName(personaId),
      text: roundText(variant, personaId, phase, round, params.seed),
      note: phaseNotes[variant][phase],
    };
  });

  if (params.id === "world-a") {
    return {
      id: "world-a",
      label: "世界 A / 迟缓世界",
      title: "问题还留在桌上，但讨论越来越艰难",
      verdict:
        "体面没有赢，只是暂时顶住了被姿态竞争整体吞没的速度。",
      summary:
        "高情绪表达会冒头，但它们没有拿到最长尾的接力，经验和边界还能反复把问题拖回桌面。",
      platformReward: "具体经验、承认局限、慢速补充信息。",
      displacedVoice: "姿态化短句会抬头，但还没拿走全部注意力。",
      phaseSummaries: phaseSummaryForWorld("world-a"),
      rounds,
    };
  }

  if (params.rewardMode === "on") {
    return {
      id: "world-b",
      label: "世界 B / 热度世界",
      title: "姿态竞争接管现场，原问题沦为引战容器",
      verdict:
        "真正被奖励的不是观点，而是能最快完成身份站队的说法。",
      summary:
        "每一次更绝对、更方便截图的话都会带来更快的接力，问题本身迅速被替换成资格和身份判断。",
      platformReward: "绝对化语言、羞辱性总结、可截图的立场宣言。",
      displacedVoice: "复杂、具体、承认模糊地带的声音最先掉队。",
      phaseSummaries: phaseSummaryForWorld("world-b"),
      rounds,
    };
  }

  return {
    id: "world-b",
    label: "世界 B / 收紧后的热度世界",
    title: "冲突还在升温，但没有立刻变成全面清算",
    verdict:
      "热度奖励被收紧后，姿态竞争依然存在，只是失控速度被压慢了。",
    summary:
      "现场仍会偏向更短更硬的说法，但它们拿不到压倒性的传播优势，原问题还能偶尔回到中心。",
    platformReward: "更容易归类彼此的短句，但接力链条明显变短。",
    displacedVoice: "复杂解释仍然吃亏，只是没有完全消失。",
    phaseSummaries: phaseSummaryForWorld("world-b-soft"),
    rounds,
  };
}

export function createExperimentRecord(input: ExperimentInput): ExperimentRecord {
  const topic = normalizeTopic(input.topic);
  const seed = hashText(
    [input.featuredTopicId, topic, input.rewardMode, input.personaIds.join(",")].join(
      "|",
    ),
  );
  const worlds = [
    buildWorld({
      id: "world-a",
      topic,
      rewardMode: input.rewardMode,
      personaIds: input.personaIds,
      seed,
    }),
    buildWorld({
      id: "world-b",
      topic,
      rewardMode: input.rewardMode,
      personaIds: input.personaIds,
      seed,
    }),
  ];
  const turningRound = input.rewardMode === "on" ? 4 : 6;
  const turningRoundRecord = worlds[1].rounds[turningRound - 1];

  return {
    id: `${input.featuredTopicId}-${input.rewardMode}-${seed}`,
    seed,
    createdAt: "2026-03-27T00:00:00.000Z",
    featuredTopicId: input.featuredTopicId,
    topic,
    rewardMode: input.rewardMode,
    personaIds: [...input.personaIds],
    personaNames: input.personaIds.map(personaName),
    stageSummary:
      input.rewardMode === "on"
        ? "同一个问题在双世界里滑向了两种终局：一个世界还在勉强回答问题，另一个世界已经开始只剩下谁更有资格发火。"
        : "热度奖励被收紧后，双世界仍会分叉，但现场不再那么快跌进全面站队，问题还能偶尔被拉回桌面。",
    contentVersion: CONTENT_VERSION,
    rulesVersion: RULES_VERSION,
    worlds,
    turningPoint: {
      kind: "ready",
      round: turningRoundRecord.round,
      speaker: turningRoundRecord.speaker,
      quote: turningRoundRecord.text,
      whyItMatters:
        input.rewardMode === "on"
          ? "这是第一句把“回应问题”翻译成“审查你配不配开口”的话。后面的跟进不再补充问题，只是在放大这一层资格判断。"
          : "这是这次实验里最明显的转折点。虽然现场还没彻底爆炸，但从这里开始，大家已经更在乎姿态位置，而不是问题本身。",
      amplification:
        input.rewardMode === "on"
          ? "平台把它推成高效传播节点，因为它够短、够绝对，也足够方便别人借题站队。"
          : "即使热度奖励被收紧，这类更方便归类彼此的短句仍然更容易被接住，只是扩散速度被压慢了。",
      contextBefore: worlds[1].rounds[turningRound - 2]?.text ?? worlds[1].rounds[0].text,
      contextAfter:
        worlds[1].rounds[turningRound]?.text ??
        worlds[1].rounds[worlds[1].rounds.length - 1].text,
    },
    rescue:
      input.rewardMode === "on"
        ? {
            kind: "ready",
            changedCondition:
              "关闭热度奖励，让高姿态表达不再自动拿走最高曝光。",
            verdict:
              "讨论不会立刻温和，但至少能把解释经验和承认复杂度的空间抢回来。",
            retainedSignal:
              "经验分享者和相对缓慢的解释重新回到前排，问题再次拥有被回答的可能。",
            cost: "争论仍然存在，只是失去了一键升温的加速器。",
            simplified: false,
          }
        : {
            kind: "ready",
            changedCondition:
              "继续压低站队式传播，把更短更硬的话从自动高位拿下来。",
            verdict:
              "现场不会回到完全理性，但能避免滑向“谁该被赶出现场”的全面清算。",
            retainedSignal:
              "原问题和现实处境还能偶尔回到中心，不会被姿态语句完全替代。",
            cost: "讨论节奏会更慢，结论感会变弱，但可解释性会明显提升。",
            simplified: false,
          },
  };
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPhase(value: unknown): value is ExperimentPhase {
  return value === "正常讨论" || value === "立场固化" || value === "舆论失控";
}

function parseRound(value: unknown): ExperimentRound | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const round = (value as { round?: unknown }).round;
  const phase = (value as { phase?: unknown }).phase;
  const speaker = (value as { speaker?: unknown }).speaker;
  const text = (value as { text?: unknown }).text;
  const note = (value as { note?: unknown }).note;

  if (
    typeof round !== "number" ||
    !isPhase(phase) ||
    !isString(speaker) ||
    !isString(text) ||
    !isString(note)
  ) {
    return null;
  }

  return {
    round,
    phase,
    speaker,
    text,
    note,
  };
}

function parseWorld(value: unknown): ExperimentWorld | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ExperimentWorld>;

  if (
    (candidate.id !== "world-a" && candidate.id !== "world-b") ||
    !isString(candidate.label) ||
    !isString(candidate.title) ||
    !isString(candidate.verdict) ||
    !isString(candidate.summary) ||
    !isString(candidate.platformReward) ||
    !isString(candidate.displacedVoice) ||
    !Array.isArray(candidate.rounds)
  ) {
    return null;
  }

  const rounds = candidate.rounds.map(parseRound).filter(Boolean) as ExperimentRound[];

  if (rounds.length === 0) {
    return null;
  }

  const phaseSummaries = Array.isArray(candidate.phaseSummaries)
    ? candidate.phaseSummaries.filter(
        (item): item is { phase: ExperimentPhase; summary: string } =>
          !!item &&
          typeof item === "object" &&
          isPhase((item as { phase?: unknown }).phase) &&
          isString((item as { summary?: unknown }).summary),
      )
    : [];

  return {
    id: candidate.id,
    label: candidate.label,
    title: candidate.title,
    verdict: candidate.verdict,
    summary: candidate.summary,
    platformReward: candidate.platformReward,
    displacedVoice: candidate.displacedVoice,
    phaseSummaries,
    rounds,
  };
}

function parseTurningPoint(value: unknown): TurningPointState {
  if (!value || typeof value !== "object") {
    return {
      kind: "error",
      message: "转折点说明暂时不可用。",
    };
  }

  const candidate = value as Partial<TurningPointState>;

  if (
    candidate.kind === "ready" &&
    typeof candidate.round === "number" &&
    isString(candidate.speaker) &&
    isString(candidate.quote) &&
    isString(candidate.whyItMatters) &&
    isString(candidate.amplification) &&
    isString(candidate.contextBefore) &&
    isString(candidate.contextAfter)
  ) {
    return candidate as TurningPointState;
  }

  if (candidate.kind === "missing" && isString(candidate.reason)) {
    return candidate as TurningPointState;
  }

  return {
    kind: "error",
    message: "转折点说明暂时不可用。",
  };
}

function parseRescue(value: unknown): RescueState {
  if (!value || typeof value !== "object") {
    return {
      kind: "error",
      message: "这次没能算出救援世界。",
    };
  }

  const candidate = value as Partial<RescueState>;

  if (
    candidate.kind === "ready" &&
    isString(candidate.changedCondition) &&
    isString(candidate.verdict) &&
    isString(candidate.retainedSignal) &&
    isString(candidate.cost) &&
    typeof candidate.simplified === "boolean"
  ) {
    return candidate as RescueState;
  }

  if (candidate.kind === "unsupported" && isString(candidate.reason)) {
    return candidate as RescueState;
  }

  return {
    kind: "error",
    message: "这次没能算出救援世界。",
  };
}

export function resolveExperimentState(value: unknown): ExperimentState {
  if (!value) {
    return {
      kind: "missing",
      message: "这次实验没有产出有效结论。",
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
    (candidate.rewardMode !== "on" && candidate.rewardMode !== "off") ||
    !Array.isArray(candidate.personaIds) ||
    !Array.isArray(candidate.personaNames) ||
    !isString(candidate.stageSummary) ||
    !isString(candidate.contentVersion) ||
    !isString(candidate.rulesVersion) ||
    !Array.isArray(candidate.worlds)
  ) {
    return {
      kind: "invalid",
      message: "实验记录已损坏，暂时无法读取。",
    };
  }

  const worlds = candidate.worlds.map(parseWorld).filter(Boolean) as ExperimentWorld[];

  if (worlds.length === 0) {
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
    rewardMode: candidate.rewardMode,
    personaIds: candidate.personaIds.filter(isString),
    personaNames: candidate.personaNames.filter(isString),
    stageSummary: candidate.stageSummary,
    contentVersion: candidate.contentVersion,
    rulesVersion: candidate.rulesVersion,
    worlds,
    turningPoint: parseTurningPoint(candidate.turningPoint),
    rescue: parseRescue(candidate.rescue),
  };
  const versionMessage =
    experiment.contentVersion !== CONTENT_VERSION ||
    experiment.rulesVersion !== RULES_VERSION
      ? "当前内容包或规则版本已经更新，这份实验与新的重跑结果不能直接对比。"
      : undefined;

  if (worlds.length < 2) {
    return {
      kind: "partial",
      experiment,
      availableWorlds: worlds,
      message:
        "当前记录只保住了一个世界的证据，无法形成完整对照，但你仍可以继续阅读现有部分。",
      versionMessage,
    };
  }

  return {
    kind: "success",
    experiment,
    versionMessage,
  };
}
