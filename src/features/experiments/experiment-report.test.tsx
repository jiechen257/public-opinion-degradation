import { render, screen } from "@testing-library/react";

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
});
