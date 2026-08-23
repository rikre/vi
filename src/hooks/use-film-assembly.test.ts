import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilmAssembly } from "@/hooks/use-film-assembly";
import { getProject } from "@/lib/project-store";
import { makeProject, makeShots, seedProject, clearStore } from "@/test/fixtures";

describe("useFilmAssembly", () => {
  beforeEach(() => {
    clearStore();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("setSubtitles 应持久化剧本文本", () => {
    const project = makeProject({ scriptContent: "旧字幕" });
    seedProject(project);
    const { result } = renderHook(() => useFilmAssembly(project));
    expect(result.current.subtitles).toBe("旧字幕");
    act(() => result.current.setSubtitles("新字幕"));
    const stored = getProject(project.id);
    expect(stored?.type).toBe("short");
    if (stored?.type === "short") {
      expect(stored.scriptContent).toBe("新字幕");
    }
  });

  it("exportVideo 应经历 导出中→成功→复位 三阶段", () => {
    const project = makeProject();
    const { result } = renderHook(() => useFilmAssembly(project));
    expect(result.current.isExporting).toBe(false);

    act(() => result.current.exportVideo());
    expect(result.current.isExporting).toBe(true);
    expect(result.current.exportSuccess).toBe(false);

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportSuccess).toBe(true);

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.exportSuccess).toBe(false);
  });

  it("generateShotVideo 应标记生成中并在 1.5s 后完成", () => {
    const project = makeProject({ shots: makeShots(1) });
    seedProject(project);
    const { result } = renderHook(() => useFilmAssembly(project));

    act(() => result.current.generateShotVideo("s2"));
    expect(result.current.generatingShotIds.has("s2")).toBe(true);
    let stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.shots?.find((s) => s.id === "s2")?.status).toBe("生成中");
    }

    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.generatingShotIds.has("s2")).toBe(false);
    stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.shots?.find((s) => s.id === "s2")?.status).toBe("已生成");
    }
  });

  it("downloadVideo 不应抛错（模拟 no-op）", () => {
    const project = makeProject();
    const { result } = renderHook(() => useFilmAssembly(project));
    expect(() => act(() => result.current.downloadVideo())).not.toThrow();
  });
});
