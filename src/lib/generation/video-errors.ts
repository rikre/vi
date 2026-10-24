/**
 * 视频/图像生成任务错误提取与用户可读文案。
 * 来源：rikre/loopvideo@87a6950 services/videoHttpErrors.ts（MIT）
 * 移植时改为 TypeScript strict、无 any，保持提取语义不变。
 */

export type ParsedApiError = { message?: string; type?: string; code?: string; param?: string };

function parseOpenAIStyleErrorBody(text: string): { error?: ParsedApiError } | null {
  try {
    return JSON.parse(text) as { error?: ParsedApiError };
  } catch {
    return null;
  }
}

/** 从嵌套 JSON / error 对象中提取最内层 message（平台原文，不改写） */
export function extractInnermostErrorMessage(input: unknown, depth = 0): string {
  if (depth > 10 || input == null) return "";

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 2) {
      try {
        const inner = extractInnermostErrorMessage(JSON.parse(trimmed), depth + 1);
        if (inner) return inner;
      } catch {
        /* 非 JSON，当作最终 message */
      }
    }
    return trimmed;
  }

  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    if (obj.error) {
      const fromError = extractInnermostErrorMessage(obj.error, depth + 1);
      if (fromError) return fromError;
    }
    if (typeof obj.message === "string") {
      const fromMsg = extractInnermostErrorMessage(obj.message, depth + 1);
      if (fromMsg) return fromMsg;
    }
  }

  return "";
}

function extractFromResponseBody(bodyText: string): string {
  const trimmed = (bodyText || "").trim();
  if (!trimmed) return "";
  const parsed = parseOpenAIStyleErrorBody(trimmed);
  return extractInnermostErrorMessage(parsed?.error ?? parsed ?? trimmed);
}

/** HTTP 请求失败：仅展示最内层 message */
export function formatGenerationRequestError(status: number, bodyText: string): string {
  const inner = extractFromResponseBody(bodyText);
  if (inner) return inner;
  return `HTTP ${status}`;
}

/** 异步任务失败：仅展示最内层 message */
export function formatGenerationTaskError(err: unknown, fallbackMessage?: string): string {
  const inner =
    extractInnermostErrorMessage(err) || extractInnermostErrorMessage(fallbackMessage);
  return inner || "未知错误";
}
