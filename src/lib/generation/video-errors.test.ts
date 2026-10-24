import { describe, expect, it } from "vitest";
import {
  extractInnermostErrorMessage,
  formatGenerationRequestError,
  formatGenerationTaskError,
} from "./video-errors";

describe("extractInnermostErrorMessage", () => {
  it("提取字符串原文", () => {
    expect(extractInnermostErrorMessage("模型限流")).toBe("模型限流");
  });

  it("提取嵌套 JSON 字符串中的最内层 message", () => {
    const nested = JSON.stringify({
      error: { message: JSON.stringify({ message: "API Key 无效" }) },
    });
    expect(extractInnermostErrorMessage(nested)).toBe("API Key 无效");
  });

  it("对象优先取 error 字段", () => {
    expect(extractInnermostErrorMessage({ error: { message: "A" }, message: "B" })).toBe("A");
  });

  it("空输入与超深输入返回空串", () => {
    expect(extractInnermostErrorMessage(null)).toBe("");
    expect(extractInnermostErrorMessage("")).toBe("");
    // 超过递归上限（depth > 10）不再解析，返回空串
    expect(extractInnermostErrorMessage("x", 11)).toBe("");
  });
});

describe("formatGenerationRequestError", () => {
  it("HTTP 错误体带 message 时只展示最内层", () => {
    const body = JSON.stringify({ error: { message: "参数不合法" } });
    expect(formatGenerationRequestError(400, body)).toBe("参数不合法");
  });

  it("无 body 时退化为 HTTP 状态码", () => {
    expect(formatGenerationRequestError(502, "")).toBe("HTTP 502");
  });
});

describe("formatGenerationTaskError", () => {
  it("任务错误取最内层 message", () => {
    expect(formatGenerationTaskError({ message: "内容审核未通过" }, "fallback")).toBe(
      "内容审核未通过",
    );
  });

  it("无信息时返回 fallback 或未知错误", () => {
    expect(formatGenerationTaskError(null, "生成失败")).toBe("生成失败");
    expect(formatGenerationTaskError(null)).toBe("未知错误");
  });
});
