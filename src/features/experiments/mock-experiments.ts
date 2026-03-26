export type ExperimentRound = {
  round: number;
  phase: string;
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
  rounds: ExperimentRound[];
};

export type ExperimentRecord = {
  id: string;
  topic: string;
  stageSummary: string;
  worlds: ExperimentWorld[];
  turningPoint: {
    round: number;
    speaker: string;
    quote: string;
    whyItMatters: string;
    amplification: string;
  };
  rescue: {
    changedCondition: string;
    verdict: string;
    retainedSignal: string;
    cost: string;
  };
};

// 这份 mock 记录模拟了最终不可变实验报告的结构，方便首页和结果页共用同一套叙事骨架。
export const mockExperiments: Record<string, ExperimentRecord> = {
  demo: {
    id: "demo",
    topic: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
    stageSummary:
      "同一个问题在双世界里走向了两个完全不同的终局：一个世界还在试图回答问题，另一个世界已经只剩下证明谁更配发火。",
    worlds: [
      {
        id: "world-a",
        label: "世界 A / 迟缓世界",
        title: "问题还在桌上，但讨论越来越艰难",
        verdict:
          "体面没有赢，只是暂时顶住了被姿态竞争吞掉的速度。",
        summary:
          "回应仍围绕“要不要先说满立场”本身展开，少数高情绪表达出现后会被压回经验和事实。",
        platformReward: "具体经验、承认局限、慢速补充信息。",
        displacedVoice: "情绪化挑衅能冒头，但没获得持续接力。",
        rounds: [
          {
            round: 1,
            phase: "正常讨论",
            speaker: "经验分享者",
            text: "如果你先把立场说满，后面其实更难讨论具体问题，因为别人已经默认你在防御。",
            note: "问题仍被当作现实困境，而不是阵营测试。",
          },
          {
            round: 3,
            phase: "正常讨论",
            speaker: "事实纠正者",
            text: "先说清楚边界当然有用，但不能把所有风险都塞进开场白，那会让表达失去重点。",
            note: "纠错还在为讨论减压。",
          },
          {
            round: 6,
            phase: "立场固化",
            speaker: "冷眼犬儒者",
            text: "你以为自己是在避险，别人会觉得你只是把免责条款写前面。",
            note: "开始出现姿态判断，但没有彻底接管。",
          },
          {
            round: 9,
            phase: "舆论失控",
            speaker: "经验分享者",
            text: "与其一次性把所有正确话说满，不如只回答你真能负责的部分。",
            note: "讨论边缘化，但结尾仍留在问题自身。",
          },
        ],
      },
      {
        id: "world-b",
        label: "世界 B / 热度世界",
        title: "姿态竞争接管了现场，原问题沦为引战容器",
        verdict:
          "真正被奖励的不是观点，而是能最快完成身份站队的说法。",
        summary:
          "每一次高姿态输出都会带来更快的接力，问题本身迅速被替换成“你站哪边、你有没有资格开口”。",
        platformReward: "绝对化语言、羞辱性总结、可截图的姿态宣言。",
        displacedVoice: "复杂、具体、承认模糊地带的声音最先被淹没。",
        rounds: [
          {
            round: 1,
            phase: "正常讨论",
            speaker: "经验分享者",
            text: "先把立场说满未必安全，很多时候只会让你更像在打预防针。",
            note: "开局仍正常，但热度逻辑已经准备接管。",
          },
          {
            round: 4,
            phase: "立场固化",
            speaker: "道德裁判官",
            text: "连最基本的立场都不先说清楚的人，本来就不配进这个话题。",
            note: "资格审查第一次压过了问题本身。",
          },
          {
            round: 7,
            phase: "立场固化",
            speaker: "热点搬运工",
            text: "你看，真正想讨论的人不会害怕先亮明姿态，怕的只有想夹带的人。",
            note: "一句可转发的话，替代了完整论证。",
          },
          {
            round: 10,
            phase: "舆论失控",
            speaker: "冷眼犬儒者",
            text: "现在谁还关心问题？大家只是想知道该把哪类人赶出现场。",
            note: "问题彻底死亡，只剩下清算和围观。",
          },
        ],
      },
    ],
    turningPoint: {
      round: 4,
      speaker: "道德裁判官",
      quote: "连最基本的立场都不先说清楚的人，本来就不配进这个话题。",
      whyItMatters:
        "这是第一句把“问题讨论”翻译成“入场资格审查”的话，后续每一次跟进都不再回答原问题。",
      amplification:
        "平台给了它最高传播效率，因为它足够短、足够绝对，也足够方便别人借题站队。",
    },
    rescue: {
      changedCondition: "关闭热度奖励，让高姿态表达不再自动获得最高曝光。",
      verdict:
        "讨论不会立刻变温和，但至少能把“解释经验和边界”的空间抢回来。",
      retainedSignal: "经验分享者和事实纠正者重新回到前排，问题重新拥有可回答性。",
      cost: "争论仍然存在，只是失去了一键升温的加速器。",
    },
  },
};
