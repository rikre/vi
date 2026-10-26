import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToolsFeedbackDialog } from "./tools-feedback-dialog";

describe("ToolsFeedbackDialog", () => {
  it("submits local feedback with an image filename and shows it in records", async () => {
    const user = userEvent.setup();
    render(<ToolsFeedbackDialog open onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "帮助与反馈" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "意见反馈" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("button", { name: "发送" }));
    expect(screen.getByRole("alert")).toHaveTextContent("请填写反馈主题和详细描述");

    await user.type(screen.getByPlaceholderText("输入主题"), "工具页缺少示例");
    await user.type(screen.getByPlaceholderText("请详细描述你的反馈..."), "希望补充更多可编辑的视频提示词示例。");
    fireEvent.change(screen.getByLabelText("上传图片"), {
      target: { files: [new File(["image"], "shot.png", { type: "image/png" })] },
    });
    expect(screen.getByText("shot.png")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "发送" }));

    expect(screen.getByRole("status")).toHaveTextContent("未发送到服务器");
    expect(screen.getByRole("heading", { name: "工具页缺少示例" })).toBeInTheDocument();
    expect(screen.getByText("附件：shot.png")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("输入主题")).toHaveValue("");
  });

  it("supports tab keyboard navigation and local broadcast content", async () => {
    const user = userEvent.setup();
    render(<ToolsFeedbackDialog open onClose={vi.fn()} />);

    const feedbackTab = screen.getByRole("tab", { name: "意见反馈" });
    feedbackTab.focus();
    await user.keyboard("{ArrowLeft}");
    const broadcastTab = screen.getByRole("tab", { name: "广播消息" });
    expect(broadcastTab).toHaveAttribute("aria-selected", "true");
    expect(broadcastTab).toHaveFocus();
    expect(screen.getByText("这里展示平台广播消息。本地对齐版本不请求网络消息。")).toBeInTheDocument();

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "意见反馈" })).toHaveAttribute("aria-selected", "true");
  });
});
