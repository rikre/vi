import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScriptEditor } from "@/hooks/use-script-editor";
import { getProject } from "@/lib/project-store";
import { makeProject, seedProject, clearStore } from "@/test/fixtures";
import { advanceExtractChain } from "@/test/helpers";

describe("useScriptEditor", () => {
  beforeEach(() => {
    clearStore();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("无 scriptChapters 时应从 scriptContent 派生单章", () => {
    const project = makeProject({ scriptContent: "剧本正文", scriptChapters: undefined });
    const { result } = renderHook(() => useScriptEditor(project));
    expect(result.current.chapters).toHaveLength(1);
    expect(result.current.chapters[0].content).toBe("剧本正文");
  });

  it("isAnalyzingScript 应在 1.1s 后自动关闭", () => {
    const project = makeProject();
    const { result } = renderHook(() => useScriptEditor(project));
    expect(result.current.isAnalyzingScript).toBe(true);
    act(() => vi.advanceTimersByTime(1100));
    expect(result.current.isAnalyzingScript).toBe(false);
  });

  it("addChapter 应追加章节并切换激活项", () => {
    const project = makeProject();
    seedProject(project);
    const { result } = renderHook(() => useScriptEditor(project));
    const before = result.current.chapters.length;
    act(() => result.current.addChapter());
    expect(result.current.chapters).toHaveLength(before + 1);
    const last = result.current.chapters[result.current.chapters.length - 1];
    expect(result.current.activeChapterId).toBe(last.id);
  });

  it("updateChapter 应持久化章节内容", () => {
    const project = makeProject({
      scriptChapters: [{ id: "ch1", title: "第1章", content: "旧" }],
    });
    seedProject(project);
    const { result } = renderHook(() => useScriptEditor(project));
    act(() => result.current.updateChapter("ch1", "新内容"));
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.scriptChapters?.[0].content).toBe("新内容");
    }
  });

  it("extractAssets 应分阶段推进进度并最终写入资产", async () => {
    const project = makeProject({
      scriptChapters: [
        { id: "ch1", title: "第1章", content: "a" },
        { id: "ch2", title: "第2章", content: "b" },
      ],
    });
    seedProject(project);
    const { result } = renderHook(() => useScriptEditor(project));

    act(() => result.current.extractAssets());
    expect(result.current.isExtracting).toBe(true);
    expect(result.current.extractProgress).toBe(0);

    act(() => vi.advanceTimersByTime(500));
    expect(result.current.extractProgress).toBe(1);
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.extractProgress).toBe(2);
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.extractProgress).toBe(3);
    expect(result.current.isExtracting).toBe(false);

    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.characters).toHaveLength(2);
      // scenes = chapters.length(2), props = 2, characters = 2 → total 6
      expect(stored.assets).toEqual({
        total: 6,
        characters: 2,
        scenes: 2,
        props: 2,
      });
    }
  });
});
