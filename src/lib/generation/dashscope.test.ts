import { describe, expect, it } from "vitest";
import {
  DASHSCOPE_VIDEO_SIZES,
  fetchDashScopeVideoTask,
  resolveDashScopeVideoSize,
  submitDashScopeVideoTask,
  type DashScopeFetch,
} from "./dashscope";

const API_BASE = "https://dashscope.example.com";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("resolveDashScopeVideoSize", () => {
  it("映射三种纵横比，未知值回退 16:9", () => {
    expect(resolveDashScopeVideoSize("16:9")).toBe(DASHSCOPE_VIDEO_SIZES["16:9"]);
    expect(resolveDashScopeVideoSize("9:16")).toBe("720*1280");
    expect(resolveDashScopeVideoSize("1:1")).toBe("720*720");
    expect(resolveDashScopeVideoSize("4:3")).toBe("1280*720");
  });
});

describe("submitDashScopeVideoTask", () => {
  it("文生视频：组装 DashScope 异步请求并返回 task_id", async () => {
    const captured: { url?: string; init?: RequestInit } = {};
    const fetchImpl: DashScopeFetch = (async (url: string | URL | Request, init?: RequestInit) => {
      captured.url = String(url);
      captured.init = init ?? {};
      return jsonResponse(200, { output: { task_id: "task-1" } });
    }) as DashScopeFetch;

    const taskId = await submitDashScopeVideoTask({
      apiBase: API_BASE,
      apiKey: "sk-test",
      model: "wan2.2-t2v-plus",
      prompt: "少年在雨夜奔跑",
      aspectRatio: "9:16",
      duration: 5,
      fetchImpl,
    });

    expect(taskId).toBe("task-1");
    expect(captured.url).toBe(
      `${API_BASE}/api/v1/services/aigc/video-generation/video-synthesis`,
    );
    const headers = captured.init?.headers as Record<string, string>;
    expect(headers["X-DashScope-Async"]).toBe("enable");
    expect(headers["Authorization"]).toBe("Bearer sk-test");
    const body = JSON.parse(String(captured.init?.body)) as {
      model: string;
      input: Record<string, unknown>;
      parameters: Record<string, unknown>;
    };
    expect(body.model).toBe("wan2.2-t2v-plus");
    expect(body.input).toEqual({ prompt: "少年在雨夜奔跑" });
    expect(body.parameters).toEqual({ size: "720*1280", duration: 5 });
  });

  it("图生视频：首帧图片走 input.media", async () => {
    let capturedBody: unknown = null;
    const fetchImpl: DashScopeFetch = (async (_url, init) => {
      capturedBody = JSON.parse(String(init?.body));
      return jsonResponse(200, { output: { task_id: "task-2" } });
    }) as DashScopeFetch;

    await submitDashScopeVideoTask({
      apiBase: API_BASE,
      apiKey: "sk-test",
      model: "wan2.2-i2v-plus",
      prompt: "续写画面",
      startImage: "data:image/png;base64,abc",
      fetchImpl,
    });

    const body = capturedBody as { model: string; input: { media?: unknown[] } };
    expect(body.model).toBe("wan2.2-i2v-plus");
    expect(body.input.media).toEqual([{ url: "data:image/png;base64,abc" }]);
  });

  it("i2v 模型缺首帧时自动降级 t2v", async () => {
    let capturedBody: unknown = null;
    const fetchImpl: DashScopeFetch = (async (_url, init) => {
      capturedBody = JSON.parse(String(init?.body));
      return jsonResponse(200, { output: { task_id: "task-3" } });
    }) as DashScopeFetch;

    await submitDashScopeVideoTask({
      apiBase: API_BASE,
      apiKey: "sk-test",
      model: "wan2.2-i2v-plus",
      prompt: "纯文本",
      fetchImpl,
    });

    expect((capturedBody as { model: string }).model).toBe("wan2.2-t2v-plus");
  });

  it("提交失败：透出平台最内层错误信息", async () => {
    const fetchImpl: DashScopeFetch = (async () =>
      jsonResponse(401, { error: { message: "InvalidApiKey" } })) as DashScopeFetch;

    await expect(
      submitDashScopeVideoTask({
        apiBase: API_BASE,
        apiKey: "bad",
        model: "wan2.2-t2v-plus",
        prompt: "p",
        fetchImpl,
      }),
    ).rejects.toThrow("InvalidApiKey");
  });

  it("提交成功但无 task_id 时报错", async () => {
    const fetchImpl: DashScopeFetch = (async () => jsonResponse(200, {})) as DashScopeFetch;
    await expect(
      submitDashScopeVideoTask({
        apiBase: API_BASE,
        apiKey: "k",
        model: "m",
        prompt: "p",
        fetchImpl,
      }),
    ).rejects.toThrow("task_id");
  });
});

describe("fetchDashScopeVideoTask", () => {
  it("SUCCEEDED 时返回 videoUrl", async () => {
    const fetchImpl: DashScopeFetch = (async () =>
      jsonResponse(200, {
        output: { task_status: "SUCCEEDED", video_url: "https://cdn/v.mp4" },
      })) as DashScopeFetch;

    const state = await fetchDashScopeVideoTask({
      apiBase: API_BASE,
      apiKey: "k",
      taskId: "task-1",
      fetchImpl,
    });
    expect(state).toEqual({
      status: "SUCCEEDED",
      videoUrl: "https://cdn/v.mp4",
    });
  });

  it("FAILED 时映射为用户可读 message", async () => {
    const fetchImpl: DashScopeFetch = (async () =>
      jsonResponse(200, {
        output: { task_status: "FAILED", message: JSON.stringify({ message: "内容不合规" }) },
      })) as DashScopeFetch;

    const state = await fetchDashScopeVideoTask({
      apiBase: API_BASE,
      apiKey: "k",
      taskId: "task-1",
      fetchImpl,
    });
    expect(state.status).toBe("FAILED");
    expect(state.message).toBe("内容不合规");
  });

  it("未知状态与 HTTP 错误分别返回 UNKNOWN", async () => {
    const weird: DashScopeFetch = (async () =>
      jsonResponse(200, { output: { task_status: "WEIRD" } })) as DashScopeFetch;
    expect(
      (await fetchDashScopeVideoTask({ apiBase: API_BASE, apiKey: "k", taskId: "t", fetchImpl: weird }))
        .status,
    ).toBe("UNKNOWN");

    const httpError: DashScopeFetch = (async () =>
      jsonResponse(500, { error: { message: "server boom" } })) as DashScopeFetch;
    const state = await fetchDashScopeVideoTask({
      apiBase: API_BASE,
      apiKey: "k",
      taskId: "t",
      fetchImpl: httpError,
    });
    expect(state.status).toBe("UNKNOWN");
    expect(state.message).toBe("server boom");
  });
});
