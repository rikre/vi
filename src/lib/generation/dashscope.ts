/**
 * 百炼 DashScope 异步视频生成协议核心（服务端使用，密钥不出服务端）。
 * 来源：rikre/loopvideo@87a6950 services/adapters/videoAdapter.ts（MIT）
 * 移植要点：
 * - loopvideo 在浏览器直连 DashScope 并轮询 10 分钟；本项目改为
 *   「提交」与「查询单次状态」两个纯函数，轮询由调用方（API route + 客户端）驱动，
 *   以适配 Next.js 服务端运行时。
 * - 保留 t2v/i2v 双模式、首帧图片 data URL 透传、尺寸映射与错误文案提取。
 */

import { formatGenerationRequestError, formatGenerationTaskError } from "./video-errors";

export type DashScopeAspect = "16:9" | "9:16" | "1:1";

export const DASHSCOPE_VIDEO_SIZES: Record<DashScopeAspect, string> = {
  "16:9": "1280*720",
  "9:16": "720*1280",
  "1:1": "720*720",
};

export function resolveDashScopeVideoSize(aspectRatio: string): string {
  return DASHSCOPE_VIDEO_SIZES[aspectRatio as DashScopeAspect] ?? DASHSCOPE_VIDEO_SIZES["16:9"];
}

export type DashScopeVideoTaskStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "UNKNOWN";

export type DashScopeFetch = typeof fetch;

export type SubmitDashScopeVideoInput = {
  apiBase: string;
  apiKey: string;
  /** DashScope 模型名，如 wan2.2-t2v-plus；i2v 模型缺首帧时自动降级 t2v */
  model: string;
  prompt: string;
  aspectRatio?: string;
  duration?: number;
  /** 首帧图片（data URL），存在时走图生视频（input.media） */
  startImage?: string;
  fetchImpl?: DashScopeFetch;
};

export type DashScopeVideoTaskState = {
  status: DashScopeVideoTaskStatus;
  videoUrl?: string;
  message?: string;
};

function normalizeTaskStatus(raw: unknown): DashScopeVideoTaskStatus {
  if (raw === "PENDING" || raw === "RUNNING" || raw === "SUCCEEDED" || raw === "FAILED" || raw === "CANCELED") {
    return raw;
  }
  return "UNKNOWN";
}

/** 提交异步视频生成任务，返回 task_id。 */
export async function submitDashScopeVideoTask(input: SubmitDashScopeVideoInput): Promise<string> {
  const doFetch = input.fetchImpl ?? fetch;
  let apiModel = input.model;
  if (apiModel.includes("i2v") && !input.startImage) {
    apiModel = apiModel.replace("-i2v", "-t2v");
  }

  const body: Record<string, unknown> = {
    model: apiModel,
    input: {
      prompt: input.prompt,
      ...(input.startImage ? { media: [{ url: input.startImage }] } : {}),
    },
    parameters: {
      size: resolveDashScopeVideoSize(input.aspectRatio ?? "16:9"),
      duration: input.duration ?? 8,
    },
  };

  const submitUrl = `${input.apiBase.replace(/\/$/, "")}/api/v1/services/aigc/video-generation/video-synthesis`;
  const response = await doFetch(submitUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      `视频任务提交失败: ${formatGenerationRequestError(response.status, bodyText)}`,
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | { output?: { task_id?: string } }
    | null;
  const taskId = payload?.output?.task_id;
  if (!taskId) throw new Error("视频任务提交失败：未返回 task_id");
  return taskId;
}

/** 查询一次异步任务状态（不轮询；轮询节奏由调用方控制）。 */
export async function fetchDashScopeVideoTask(params: {
  apiBase: string;
  apiKey: string;
  taskId: string;
  fetchImpl?: DashScopeFetch;
}): Promise<DashScopeVideoTaskState> {
  const doFetch = params.fetchImpl ?? fetch;
  const statusUrl = `${params.apiBase.replace(/\/$/, "")}/api/v1/tasks/${params.taskId}`;
  const response = await doFetch(statusUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${params.apiKey}` },
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    return {
      status: "UNKNOWN",
      message: formatGenerationRequestError(response.status, bodyText),
    };
  }

  const payload = (await response.json().catch(() => null)) as
    | {
        output?: {
          task_status?: string;
          video_url?: string;
          message?: string;
        };
      }
    | null;
  const output = payload?.output;
  if (!output) return { status: "UNKNOWN", message: "任务查询未返回数据" };

  const state: DashScopeVideoTaskState = { status: normalizeTaskStatus(output.task_status) };
  if (typeof output.video_url === "string" && output.video_url) state.videoUrl = output.video_url;
  if (typeof output.message === "string" && output.message) {
    state.message = formatGenerationTaskError({ message: output.message });
  }
  return state;
}
