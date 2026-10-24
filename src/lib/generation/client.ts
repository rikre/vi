"use client";

/**
 * 生成 API 客户端（浏览器侧）。仅与 /api/generation 交互，
 * 不接触任何模型密钥。
 */

export type ShotVideoTask =
  | { kind: "real"; taskId: string }
  | { kind: "notConfigured" };

type ApiEnvelope<T> = { data?: T; error?: { code: string; message: string } };

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  return payload ?? {};
}

export async function submitShotVideo(input: {
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  startImage?: string;
}): Promise<ShotVideoTask> {
  const response = await fetch("/api/generation/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.status === 409) return { kind: "notConfigured" };
  if (!response.ok) {
    const { error } = await parseEnvelope<never>(response);
    throw new Error(error?.message ?? `视频任务提交失败 (HTTP ${response.status})`);
  }
  const { data } = await parseEnvelope<{ taskId: string }>(response);
  if (!data?.taskId) throw new Error("视频任务提交失败：未返回 taskId");
  return { kind: "real", taskId: data.taskId };
}

export type ShotVideoPollResult =
  | { kind: "pending" }
  | { kind: "succeeded"; videoUrl: string }
  | { kind: "failed"; message: string };

export async function pollShotVideo(taskId: string): Promise<ShotVideoPollResult> {
  const response = await fetch(`/api/generation/video?taskId=${encodeURIComponent(taskId)}`);
  if (!response.ok) {
    const { error } = await parseEnvelope<never>(response);
    throw new Error(error?.message ?? `视频任务查询失败 (HTTP ${response.status})`);
  }
  const { data } = await parseEnvelope<{
    status: string;
    videoUrl?: string;
    message?: string;
  }>(response);
  const status = data?.status ?? "UNKNOWN";
  if (status === "SUCCEEDED" && data?.videoUrl) {
    return { kind: "succeeded", videoUrl: data.videoUrl };
  }
  if (status === "FAILED" || status === "CANCELED") {
    return { kind: "failed", message: data?.message ?? "视频生成失败" };
  }
  return { kind: "pending" };
}
