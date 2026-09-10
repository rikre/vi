import { describe, expect, it } from "vitest";
import { safeAuthRedirect } from "./auth-redirect";

describe("login return path", () => {
  it("preserves project route, query and hash", () => {
    expect(safeAuthRedirect("/project/new?mode=script#assets", "http://localhost:3001"))
      .toBe("/project/new?mode=script#assets");
  });
  it.each([null, "", "https://example.com", "//example.com", "/\\example.com", "javascript:alert(1)"])("rejects external or invalid path %s", (path) => {
    expect(safeAuthRedirect(path, "http://localhost:3001")).toBeNull();
  });
});
