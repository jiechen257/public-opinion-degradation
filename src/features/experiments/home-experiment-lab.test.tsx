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

  it("首页会展示可用数据库和角色语料映射看板", () => {
    render(<HomeExperimentLab onOpenExperiment={vi.fn()} />);

    expect(screen.getByText("语料映射看板")).toBeInTheDocument();
    expect(screen.getByText("Zhihu")).toBeInTheDocument();
    expect(screen.getByText("Weibo")).toBeInTheDocument();
    expect(screen.getAllByText("Baidu Tieba").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "事实纠正者" })).toBeInTheDocument();
  });

  it("切换角色和样本问题后，会更新对应的话术示例", () => {
    render(<HomeExperimentLab onOpenExperiment={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "事实纠正者" }));
    expect(
      screen.getByText(
        "如果一段话前半段全是立场免责声明，后半段只有两句事实，那我更愿意先看后半段。姿态再完整，也不能替代可核实的信息。",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "孩子与个人发展" }));
    fireEvent.click(screen.getByRole("button", { name: "群体代言人" }));

    expect(
      screen.getByText(
        "这类题最容易从个人困境滑成对一整类父母的要求。一个人的家庭分工没谈清，评论区就已经开始替所有母亲或者所有父亲规定该怎么活。",
      ),
    ).toBeInTheDocument();
  });
});
