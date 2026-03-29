import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("首页首屏", () => {
  it("先给出圆桌实验入口，而不是完整报告", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "把一个普通问题一步步推到失控",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "开始操盘这张圆桌" }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("roundtable-home")).toBeInTheDocument();
  });
});
