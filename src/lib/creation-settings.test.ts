import { describe, expect, it } from "vitest";
import { activeCreationPreset, buildCreationRequest, creationSettingsSchema, DEFAULT_CREATION_SETTINGS } from "./creation-settings";

describe("project creation settings", () => {
  it("selects independent schemes for all three stages", () => {
    const config = structuredClone(DEFAULT_CREATION_SETTINGS);
    config.storyboard.selectedId = "remake";
    expect(activeCreationPreset(config, "storyboard").name).toBe("重绘还原");
    expect(activeCreationPreset(config, "assets").name).toBe("一致性提炼");
    expect(buildCreationRequest(config, "storyboard", "原文")).toContain("重绘还原");
    expect(DEFAULT_CREATION_SETTINGS.storyboard.selectedId).toBe("narrative");
  });
  it("rejects invalid selection, empty rules and empty test input", () => {
    const config = structuredClone(DEFAULT_CREATION_SETTINGS);
    config.polish.selectedId = "missing";
    expect(creationSettingsSchema.safeParse(config).success).toBe(false);
    expect(() => buildCreationRequest(DEFAULT_CREATION_SETTINGS, "assets", " ")).toThrow();
  });
});
