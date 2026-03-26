import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("首页首屏", () => {
  it("先展示问题主舞台，再展示次级控制区", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "当体面讨论开始奖励情绪表演，问题会先死，还是人先变形？",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "开始观察双世界实验" }),
    ).toBeInTheDocument();

    const heroStage = screen.getByTestId("hero-stage");
    const controlDeck = screen.getByTestId("control-deck");

    expect(
      heroStage.compareDocumentPosition(controlDeck) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
