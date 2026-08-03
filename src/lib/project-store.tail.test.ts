import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createProject, getProjects } from "@/lib/project-store";

describe("project-store 尾部测试", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("localStorage 满时不应崩溃", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() =>
      createProject({
        title: "溢出测试",
        description: "",
        mode: "自由模式",
      }),
    ).not.toThrow();
  });

  it("损坏的 localStorage 数据不应导致崩溃", () => {
    localStorage.setItem("bollo-custom-projects", "{ invalid json");
    expect(() => getProjects()).not.toThrow();
  });

  it("ID 碰撞时不应覆盖已有项目", () => {
    const p1 = createProject({
      title: "p1",
      description: "",
      mode: "自由模式",
    });
    const p2 = createProject({
      title: "p2",
      description: "",
      mode: "自由模式",
    });
    const projects = getProjects();
    expect(projects.find((p) => p.id === p1.id)).toBeDefined();
    expect(projects.find((p) => p.id === p2.id)).toBeDefined();
  });

  it("SSR 环境下不应访问 window", () => {
    const originalWindow = global.window;
    // @ts-expect-error — 模拟无 window
    delete global.window;
    expect(() => getProjects()).not.toThrow();
    global.window = originalWindow;
  });
});
