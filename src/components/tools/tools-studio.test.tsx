import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ToolsStudio } from "./tools-studio";

async function selectMode(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole("button", { name: "创作模式" }));
  await user.click(screen.getByRole("menuitemradio", { name: label }));
}

describe("ToolsStudio", () => {
  it("renders seeded records of different types and default video controls", async () => {
    const user = userEvent.setup();
    render(<ToolsStudio />);

    expect(screen.getByRole("button", { name: "查看 上海弄堂喜剧｜第 1 段" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看 园林厅堂 · 清晨薄雾" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看 弄堂环境音" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "文档" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("提示词")).toHaveAttribute("maxlength", "8000");
    expect(screen.getByText("0/8000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "视频模型" })).toHaveTextContent("Seedance 2.0 特惠");
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

  it("creates local records and applies search, media, time, and model filters", async () => {
    const user = userEvent.setup();
    render(<ToolsStudio />);

    await user.type(screen.getByLabelText("提示词"), "雨夜追逐");
    await user.click(screen.getByRole("button", { name: "42" }));
    expect(screen.getByRole("button", { name: "查看 雨夜追逐" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("不会消耗积分");

    const search = screen.getByPlaceholderText("搜索");
    await user.type(search, "不存在的内容");
    expect(screen.getByRole("heading", { name: "暂时没有内容" })).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "雨夜");
    expect(screen.getByRole("button", { name: "查看 雨夜追逐" })).toBeInTheDocument();
    await user.clear(search);

    await user.click(screen.getByRole("tab", { name: "图片" }));
    expect(screen.queryByRole("button", { name: "查看 雨夜追逐" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看 园林厅堂 · 清晨薄雾" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "全部" }));
    expect(screen.getByRole("button", { name: "查看 雨夜追逐" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "按时间筛选" }));
    await user.click(screen.getByRole("menuitemradio", { name: "近 7 天" }));
    expect(screen.getByRole("button", { name: "查看 雨夜追逐" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "按模型来源筛选" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Seedance 2.0 特惠" }));
    expect(screen.getByRole("button", { name: "查看 雨夜追逐" })).toBeInTheDocument();
  });

  it("opens the video detail with only first-phase actions", async () => {
    const user = userEvent.setup();
    render(<ToolsStudio />);

    await user.type(screen.getByLabelText("提示词"), "雨夜追逐");
    await user.click(screen.getByRole("button", { name: "42" }));
    await user.click(screen.getByRole("button", { name: "查看 雨夜追逐" }));

    const dialog = screen.getByRole("dialog", { name: "视频详情" });
    expect(within(dialog).getByRole("button", { name: "视频引用" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "视频超分" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "复制" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "修改" })).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText("加标签")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "去字幕" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "重新编辑" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "图片引用" })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "视频超分" }));
    expect(within(dialog).getByRole("button", { name: "已超分" })).toBeDisabled();

    await user.click(within(dialog).getByRole("button", { name: "关闭详情" }));
    expect(screen.queryByRole("dialog", { name: "视频详情" })).not.toBeInTheDocument();
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
