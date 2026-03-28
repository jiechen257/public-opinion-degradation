import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import {
  createExperimentRecord,
  defaultFeaturedTopicId,
  defaultPersonaIds,
} from "./experiment-engine";

describe("结果页主结构", () => {
  it("先给结论，再展开证据时间线", async () => {
    const reportModule = await import("./experiment-report").catch(() => null);
    const dataModule = await import("./mock-experiments").catch(() => null);

    expect(reportModule).not.toBeNull();
    expect(dataModule).not.toBeNull();

    if (!reportModule || !dataModule) {
      return;
    }

    const { ExperimentReport } = reportModule;
    const { mockExperiments } = dataModule;

    render(<ExperimentReport experiment={mockExperiments.demo} />);

    const orderedHeadings = [
      screen.getByRole("heading", { name: "双世界差异摘要" }),
      screen.getByRole("heading", { name: "关键拐点" }),
      screen.getByRole("heading", { name: "反事实救援" }),
      screen.getByRole("heading", { name: "完整时间线证据" }),
    ];

    for (const [currentIndex, heading] of orderedHeadings.entries()) {
      const nextHeading = orderedHeadings[currentIndex + 1];

      if (!nextHeading) {
        break;
      }

      expect(
        heading.compareDocumentPosition(nextHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }

    expect(screen.getAllByText("世界 A / 迟缓世界").length).toBeGreaterThan(0);
    expect(screen.getAllByText("世界 B / 热度世界").length).toBeGreaterThan(0);
  });

  it("点击拐点和救援后会在原位展开解释", async () => {
    vi.useFakeTimers();

    const reportModule = await import("./experiment-report").catch(() => null);

    expect(reportModule).not.toBeNull();

    if (!reportModule) {
      return;
    }

    const { ExperimentReport } = reportModule;
    const experiment = createExperimentRecord({
      featuredTopicId: defaultFeaturedTopicId,
      topic: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
      rewardMode: "on",
      personaIds: defaultPersonaIds,
    });

    render(<ExperimentReport experiment={experiment} />);

    fireEvent.click(screen.getByRole("button", { name: "查看关键拐点证据" }));

    expect(screen.getByText(experiment.turningPoint.whyItMatters)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "推演反事实救援" }));

    expect(
      screen.getByText("正在模拟如果当时改掉这个条件"),
    ).toBeInTheDocument();

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(screen.getByText(experiment.rescue.verdict)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
