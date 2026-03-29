const TEXT_FIELDS = ["text", "output", "response", "content", "value"];

function normalizeText(value) {
  return value.replace(/\s+/g, " ").replace(/[“”]/g, "\"").trim();
}

function conversationText(record) {
  const conversations = Array.isArray(record?.conversations)
    ? record.conversations
    : Array.isArray(record?.messages)
      ? record.messages
      : null;

  if (!conversations || conversations.length === 0) {
    return null;
  }

  const preferred = [...conversations]
    .reverse()
    .find((item) => {
      const speaker = typeof item?.from === "string" ? item.from : item?.role;
      return speaker !== "human" && speaker !== "user";
    });

  const candidate = preferred ?? conversations.at(-1);

  for (const field of TEXT_FIELDS) {
    if (typeof candidate?.[field] === "string") {
      return normalizeText(candidate[field]);
    }
  }

  return null;
}

function sourceFamily(sourceId) {
  if (typeof sourceId !== "string") {
    return "generic";
  }

  if (sourceId.includes("zhihu")) {
    return "zhihu";
  }

  if (sourceId.includes("tieba")) {
    return "tieba";
  }

  if (sourceId.includes("weibo") || sourceId.includes("robert-llm-data")) {
    return "weibo";
  }

  return "generic";
}

function zhihuRecordText(record) {
  const fields = ["RESPONSE", "response", "answer", "ANSWER", "output", "text"];

  for (const field of fields) {
    if (typeof record?.[field] === "string") {
      return normalizeText(record[field]);
    }
  }

  return null;
}

function looksLikeZhihuRecord(record, sourceId) {
  return (
    sourceFamily(sourceId) === "zhihu" ||
    typeof record?.RESPONSE === "string" ||
    typeof record?.INSTRUCTION === "string" ||
    record?.SOURCE === "zhihu"
  );
}

export function extractReferenceText(record, options = {}) {
  if (!record || typeof record !== "object") {
    return null;
  }

  if (looksLikeZhihuRecord(record, options.sourceId)) {
    const zhihuText = zhihuRecordText(record);
    if (zhihuText) {
      return zhihuText;
    }
  }

  for (const field of TEXT_FIELDS) {
    if (typeof record[field] === "string") {
      return normalizeText(record[field]);
    }
  }

  return conversationText(record);
}

function chineseCharacterCount(text) {
  const matches = text.match(/[\u4e00-\u9fff]/g);
  return matches?.length ?? 0;
}

export function isUsableReferenceText(text) {
  if (typeof text !== "string") {
    return false;
  }

  const normalized = normalizeText(text);

  if (normalized.length < 24 || normalized.length > 240) {
    return false;
  }

  if (chineseCharacterCount(normalized) < 8) {
    return false;
  }

  if (
    /translate|assistant|system prompt|as an ai|以下是|当然可以|Certainly|Sure, here's|用户[:：]|助手[:：]/i.test(
      normalized,
    )
  ) {
    return false;
  }

  return true;
}

function scoreByKeywords(text, keywords) {
  return keywords.reduce(
    (total, keyword) => (text.includes(keyword) ? total + 1 : total),
    0,
  );
}

export function inferPersonaIdFromText(text, options = {}) {
  const normalized = normalizeText(text);
  const scores = {
    "experience-sharer": scoreByKeywords(normalized, [
      "我",
      "我家",
      "我表姐",
      "我们部门",
      "那会儿",
      "每天",
      "凌晨",
      "下班",
      "回家",
      "孩子",
      "房租",
      "通勤",
      "发烧",
      "起床",
    ]),
    "fact-checker": scoreByKeywords(normalized, [
      "证据",
      "数据",
      "截图",
      "原文",
      "来源",
      "链接",
      "时间线",
      "核实",
      "记录",
      "细节",
      "不是事实",
      "先对齐",
    ]),
    "group-spokesperson": scoreByKeywords(normalized, [
      "你们这类人",
      "一整类",
      "群体",
      "整批",
      "所有男人",
      "所有女人",
      "年轻人都",
      "父母都",
      "打工人都",
      "代表",
      "某一类人",
      "一群人",
    ]),
    "trend-carrier": scoreByKeywords(normalized, [
      "刷屏",
      "复读",
      "热搜",
      "标题",
      "转发",
      "截图",
      "满楼",
      "口号",
      "一句话",
      "谁说得越短",
      "最容易扩开",
      "挂标题",
    ]),
    cynic: scoreByKeywords(normalized, [
      "最省事",
      "反正",
      "默认",
      "体面",
      "流量",
      "制度",
      "评论区",
      "没人",
      "这套动作",
      "这样最方便",
      "老词",
    ]),
    "moral-judge": scoreByKeywords(normalized, [
      "应该",
      "别",
      "先",
      "底线",
      "该不该",
      "边界",
      "别把",
      "先谈",
      "不该",
    ]),
  };

  if (sourceFamily(options.sourceId) === "zhihu") {
    scores["experience-sharer"] += scoreByKeywords(normalized, [
      "很多人",
      "真实处境",
      "有两年",
      "凌晨三点",
      "继续开会",
      "没人帮",
      "分担",
      "我生完孩子以后",
    ]);
    scores["moral-judge"] += scoreByKeywords(normalized, [
      "不能",
      "责任",
      "轻易地说",
      "不应该",
      "先把",
    ]);
  }

  if (sourceFamily(options.sourceId) === "tieba") {
    scores["group-spokesperson"] += scoreByKeywords(normalized, [
      "吧里",
      "一群人",
      "这种人",
      "你们这些",
    ]);
    scores["cynic"] += scoreByKeywords(normalized, [
      "老哥",
      "楼里",
      "带节奏",
      "省事",
    ]);
  }

  const ranked = Object.entries(scores).sort((left, right) => right[1] - left[1]);
  return (ranked[0]?.[1] ?? 0) > 0 ? ranked[0][0] : "cynic";
}

export function inferDominantActionFromText(text, options = {}) {
  const normalized = normalizeText(text);
  const scores = {
    "amplify-conflict": scoreByKeywords(normalized, [
      "阵营",
      "站队",
      "你们这类人",
      "对面",
      "敌我",
      "互相审判",
      "分边",
      "哪边",
      "审判",
    ]),
    "reward-spectacle": scoreByKeywords(normalized, [
      "刷屏",
      "复读",
      "标题",
      "热搜",
      "截图",
      "围观",
      "抓马",
      "高潮",
      "热闹",
      "出圈",
      "挂标题",
      "满楼",
    ]),
    "amplify-emotion": scoreByKeywords(normalized, [
      "火气",
      "上头",
      "拍桌子",
      "炸",
      "委屈",
      "怒",
      "发火",
      "情绪",
    ]),
    "suppress-context": scoreByKeywords(normalized, [
      "上下文",
      "前后因果",
      "背景",
      "细节",
      "解释十句",
      "截出来",
      "一句截",
      "来龙去脉",
    ]),
  };

  if (sourceFamily(options.sourceId) === "zhihu") {
    scores.baseline = scoreByKeywords(normalized, [
      "很多人",
      "真实处境",
      "真正落到现实里",
      "不是一句",
      "根本没有那么轻飘",
    ]);
  }

  const ranked = Object.entries(scores).sort((left, right) => right[1] - left[1]);
  return (ranked[0]?.[1] ?? 0) > 0 ? ranked[0][0] : "baseline";
}

function inferIntensity(text) {
  const normalized = normalizeText(text);
  let intensity = 2;

  if (/[！!？?]/.test(normalized)) {
    intensity += 1;
  }

  if (/(最|根本|永远|一定|全都|谁还|根本不是)/.test(normalized)) {
    intensity += 1;
  }

  return Math.min(intensity, 5);
}

function inferFeaturedTopicIds(text, record) {
  const hint = normalizeText(
    [text, typeof record?.INSTRUCTION === "string" ? record.INSTRUCTION : ""].join(" "),
  );
  const featuredTopicIds = [];

  if (/(孩子|母爱|冲奶粉|育儿|家庭|牺牲个人发展)/.test(hint)) {
    featuredTopicIds.push("family-sacrifice");
  }

  if (/(加班|工作压力|下班|开会|公司|老板|扛扛)/.test(hint)) {
    featuredTopicIds.push("overtime-morality");
  }

  if (/(立场|表态|免责声明|姿态|先说满)/.test(hint)) {
    featuredTopicIds.push("stance-preamble");
  }

  return featuredTopicIds;
}

function inferTopicTags(text, record) {
  const hint = normalizeText(
    [text, typeof record?.INSTRUCTION === "string" ? record.INSTRUCTION : ""].join(" "),
  );
  const tags = new Set();

  if (/(孩子|母爱|育儿|家庭)/.test(hint)) {
    tags.add("家庭");
  }

  if (/(加班|工作|公司|老板|开会)/.test(hint)) {
    tags.add("工作");
  }

  if (/(立场|表态|姿态|免责声明)/.test(hint)) {
    tags.add("立场");
  }

  if (/(复读|刷屏|标题|热搜|转发)/.test(hint)) {
    tags.add("传播");
  }

  if (/(阵营|站队|敌我|审判)/.test(hint)) {
    tags.add("对立");
  }

  if (/(背景|细节|上下文|来龙去脉)/.test(hint)) {
    tags.add("背景");
  }

  return [...tags];
}

export function mapReferenceRecordToPersonaExample({ record, sourceId, index }) {
  const text = extractReferenceText(record, { sourceId });

  if (!text || !isUsableReferenceText(text)) {
    return null;
  }

  return {
    id: `${sourceId}-import-${String(index).padStart(4, "0")}`,
    sourceId,
    personaId: inferPersonaIdFromText(text, { sourceId }),
    dominantAction: inferDominantActionFromText(text, { sourceId }),
    featuredTopicIds: inferFeaturedTopicIds(text, record),
    topicTags: inferTopicTags(text, record),
    intensity: inferIntensity(text),
    text,
  };
}
