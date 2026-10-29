import { beforeEach, describe, expect, it } from "vitest";
import { createProject } from "./project-store";
import { shortDramaModeLabel } from "./mock-projects";

describe("项目创建模式契约", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("用户界面统一显示 Agent 模式、人工模式和 AI 重绘", () => {
    expect(shortDramaModeLabel("剧本模式")).toBe("Agent 模式");
    expect(shortDramaModeLabel("自由模式")).toBe("人工模式");
    expect(shortDramaModeLabel("AI重绘")).toBe("AI重绘");
  });

  it("剧本模式保存文件名和文本内容", () => {
    const project = createProject({
      title: "  剧本项目  ",
      description: "",
      mode: "剧本模式",
      sourceFileName: "script.txt",
      scriptContent: "第一集：雨夜重逢",
    });

    expect(project.title).toBe("剧本项目");
    expect(project.mode).toBe("剧本模式");
    expect(project.sourceFileName).toBe("script.txt");
    expect(project.scriptContent).toBe("第一集：雨夜重逢");
    expect(project.episodeList).toHaveLength(3);
  });

  it("自由模式按集数创建未开始的空白剧集", () => {
    const project = createProject({
      title: "自由项目",
      description: "",
      mode: "自由模式",
      plannedEpisodes: 5,
    });

    expect(project.episodes).toBe(5);
    expect(project.plannedEpisodes).toBe(5);
    expect(project.episodeList).toHaveLength(5);
    expect(project.episodeList?.every((episode) => episode.status === "未开始" && episode.progress === 0)).toBe(true);
  });

  it("AI 重绘保存原片文件名并进入三集默认结构", () => {
    const project = createProject({
      title: "重绘项目",
      description: "",
      mode: "AI重绘",
      sourceFileName: "source.mp4",
    });

    expect(project.mode).toBe("AI重绘");
    expect(project.sourceFileName).toBe("source.mp4");
    expect(project.episodeList).toHaveLength(3);
  });

  it("集数统一限制在 1 到 200", () => {
    const minimum = createProject({ title: "最小集数", description: "", mode: "自由模式", plannedEpisodes: 0 });
    const maximum = createProject({ title: "最大集数", description: "", mode: "自由模式", plannedEpisodes: 201 });

    expect(minimum.episodes).toBe(1);
    expect(maximum.episodes).toBe(200);
  });

  it.todo("首页项目名、人工/自动模式和画面比例进入新建页后保持不变");

  it.todo("新建页创建方式与项目管理模式使用明确、统一的映射并完整落库");

  it.todo("风格、影调、剧本/分镜模式和画面比例创建后可回看");

  it.todo("同一项目在 /project/:id 与 /comic/:id 中呈现一致的模式与操作");
});
