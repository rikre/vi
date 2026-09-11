import { describe, expect, it } from "vitest";
import { appendRevision, buildScriptRequest, DEFAULT_SCRIPT_AGENT, type ScriptWorkspace } from "./script-workspace";

describe("script workspace", () => {
  it("uses configured roles, skills and constraints without pretending to generate", () => {
    const config = structuredClone(DEFAULT_SCRIPT_AGENT);
    config.skills[0].enabled = false;
    config.role = "只检查主角动机";
    const output = buildScriptRequest("主角走进院子", "加强冲突", config);
    expect(output).toContain("只检查主角动机");
    expect(output).not.toContain(config.skills[0].instruction);
    expect(output).toContain("主角走进院子");
    expect(() => buildScriptRequest("原文", " ", config)).toThrow();
  });
  it("appends immutable versions and snapshots the agent configuration", () => {
    const original: ScriptWorkspace = { draft: "原文", revisions: [], config: structuredClone(DEFAULT_SCRIPT_AGENT) };
    const next = appendRevision(original, "修改稿", "手动编辑");
    expect(original.revisions).toHaveLength(0);
    expect(next.revisions[0].content).toBe("修改稿");
    next.config.name = "新名字";
    expect(next.revisions[0].config?.name).toBe(DEFAULT_SCRIPT_AGENT.name);
  });
});
