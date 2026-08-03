import { describe, it, expect, beforeEach } from "vitest";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  renameProject,
  subscribeToProjects,
} from "@/lib/project-store";

describe("project-store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("createProject", () => {
    it("创建项目后应出现在列表中", () => {
      const project = createProject({
        title: "测试项目",
        description: "测试描述",
        mode: "自由模式",
        plannedEpisodes: 3,
      });
      const projects = getProjects();
      expect(projects.find((p) => p.id === project.id)).toBeDefined();
    });

    it("创建项目后应可通过 ID 查询", () => {
      const project = createProject({
        title: "测试项目",
        description: "",
        mode: "剧本模式",
      });
      const found = getProject(project.id);
      expect(found?.title).toBe("测试项目");
    });

    it("自由模式应创建指定集数的空白剧集", () => {
      const project = createProject({
        title: "自由模式测试",
        description: "",
        mode: "自由模式",
        plannedEpisodes: 5,
      });
      expect(project.episodeList).toHaveLength(5);
      expect(project.episodes).toBe(5);
      project.episodeList?.forEach((ep) => {
        expect(ep.status).toBe("未开始");
        expect(ep.progress).toBe(0);
      });
    });

    it("剧本模式也创建默认 3 集剧集", () => {
      const project = createProject({
        title: "剧本模式测试",
        description: "",
        mode: "剧本模式",
      });
      expect(project.episodeList).toHaveLength(3);
      expect(project.plannedEpisodes).toBeUndefined();
    });
  });

  describe("updateProject", () => {
    it("更新自定义项目的字段", () => {
      const project = createProject({
        title: "原始标题",
        description: "",
        mode: "自由模式",
      });
      updateProject(project.id, { description: "更新后的描述" });
      const updated = getProject(project.id);
      expect(updated?.description).toBe("更新后的描述");
    });

    it("更新 mock 项目的字段时应克隆到 localStorage", () => {
      const mockId = 1;
      updateProject(mockId, { description: "覆盖 mock 描述" });
      const updated = getProject(mockId);
      expect(updated?.description).toBe("覆盖 mock 描述");
    });

    it("更新 episodeList 后应反映在 getProject 中", () => {
      const project = createProject({
        title: "剧集测试",
        description: "",
        mode: "自由模式",
        plannedEpisodes: 3,
      });
      const updatedEpisodes = project.episodeList!.map((e) => ({
        ...e,
        progress: 100,
        status: "已完成" as const,
      }));
      updateProject(project.id, { episodeList: updatedEpisodes });
      const updated = getProject(project.id);
      expect(updated?.type).toBe("short");
      if (updated?.type === "short") {
        expect(updated.episodeList?.[0].progress).toBe(100);
      }
    });

    it("更新 members 后应反映在 getProject 中", () => {
      const project = createProject({
        title: "成员测试",
        description: "",
        mode: "自由模式",
      });
      const originalMembers = project.members.length;
      updateProject(project.id, { members: [...project.members, "李四"] });
      const updated = getProject(project.id);
      expect(updated?.type).toBe("short");
      if (updated?.type === "short") {
        expect(updated.members.length).toBe(originalMembers + 1);
      }
    });
  });

  describe("deleteProject", () => {
    it("删除自定义项目后不再出现在自定义列表中", () => {
      const project = createProject({
        title: "待删除",
        description: "",
        mode: "自由模式",
      });
      deleteProject(project.id);
      // mock 项目仍在 ALL_PROJECTS 中，但自定义副本已删
      const found = getProject(project.id);
      expect(found).toBeUndefined();
    });
  });

  describe("renameProject", () => {
    it("重命名项目", () => {
      const project = createProject({
        title: "旧名称",
        description: "",
        mode: "自由模式",
      });
      renameProject(project.id, "新名称");
      const updated = getProject(project.id);
      expect(updated?.title).toBe("新名称");
    });
  });

  describe("subscribeToProjects", () => {
    it("创建项目时应触发订阅回调", () => {
      let called = 0;
      const unsub = subscribeToProjects(() => {
        called++;
      });
      createProject({
        title: "订阅测试",
        description: "",
        mode: "自由模式",
      });
      expect(called).toBeGreaterThan(0);
      unsub();
    });

    it("更新项目时应触发订阅回调", () => {
      const project = createProject({
        title: "订阅测试2",
        description: "",
        mode: "自由模式",
      });
      let called = 0;
      const unsub = subscribeToProjects(() => {
        called++;
      });
      updateProject(project.id, { description: "触发" });
      expect(called).toBeGreaterThan(0);
      unsub();
    });
  });
});
