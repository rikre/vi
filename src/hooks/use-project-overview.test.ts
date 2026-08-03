import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProjectOverview } from "@/hooks/use-project-overview";
import { getProject } from "@/lib/project-store";
import { makeProject, seedProject, clearStore } from "@/test/fixtures";

describe("useProjectOverview", () => {
  beforeEach(() => clearStore());

  it("无 episodeList 时应按 episodes 数量生成占位剧集", () => {
    const project = makeProject({ episodes: 5, episodeList: undefined });
    const { result } = renderHook(() => useProjectOverview(project));
    expect(result.current.episodes).toHaveLength(5);
    expect(result.current.totalEpisodes).toBe(5);
  });

  it("进度计算：已完成集数占比", () => {
    const project = makeProject({
      episodeList: [
        { id: "e1", number: 1, title: "第1集", status: "已完成", progress: 100 },
        { id: "e2", number: 2, title: "第2集", status: "进行中", progress: 50 },
        { id: "e3", number: 3, title: "第3集", status: "未开始", progress: 0 },
        { id: "e4", number: 4, title: "第4集", status: "已完成", progress: 100 },
      ],
    });
    const { result } = renderHook(() => useProjectOverview(project));
    expect(result.current.completedEpisodes).toBe(2);
    expect(result.current.progress).toBe(50);
  });

  it("空剧集列表进度应为 0 而非 NaN", () => {
    const project = makeProject({ episodes: 0, episodeList: [] });
    const { result } = renderHook(() => useProjectOverview(project));
    expect(result.current.progress).toBe(0);
  });

  it("markAllEpisodesDone 应持久化全部完成状态", () => {
    const project = makeProject({ episodes: 3 });
    seedProject(project);
    const { result } = renderHook(() => useProjectOverview(project));
    act(() => result.current.markAllEpisodesDone());
    const stored = getProject(project.id);
    expect(stored?.type).toBe("short");
    if (stored?.type === "short") {
      expect(stored.episodeList?.every((e) => e.progress === 100)).toBe(true);
    }
  });

  it("saveOverview 应更新描述并退出编辑态", () => {
    const project = makeProject();
    seedProject(project);
    const { result } = renderHook(() => useProjectOverview(project));
    act(() => result.current.setIsEditingOverview(true));
    expect(result.current.isEditingOverview).toBe(true);
    act(() => result.current.saveOverview("新概述"));
    expect(result.current.isEditingOverview).toBe(false);
    expect(getProject(project.id)?.description).toBe("新概述");
  });

  it("邀请流程：选择→确认→成员增加且弹窗关闭", () => {
    const project = makeProject({ members: ["常谦"] });
    seedProject(project);
    const { result } = renderHook(() => useProjectOverview(project));
    expect(result.current.inviteCandidates).not.toContain("常谦");
    act(() => result.current.openInvite());
    expect(result.current.inviteOpen).toBe(true);
    const candidate = result.current.inviteCandidates[0];
    act(() => result.current.toggleInviteCandidate(candidate));
    expect(result.current.inviteSelected).toContain(candidate);
    act(() => result.current.confirmInvite());
    expect(result.current.inviteOpen).toBe(false);
    const stored = getProject(project.id);
    if (stored?.type === "short") {
      expect(stored.members).toContain(candidate);
    }
  });

  it("未选择成员时 confirmInvite 不应关闭弹窗", () => {
    const project = makeProject({ members: ["常谦"] });
    const { result } = renderHook(() => useProjectOverview(project));
    act(() => result.current.openInvite());
    act(() => result.current.confirmInvite());
    expect(result.current.inviteOpen).toBe(true);
  });
});
