import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ToolsStudio } from "./tools-studio";

async function selectMode(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole("button", { name: "创作模式" }));
  await user.click(screen.getByRole("menuitemradio", { name: label }));
}

describe("ToolsStudio", () => {
  it("renders the extracted empty state and default video controls", async () => {
    const user = userEvent.setup();
    render(<ToolsStudio />);

    expect(screen.getByRole("heading", { name: "暂时没有内容" })).toBeInTheDocument();
    expect(screen.getByText("在下方工具模块中开始创作")).toBeInTheDocument();
    expect(screen.getByLabelText("提示词")).toHaveAttribute("maxlength", "8000");
    expect(screen.getByText("0/8000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "视频模型" })).toHaveTextContent("Seedance 2.0 多参（特惠版）");
    expect(screen.getByRole("button", { name: "生成规格" })).toHaveTextContent("9:16 | 720p | 5s");
    expect(screen.getByRole("button", { name: "42" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "视频模型" }));
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(6);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "视频模型" })).toHaveFocus();
  });

  it("switches all five creation modes and validates required inputs", async () => {
    const user = userEvent.setup();
    render(<ToolsStudio />);

    await selectMode(user, "图片生成");
    expect(screen.getByPlaceholderText("在此描述图片内容，包括主体、场景和风格等；上方可添加参考图片。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "优化提示词" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "图片模型" })).toHaveTextContent("模型 (1)");
    expect(screen.getByRole("button", { name: "生成规格" })).toHaveTextContent("9:16 | 2K");

    await selectMode(user, "音乐生成");
    expect(screen.getByPlaceholderText("在此描述音乐内容，包括风格、情绪和节奏等。")).toBeInTheDocument();
    expect(screen.queryByLabelText("上传图片")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();

    await selectMode(user, "去字幕");
    expect(screen.queryByLabelText("提示词")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "0.5 积分/秒" }));
    expect(screen.getByRole("alert")).toHaveTextContent("请先上传需要处理的视频");

    await selectMode(user, "视频超分");
    expect(screen.getByRole("button", { name: "超分模型" })).toHaveTextContent("腾讯 720P 超分");
    expect(screen.getByRole("button", { name: "1 积分/秒" })).toBeInTheDocument();

    await selectMode(user, "多参视频生成");
    expect(screen.getByRole("button", { name: "视频模型" })).toBeInTheDocument();
  });

  it("creates local records and applies search, date, user, and type filters", async () => {
    const user = userEvent.setup();
    render(<ToolsStudio />);

    await user.type(screen.getByLabelText("提示词"), "雨夜追逐");
    await user.type(screen.getByLabelText("历史标签"), "夜戏");
    await user.click(screen.getByRole("button", { name: "42" }));
    expect(screen.getByRole("heading", { name: "雨夜追逐" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("不会消耗积分");

    const search = screen.getByPlaceholderText("搜索标题、提示词或标签");
    await user.type(search, "不存在的内容");
    expect(screen.getByRole("heading", { name: "暂时没有内容" })).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "夜戏");
    expect(screen.getByRole("heading", { name: "雨夜追逐" })).toBeInTheDocument();
    await user.clear(search);

    const date = screen.getByLabelText("按日期筛选");
    fireEvent.change(date, { target: { value: "2000-01-01" } });
    expect(screen.getByRole("heading", { name: "暂时没有内容" })).toBeInTheDocument();
    fireEvent.change(date, { target: { value: "" } });

    await user.click(screen.getByRole("button", { name: "按用户筛选" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Phone User 7767" }));
    expect(screen.getByRole("heading", { name: "雨夜追逐" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "按类型筛选" }));
    await user.click(screen.getByRole("menuitemradio", { name: "图片" }));
    expect(screen.getByRole("heading", { name: "暂时没有内容" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "按类型筛选" }));
    await user.click(screen.getByRole("menuitemradio", { name: "全部" }));
    expect(screen.getByRole("heading", { name: "雨夜追逐" })).toBeInTheDocument();
  });

  it("filters assets, then adds, previews, and deletes a reference item", async () => {
    const user = userEvent.setup();
    render(<ToolsStudio />);

    await user.click(screen.getByRole("button", { name: "打开素材库" }));
    const library = screen.getByRole("dialog", { name: "素材库" });
    await user.click(within(library).getByRole("button", { name: "场景" }));
    await user.type(within(library).getByPlaceholderText("搜索素材..."), "园林");
    expect(within(library).getByRole("button", { name: /园林厅堂/ })).toBeInTheDocument();
    expect(within(library).queryByRole("button", { name: /沈青瓷/ })).not.toBeInTheDocument();
    await user.click(within(library).getByRole("button", { name: /园林厅堂/ }));
    expect(within(library).getByText("已添加")).toBeInTheDocument();
    await user.click(within(library).getByRole("button", { name: "关闭" }));

    await user.click(screen.getByRole("button", { name: "预览图片" }));
    expect(screen.getByRole("dialog", { name: "园林厅堂" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "园林厅堂" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "预览图片" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "删除 园林厅堂" }));
    expect(screen.queryByRole("button", { name: "预览图片" })).not.toBeInTheDocument();
  });
});
