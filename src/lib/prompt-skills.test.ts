import { describe, expect, it } from "vitest";
import { BUILTIN_SKILLS, buildPrompt, inspectPrompt, skillSchema } from "./prompt-skills";

describe("prompt skills", () => {
  it("preserves the source and only applies skills for the selected mode", () => {
    const result = buildPrompt("林安走进院子。", "storyboard", BUILTIN_SKILLS);
    expect(result).toContain("林安走进院子。");
    expect(result).toContain(BUILTIN_SKILLS[0].instruction);
    expect(result).not.toContain(BUILTIN_SKILLS[1].instruction);
  });
  it("rejects empty input and invalid custom skills", () => {
    expect(() => buildPrompt("  ", "cleanup", [])).toThrow();
    expect(skillSchema.safeParse({ id: "x", name: " ", instruction: "x", mode: "cleanup" }).success).toBe(false);
  });
  it("flags conflicting camera directions without silently changing them", () => {
    const source = "固定镜头环绕人物，同时推近和拉远";
    expect(inspectPrompt(source)).toHaveLength(2);
    expect(buildPrompt(source, "cleanup", BUILTIN_SKILLS)).toContain(source);
  });
  it("includes custom rules as plain text", () => {
    expect(buildPrompt("人物坐下", "polish", [{ id: "x", name: "写实", mode: "polish", instruction: "保留自然光" }])).toContain("保留自然光");
  });
});
