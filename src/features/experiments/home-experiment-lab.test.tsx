import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import {
  createExperimentRecord,
  defaultFeaturedTopicId,
  defaultPersonaIds,
} from "./experiment-engine";
import { HomeExperimentLab } from "./home-experiment-lab";

describe("首页实验控制", () => {
  it("阻止空问题提交", async () => {
    const onOpenExperiment = vi.fn();

    render(
      <HomeExperimentLab
        createExperiment={vi.fn()}
        onOpenExperiment={onOpenExperiment}
      />,
    );

    fireEvent.change(screen.getByLabelText("样本问题"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "开始观察双世界实验" }));

    expect(await screen.findByText("问题不能为空。")).toBeInTheDocument();
    expect(onOpenExperiment).not.toHaveBeenCalled();
  });

  it("创建实验时展示叙事式等待，再进入结果页", async () => {
    vi.useFakeTimers();

    const record = createExperimentRecord({
      featuredTopicId: defaultFeaturedTopicId,
      topic: "该不该为了不被骂而先把所有立场话说满，再讨论具体问题？",
      rewardMode: "on",
      personaIds: defaultPersonaIds,
    });
    const onOpenExperiment = vi.fn();

    render(
      <HomeExperimentLab
        createExperiment={vi.fn().mockResolvedValue(record)}
        onOpenExperiment={onOpenExperiment}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "开始观察双世界实验" }));

    expect(screen.getByText("正在生成两个世界")).toBeInTheDocument();
    expect(screen.getByText("正在寻找第一句带偏的话")).toBeInTheDocument();
    expect(screen.getByText("正在推演救援分支")).toBeInTheDocument();

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(onOpenExperiment).toHaveBeenCalledWith(record.id);
    vi.useRealTimers();
  });
});
