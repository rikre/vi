import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStoryboard } from "@/hooks/use-storyboard";
import { getProject } from "@/lib/project-store";
import { makeProject, makeShots, seedProject, clearStore } from "@/test/fixtures";
import { pollShotVideo, submitShotVideo } from "@/lib/generation/client";

vi.mock("@/lib/generation/client", () => ({
  submitShotVideo: vi.fn(),
  pollShotVideo: vi.fn(),
}));

describe("useStoryboard", () => {
  beforeEach(() => {
    clearStore();
    vi.useFakeTimers();
    // 默认：服务端未配置模型（409），生成走演示模拟回退
    vi.mocked(submitShotVideo).mockResolvedValue({ kind: "notConfigured" });
    vi.mocked(pollShotVideo).mockResolvedValue({ kind: "pending" });
  });
  afterEach(() => vi.useRealTimers());

  it("episodeShots 应只返回当前激活集数的镜头", () => {
    const project = makeProject({
      shots: [...makeShots(1), ...makeShots(2).map((s) => ({ ...s, id: `e2-${s.id}` }))],
    });
    const { result } = renderHook(() => useStoryboard(project));
    expect(result.current.activeEpisode).toBe(1);
    expect(result.current.episodeShots.every((s) => s.episode === 1)).toBe(true);
  });

  it("episodeProgress 应按已生成镜头占比计算", () => {
    const project = makeProject({ shots: makeShots(1) }); // s1 已生成, s2 未开始
    const { result } = renderHook(() => useStoryboard(project));
    const ep = result.current.episodes[0];
    expect(result.current.episodeProgress(ep)).toBe(50);
  });

  it("addShot 应在当前集追加分镜并持久化", () => {
    const project = makeProject({ shots: makeShots(1) });
    seedProject(project);
    const { result } = renderHook(() => useStoryboard(project));
    const before = result.current.shots.length;
    act(() => result.current.addShot());
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.shots).toHaveLength(before + 1);
      const added = stored.shots![stored.shots!.length - 1];
      expect(added.index).toBe(3);
      expect(added.status).toBe("未开始");
    }
  });

  it("generateShot 未配置模型时应先进入生成中，1.5s 后模拟回退为已生成", async () => {
    const project = makeProject({ shots: makeShots(1) });
    seedProject(project);
    const { result } = renderHook(() => useStoryboard(project));
    act(() => result.current.generateShot("s2"));
    let stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.shots?.find((s) => s.id === "s2")?.status).toBe("生成中");
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.shots?.find((s) => s.id === "s2")?.status).toBe("已生成");
      expect(stored.shots?.find((s) => s.id === "s2")?.videoUrl).toBeUndefined();
    }
  });

  it("generateShot 真实任务轮询 SUCCEEDED 后应写入已生成与 videoUrl", async () => {
    vi.mocked(submitShotVideo).mockResolvedValue({ kind: "real", taskId: "task-9" });
    vi.mocked(pollShotVideo).mockResolvedValue({
      kind: "succeeded",
      videoUrl: "https://cdn.example/v.mp4",
    });
    const project = makeProject({ shots: makeShots(1) });
    seedProject(project);
    const { result } = renderHook(() => useStoryboard(project));
    act(() => result.current.generateShot("s2"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000);
    });
    const submittedPrompt = vi.mocked(submitShotVideo).mock.calls[0]?.[0].prompt;
    expect(submittedPrompt).toBeTypeOf("string");
    expect(submittedPrompt.length).toBeGreaterThan(0);
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      const shot = stored.shots?.find((s) => s.id === "s2");
      expect(shot?.status).toBe("已生成");
      expect(shot?.videoUrl).toBe("https://cdn.example/v.mp4");
    }
  });

  it("generateShot 真实任务 FAILED 时应标记失败", async () => {
    vi.mocked(submitShotVideo).mockResolvedValue({ kind: "real", taskId: "task-10" });
    vi.mocked(pollShotVideo).mockResolvedValue({ kind: "failed", message: "内容不合规" });
    const project = makeProject({ shots: makeShots(1) });
    seedProject(project);
    const { result } = renderHook(() => useStoryboard(project));
    act(() => result.current.generateShot("s2"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000);
    });
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.shots?.find((s) => s.id === "s2")?.status).toBe("失败");
    }
  });

  it("batchGenerate 未配置模型时应批量模拟生成所有未开始镜头", async () => {
    const project = makeProject({
      shots: [
        { ...makeShots(1)[0] },
        { ...makeShots(1)[1] },
        { ...makeShots(1)[1], id: "s3", index: 3 },
      ],
    });
    seedProject(project);
    const { result } = renderHook(() => useStoryboard(project));
    act(() => result.current.batchGenerate());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.shots?.every((s) => s.status === "已生成")).toBe(true);
    }
  });

  it("batchGenerate 无未开始镜头时不应写库", () => {
    const project = makeProject({
      shots: [{ ...makeShots(1)[0] }], // 全部已生成
    });
    seedProject(project);
    const { result } = renderHook(() => useStoryboard(project));
    act(() => result.current.batchGenerate());
    act(() => vi.advanceTimersByTime(2000));
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.shots?.[0].status).toBe("已生成");
    }
  });

  it("updateDescription 应持久化镜头描述", () => {
    const project = makeProject({ shots: makeShots(1) });
    seedProject(project);
    const { result } = renderHook(() => useStoryboard(project));
    act(() => result.current.updateDescription("s1", "改写描述"));
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.shots?.find((s) => s.id === "s1")?.description).toBe("改写描述");
    }
  });
});
