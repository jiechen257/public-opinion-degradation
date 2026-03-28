import {
  createExperimentRecord,
  defaultFeaturedTopicId,
  defaultPersonaIds,
  resolveExperimentState,
} from "./experiment-engine";

describe("实验引擎", () => {
  it("对同一份配置生成可复现的双世界记录", () => {
    const input = {
      featuredTopicId: defaultFeaturedTopicId,
      topic: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
      rewardMode: "on" as const,
      personaIds: defaultPersonaIds,
    };

    const first = createExperimentRecord(input);
    const second = createExperimentRecord(input);

    expect(first.id).toBe(second.id);
    expect(first.seed).toBe(second.seed);
    expect(first.worlds).toHaveLength(2);
    expect(first.worlds[0].rounds).toHaveLength(10);
    expect(first.worlds[1].rounds).toHaveLength(10);
    expect(first.turningPoint.kind).toBe("ready");
    expect(first.rescue.kind).toBe("ready");
  });

  it("世界数据缺失时降级为部分结果态", () => {
    const record = createExperimentRecord({
      featuredTopicId: defaultFeaturedTopicId,
      topic: "年轻人抱怨工作压力是不是矫情？",
      rewardMode: "off",
      personaIds: defaultPersonaIds,
    });

    const partial = resolveExperimentState({
      ...record,
      worlds: [record.worlds[0]],
    });

    expect(partial.kind).toBe("partial");
    if (partial.kind !== "partial") {
      return;
    }

    expect(partial.availableWorlds).toHaveLength(1);
    expect(partial.message).toContain("无法形成完整对照");
  });
});
