import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { getProjectById, type ShortDramaProject } from "@/lib/mock-projects";
import { formatPlayTime, ImmersivePlayer } from "./immersive-player";

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
  });
});

function fixture(): ShortDramaProject {
  const project = getProjectById(2);
  if (!project || project.type !== "short") throw new Error("缺少测试用短剧项目");
  return project;
}

describe("formatPlayTime", () => {
  it("把秒数格式化为 mm:ss", () => {
    expect(formatPlayTime(0)).toBe("00:00");
    expect(formatPlayTime(65)).toBe("01:05");
    expect(formatPlayTime(Number.NaN)).toBe("00:00");
  });
});

describe("ImmersivePlayer", () => {
  it("渲染标题、集数与演示片源标记", () => {
    const project = fixture();
    render(<ImmersivePlayer project={project} />);

    expect(screen.getByRole("heading", { level: 1, name: project.title })).toBeInTheDocument();
    expect(screen.getByText(/第 1 集/)).toBeInTheDocument();
    expect(screen.getByText("演示片源")).toBeInTheDocument();
  });

  it("分镜存在 videoUrl 时不再标注演示片源", () => {
    const project = fixture();
    const withVideo: ShortDramaProject = {
      ...project,
      shots: project.shots?.map((shot) =>
        shot.episode === 1 && shot.index === 1
          ? { ...shot, videoUrl: "https://example.com/real.mp4" }
          : shot
      ),
    };
    render(<ImmersivePlayer project={withVideo} />);

    expect(screen.queryByText("演示片源")).not.toBeInTheDocument();
  });

  it("选集抽屉可打开并切换到第 2 集", async () => {
    const user = userEvent.setup();
    render(<ImmersivePlayer project={fixture()} />);

    await user.click(screen.getAllByRole("button", { name: "选集" })[0]);
    const dialog = screen.getByRole("dialog", { name: "选集" });
    expect(within(dialog).getByText(/共 3 集/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /第2集/ }));

    expect(screen.queryByRole("dialog", { name: "选集" })).not.toBeInTheDocument();
    expect(screen.getByText(/第 2 集/)).toBeInTheDocument();
  });

  it("底部「下一集」切换到下一集", async () => {
    const user = userEvent.setup();
    render(<ImmersivePlayer project={fixture()} />);

    await user.click(screen.getByRole("button", { name: "下一集" }));

    expect(screen.getByText(/第 2 集/)).toBeInTheDocument();
  });

  it("第一集时「上一集」不可点击", () => {
    render(<ImmersivePlayer project={fixture()} />);

    expect(screen.getByRole("button", { name: "上一集" })).toBeDisabled();
  });
});
