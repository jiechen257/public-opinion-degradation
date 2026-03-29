import { fireEvent, render, screen } from "@testing-library/react";
import { createExperimentRecord, defaultFeaturedTopicId, defaultPersonaIds } from "./experiment-engine";

describe("结果页结案结构", () => {
  it("按终局判定、路径回放、表达分化、证据回看的顺序渲染", async () => {
    const reportModule = await import("./experiment-report").catch(() => null);

    expect(reportModule).not.toBeNull();

    if (!reportModule) {
      return;
    }

    const { ExperimentReport } = reportModule;
    const experiment = createExperimentRecord({
      featuredTopicId: defaultFeaturedTopicId,
      topic: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
      personaIds: defaultPersonaIds,
      actionIds: [
        "amplify-conflict",
        "suppress-context",
        "amplify-conflict",
        "amplify-emotion",
        "amplify-conflict",
        "amplify-conflict",
      ],
    });

    render(<ExperimentReport experiment={experiment} />);

    const orderedHeadings = [
      screen.getByRole("heading", { name: "终局判定" }),
      screen.getByRole("heading", { name: "失控路径回放" }),
      screen.getByRole("heading", { name: "被奖励的表达 / 被挤掉的表达" }),
      screen.getByRole("heading", { name: "圆桌证据回看" }),
    ];

    for (const [index, heading] of orderedHeadings.entries()) {
      const nextHeading = orderedHeadings[index + 1];

      if (!nextHeading) {
        break;
      }

      expect(
        heading.compareDocumentPosition(nextHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }

    expect(screen.getByText(experiment.outcome.title)).toBeInTheDocument();
    expect(screen.getByText(experiment.promotedPatterns[0])).toBeInTheDocument();
    expect(screen.getByText(experiment.displacedPatterns[0])).toBeInTheDocument();
  });

  it("切换轮次时会在证据区更新对应内容", async () => {
    const reportModule = await import("./experiment-report").catch(() => null);

    expect(reportModule).not.toBeNull();

    if (!reportModule) {
      return;
    }

    const { ExperimentReport } = reportModule;
    const experiment = createExperimentRecord({
      featuredTopicId: defaultFeaturedTopicId,
      topic: "年轻人抱怨工作压力是不是矫情？",
      personaIds: defaultPersonaIds,
      actionIds: [
        "amplify-emotion",
        "reward-spectacle",
        "suppress-context",
        "reward-spectacle",
        "amplify-emotion",
        "reward-spectacle",
      ],
    });

    render(<ExperimentReport experiment={experiment} />);

    fireEvent.click(screen.getByRole("button", { name: "第 4 轮" }));

    expect(
      screen.getAllByText(experiment.rounds[3].selectedActionImpact ?? "").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(experiment.rounds[3].comments[0]?.text ?? ""),
    ).toBeInTheDocument();
  });
});
