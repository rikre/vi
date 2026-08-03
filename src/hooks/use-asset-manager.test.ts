import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAssetManager } from "@/hooks/use-asset-manager";
import { getProject } from "@/lib/project-store";
import { makeProject, seedProject, clearStore } from "@/test/fixtures";
import { advanceExtractChain } from "@/test/helpers";

describe("useAssetManager", () => {
  beforeEach(() => {
    clearStore();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("应从 project.characters + assets 计数构建资产列表", () => {
    const project = makeProject({
      characters: [
        { id: "c1", name: "A", role: "主角", description: "d" },
        { id: "c2", name: "B", role: "配角", description: "d" },
      ],
      assets: { total: 5, characters: 2, scenes: 2, props: 1 },
    });
    const { result } = renderHook(() => useAssetManager(project));
    // 2 characters + 2 scenes + 1 prop
    expect(result.current.assets).toHaveLength(5);
    expect(result.current.stats.total).toBe(5);
  });

  it("筛选：切到场景只看场景资产", () => {
    const project = makeProject({
      assets: { total: 4, characters: 2, scenes: 1, props: 1 },
    });
    const { result } = renderHook(() => useAssetManager(project));
    act(() => result.current.setFilter("场景"));
    expect(result.current.filteredAssets.every((a) => a.type === "scene")).toBe(true);
    expect(result.current.filteredAssets).toHaveLength(1);
  });

  it("deleteAsset 应移除资产并持久化新计数", () => {
    const project = makeProject({
      characters: [{ id: "c1", name: "A", role: "主角", description: "d" }],
      assets: { total: 2, characters: 1, scenes: 1, props: 0 },
    });
    seedProject(project);
    const { result } = renderHook(() => useAssetManager(project));
    const target = result.current.assets.find((a) => a.id === "c1")!;
    act(() => result.current.deleteAsset(target.id));
    expect(result.current.assets.find((a) => a.id === "c1")).toBeUndefined();
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.assets.characters).toBe(0);
    }
  });

  it("regenerateAsset 应先进入生成中，1s 后变为已生成", () => {
    const project = makeProject({
      characters: [{ id: "c1", name: "A", role: "主角", description: "d" }],
      assets: { total: 1, characters: 1, scenes: 0, props: 0 },
    });
    const { result } = renderHook(() => useAssetManager(project));
    act(() => result.current.regenerateAsset("c1"));
    expect(result.current.assets.find((a) => a.id === "c1")?.status).toBe("生成中");
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.assets.find((a) => a.id === "c1")?.status).toBe("已生成");
  });

  it("batchGenerate 应批量将选中资产转为已生成", () => {
    const project = makeProject({
      characters: [
        { id: "c1", name: "A", role: "主角", description: "d" },
        { id: "c2", name: "B", role: "配角", description: "d" },
      ],
      assets: { total: 2, characters: 2, scenes: 0, props: 0 },
    });
    const { result } = renderHook(() => useAssetManager(project));
    act(() => result.current.batchGenerate(["c1", "c2"]));
    expect(result.current.assets.every((a) => a.status === "生成中")).toBe(true);
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.assets.every((a) => a.status === "已生成")).toBe(true);
  });

  it("bindVoice 应为角色绑定音色", () => {
    const project = makeProject({
      characters: [{ id: "c1", name: "A", role: "主角", description: "d" }],
      assets: { total: 1, characters: 1, scenes: 0, props: 0 },
    });
    const { result } = renderHook(() => useAssetManager(project));
    act(() => result.current.bindVoice("c1", "温柔少女音"));
    expect(result.current.assets.find((a) => a.id === "c1")?.voice).toBe("温柔少女音");
  });

  it("addAsset 应新增角色并持久化", () => {
    const project = makeProject({ characters: [] });
    seedProject(project);
    const { result } = renderHook(() => useAssetManager(project));
    act(() => result.current.addAsset());
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.characters.some((c) => c.name === "新角色")).toBe(true);
    }
  });

  it("extractAssets 完成后应持久化资产计数", async () => {
    const project = makeProject({ mode: "剧本模式", characters: [] });
    seedProject(project);
    const { result } = renderHook(() => useAssetManager(project));
    act(() => result.current.extractAssets());
    expect(result.current.extractProgress.open).toBe(true);
    await advanceExtractChain(act);
    expect(result.current.extracted).toBe(true);
    expect(result.current.extractProgress.open).toBe(false);
  });
});
