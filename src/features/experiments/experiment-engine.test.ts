import {
  advanceExperimentSession,
  createExperimentSession,
  defaultFeaturedTopicId,
  defaultPersonaIds,
  platformActions,
  resolveExperimentState,
  type PlatformActionId,
} from "./experiment-engine";

describe("实验引擎", () => {
  it("创建圆桌会话时先给出第 1 轮现场，而不是完整报告", () => {
    const session = createExperimentSession({
      featuredTopicId: defaultFeaturedTopicId,
      topic: "年轻人抱怨工作压力是不是矫情？",
      personaIds: defaultPersonaIds,
    });

    expect(session.currentRound).toBe(1);
    expect(session.rounds).toHaveLength(1);
    expect(session.rounds[0].phase).toBe("正常讨论");
    expect(session.rounds[0].comments).toHaveLength(4);
    expect(session.metrics.emotion).toBeGreaterThan(0);
    expect(session.actionIds).toEqual([]);
  });

  it("角色发言应像帖子现场说话，而不是旁白分析", () => {
    const session = createExperimentSession({
      featuredTopicId: defaultFeaturedTopicId,
      topic: "该不该为了孩子牺牲个人发展？",
      personaIds: defaultPersonaIds,
    });

    const firstComment = session.rounds[0]?.comments[0]?.text ?? "";

    expect(firstComment).not.toContain("平台");
    expect(firstComment).not.toContain("问题还在桌上");
    expect(firstComment).not.toContain("现场");
    expect(firstComment).not.toContain("讨论");
    expect(firstComment).toMatch(/[你我他她这不就本来就是凭什么谁]/);
  });

  it("每次平台动作都会推进一轮，并在第 6 次后生成结案记录", () => {
    let session = createExperimentSession({
      featuredTopicId: defaultFeaturedTopicId,
      topic: "该不该为了孩子牺牲个人发展？",
      personaIds: defaultPersonaIds,
    });

    const actions: PlatformActionId[] = [
      "amplify-conflict",
      "suppress-context",
      "amplify-conflict",
      "amplify-emotion",
      "amplify-conflict",
      "amplify-conflict",
    ];

    for (const actionId of actions.slice(0, -1)) {
      const result = advanceExperimentSession(session, actionId);

      expect(result.kind).toBe("in_progress");
      if (result.kind !== "in_progress") {
        return;
      }

      session = result.session;
    }

    const completed = advanceExperimentSession(session, actions.at(-1)!);

    expect(completed.kind).toBe("completed");
    if (completed.kind !== "completed") {
      return;
    }

    expect(completed.record.rounds).toHaveLength(6);
    expect(completed.record.actionIds).toEqual(actions);
    expect(completed.record.metricsHistory).toHaveLength(7);
    expect(completed.record.outcome.title).toContain("站队");
    expect(completed.record.promotedPatterns.length).toBeGreaterThan(0);
    expect(completed.record.displacedPatterns.length).toBeGreaterThan(0);
    expect(
      completed.record.metricsHistory.at(-1)?.conflict,
    ).toBeGreaterThan(completed.record.metricsHistory[0].conflict);
  });

  it("能解析合法记录，并在结构损坏时返回 invalid", () => {
    const seedActions = platformActions.map((action) => action.id);
    let session = createExperimentSession({
      featuredTopicId: defaultFeaturedTopicId,
      topic: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
      personaIds: defaultPersonaIds,
    });

    for (const actionId of seedActions.slice(0, 3)) {
      const result = advanceExperimentSession(session, actionId);
      if (result.kind !== "in_progress") {
        return;
      }
      session = result.session;
    }

    let completed = advanceExperimentSession(session, "reward-spectacle");
    if (completed.kind !== "in_progress") {
      return;
    }

    completed = advanceExperimentSession(completed.session, "suppress-context");
    if (completed.kind !== "in_progress") {
      return;
    }

    const final = advanceExperimentSession(completed.session, "amplify-conflict");

    expect(final.kind).toBe("completed");
    if (final.kind !== "completed") {
      return;
    }

    const success = resolveExperimentState(final.record);
    expect(success.kind).toBe("success");

    const invalid = resolveExperimentState({
      ...final.record,
      rounds: [{ round: 1, comments: [] }],
    });
    expect(invalid.kind).toBe("invalid");
  });
});
