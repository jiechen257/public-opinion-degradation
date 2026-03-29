import snapshot from "./roundtable-corpus.generated.json";

describe("圆桌语料覆盖度", () => {
  it("覆盖多个来源并且总量足够支撑角色抽样", () => {
    expect(snapshot.personaExamples.length).toBeGreaterThanOrEqual(70);

    const sourceIds = new Set(snapshot.personaExamples.map((item) => item.sourceId));
    expect(sourceIds.has("local-curated-seed-2026-03-29")).toBe(true);
    expect(sourceIds.has("reference-robert-llm-data")).toBe(true);
    expect(sourceIds.has("reference-zhihu-kol")).toBe(true);
    expect(sourceIds.has("reference-baidu-tieba-sunxiaochuan")).toBe(true);
  });

  it("六种角色都已经有可用语料", () => {
    const counts = Object.groupBy(snapshot.personaExamples, (item) => item.personaId);

    expect((counts["moral-judge"] ?? []).length).toBeGreaterThanOrEqual(8);
    expect((counts["experience-sharer"] ?? []).length).toBeGreaterThanOrEqual(8);
    expect((counts["cynic"] ?? []).length).toBeGreaterThanOrEqual(8);
    expect((counts["trend-carrier"] ?? []).length).toBeGreaterThanOrEqual(8);
    expect((counts["fact-checker"] ?? []).length).toBeGreaterThanOrEqual(4);
    expect((counts["group-spokesperson"] ?? []).length).toBeGreaterThanOrEqual(4);
  });
});
