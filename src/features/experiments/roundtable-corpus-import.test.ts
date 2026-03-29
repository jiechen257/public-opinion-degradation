import {
  extractReferenceText,
  inferDominantActionFromText,
  inferPersonaIdFromText,
  isUsableReferenceText,
  mapReferenceRecordToPersonaExample,
} from "./roundtable-corpus-import.mjs";

describe("公开语料导入映射", () => {
  it("能从常见 JSONL 结构里抽出可用文本", () => {
    expect(
      extractReferenceText({
        output:
          "我刚工作那会儿连着三周凌晨一点回家，第二天九点半还要开会，这种压力根本不是一句矫情能带过的。",
      }),
    ).toContain("三周凌晨一点回家");

    expect(
      extractReferenceText({
        conversations: [
          { from: "human", value: "你怎么看加班" },
          {
            from: "assistant",
            value:
              "这种题里最容易刷屏的就是“年轻人太脆了”这类话，谁说得短谁就会被复读。",
          },
        ],
      }),
    ).toContain("谁说得短谁就会被复读");
  });

  it("会过滤太短或明显不是评论现场的文本", () => {
    expect(isUsableReferenceText("好")).toBe(false);
    expect(isUsableReferenceText("Translate the following sentence into English.")).toBe(false);
    expect(
      isUsableReferenceText(
        "我表姐生完孩子那两年每天四点半起床挤奶，晚上还要改方案到十一点，这种事你很难说是谁自愿牺牲。",
      ),
    ).toBe(true);
  });

  it("能把文本映射到圆桌角色和平台动作", () => {
    expect(
      inferPersonaIdFromText(
        "我表姐生完孩子那两年每天四点半起床挤奶，晚上还要改方案到十一点，这种事不是一句母爱伟大就能概括的。",
      ),
    ).toBe("experience-sharer");

    expect(
      inferPersonaIdFromText(
        "这种题里最容易刷屏的就是“孩子又没逼你生”这类话，谁说得越短越狠，越容易满楼复读。",
      ),
    ).toBe("trend-carrier");

    expect(
      inferDominantActionFromText(
        "这种题里最容易刷屏的就是“孩子又没逼你生”这类话，谁说得越短越狠，越容易满楼复读。",
      ),
    ).toBe("reward-spectacle");
  });

  it("会把参考记录映射成可入库的角色样本", () => {
    const example = mapReferenceRecordToPersonaExample({
      record: {
        output:
          "你先把人按阵营分好，后面谁还会管最开始的问题是什么，反正大家只剩互相审判。",
      },
      sourceId: "reference-robert-llm-data",
      index: 7,
    });

    expect(example).toMatchObject({
      sourceId: "reference-robert-llm-data",
      personaId: "cynic",
      dominantAction: "amplify-conflict",
    });
    expect(example?.text).toContain("互相审判");
  });

  it("能处理知乎风格记录并走知乎专用映射", () => {
    const text = extractReferenceText({
      INSTRUCTION: "该不该为了孩子牺牲个人发展？",
      RESPONSE:
        "我生完孩子以后有两年几乎没在晚上十一点前睡过，白天上班，回家接着哄睡和改方案。很多人把这叫母爱伟大，但真实处境常常只是没人帮你分担。",
      SOURCE: "zhihu",
    });

    expect(text).toContain("晚上十一点前睡过");
    expect(
      inferPersonaIdFromText(text ?? "", {
        sourceId: "reference-zhihu-kol",
      }),
    ).toBe("experience-sharer");

    const example = mapReferenceRecordToPersonaExample({
      record: {
        INSTRUCTION: "该不该为了孩子牺牲个人发展？",
        RESPONSE:
          "很多人会很轻易地说父母本来就该牺牲，可真正落到现实里，是有人在凌晨三点冲奶粉、第二天九点继续开会，根本没有那么轻飘。",
      },
      sourceId: "reference-zhihu-kol",
      index: 3,
    });

    expect(example).toMatchObject({
      sourceId: "reference-zhihu-kol",
      personaId: "experience-sharer",
      dominantAction: "baseline",
    });
  });
});
