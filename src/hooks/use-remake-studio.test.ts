import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRemakeStudio } from "@/hooks/use-remake-studio";
import { makeProject, clearStore } from "@/test/fixtures";

describe("useRemakeStudio", () => {
  beforeEach(() => {
    clearStore();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("初始步骤应为「原片」且非最后一步", () => {
    const { result } = renderHook(() => useRemakeStudio(makeProject()));
    expect(result.current.step).toBe("原片");
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.isLastStep).toBe(false);
  });

  it("goNext 应逐步推进到最后一步后停止", () => {
    const { result } = renderHook(() => useRemakeStudio(makeProject()));
    act(() => result.current.goNext());
    expect(result.current.step).toBe("设定");
    act(() => result.current.goNext());
    expect(result.current.step).toBe("分镜");
    act(() => result.current.goNext());
    expect(result.current.step).toBe("视频");
    expect(result.current.isLastStep).toBe(true);
    act(() => result.current.goNext());
    expect(result.current.step).toBe("视频"); // 不再前进
  });

  it("goStep 只允许回到已到达或当前步骤", () => {
    const { result } = renderHook(() => useRemakeStudio(makeProject()));
    act(() => result.current.goStep("分镜")); // 未到达，忽略
    expect(result.current.step).toBe("原片");
    act(() => result.current.goNext());
    act(() => result.current.goStep("原片")); // 回退允许
    expect(result.current.step).toBe("原片");
  });

  it("retryEpisode 应让失败剧集经上传中转为已完成", () => {
    const { result } = renderHook(() => useRemakeStudio(makeProject()));
    act(() => result.current.retryEpisode("ep-1"));
    expect(result.current.episodes.find((e) => e.id === "ep-1")?.status).toBe("上传中");
    act(() => vi.advanceTimersByTime(1200));
    expect(result.current.episodes.find((e) => e.id === "ep-1")?.status).toBe("已完成");
  });

  it("batchGenerateMappings 应将当前分类未完成映射转为已完成", () => {
    const { result } = renderHook(() => useRemakeStudio(makeProject()));
    const pendingBefore = result.current.mappingsInCategory.filter(
      (m) => m.status !== "已完成",
    ).length;
    expect(pendingBefore).toBeGreaterThan(0);
    act(() => result.current.batchGenerateMappings());
    act(() => vi.advanceTimersByTime(1500));
    expect(
      result.current.mappingsInCategory.every((m) => m.status === "已完成"),
    ).toBe(true);
  });

  it("generateShot 应让单个分镜经生成中转为已生成并带预览", () => {
    const { result } = renderHook(() => useRemakeStudio(makeProject()));
    act(() => result.current.generateShot("shot-2"));
    expect(result.current.shots.find((s) => s.id === "shot-2")?.status).toBe("生成中");
    act(() => vi.advanceTimersByTime(1500));
    const shot = result.current.shots.find((s) => s.id === "shot-2");
    expect(shot?.status).toBe("已生成");
    expect(shot?.preview).toBeDefined();
  });

  it("batchGenerateShots 应批量生成所有未开始分镜", () => {
    const { result } = renderHook(() => useRemakeStudio(makeProject()));
    act(() => result.current.batchGenerateShots());
    act(() => vi.advanceTimersByTime(1800));
    expect(result.current.shots.every((s) => s.status === "已生成")).toBe(true);
  });

  it("downloadVideo 应进入下载态 1.5s 后复位", () => {
    const { result } = renderHook(() => useRemakeStudio(makeProject()));
    act(() => result.current.downloadVideo());
    expect(result.current.downloading).toBe(true);
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.downloading).toBe(false);
  });

  it("updateShotPrompt 应更新分镜提示词", () => {
    const { result } = renderHook(() => useRemakeStudio(makeProject()));
    act(() => result.current.updateShotPrompt("shot-1", "新提示词"));
    expect(result.current.shots.find((s) => s.id === "shot-1")?.prompt).toBe("新提示词");
  });
});
