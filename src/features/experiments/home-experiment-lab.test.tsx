import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { HomeExperimentLab } from "./home-experiment-lab";

describe("首页圆桌操盘", () => {
  it("开始后进入圆桌现场，并在选择平台动作后推进到下一轮", () => {
    render(<HomeExperimentLab onOpenExperiment={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "开始操盘这张圆桌" }));

    expect(screen.getByText("第 1 轮")).toBeInTheDocument();
    expect(screen.getAllByText("正常讨论").length).toBeGreaterThan(0);
    expect(screen.getByTestId("roundtable-stage")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "放大对立" }));

    expect(screen.getByText("第 2 轮")).toBeInTheDocument();
    expect(
      screen.getByText("平台本轮奖励了更快完成敌我归类的发言。"),
    ).toBeInTheDocument();
  });

  it("完成 6 轮后进入结果页", () => {
    const onOpenExperiment = vi.fn();

    render(<HomeExperimentLab onOpenExperiment={onOpenExperiment} />);

    fireEvent.click(screen.getByRole("button", { name: "开始操盘这张圆桌" }));

    const actions = [
      "放大对立",
      "压低细节",
      "放大对立",
      "推高情绪",
      "放大对立",
      "放大对立",
    ];

    for (const label of actions) {
      fireEvent.click(screen.getByRole("button", { name: label }));
    }

    expect(onOpenExperiment).toHaveBeenCalledTimes(1);
    expect(onOpenExperiment.mock.calls[0]?.[0]).toMatch(/^stance-preamble-/);
  });
});
