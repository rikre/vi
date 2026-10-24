/**
 * 真实视频生成 API（百炼 DashScope 异步任务）。
 * 协议核心移植自 rikre/loopvideo@87a6950（MIT）；密钥体系沿用本项目
 * admin 模型配置（secretCipher → 服务端解密，明文不出服务端、不写日志）。
 *
 * POST /api/generation/video          提交任务（扣积分） → { data: { taskId } }
 * GET  /api/generation/video?taskId=  查询状态 → { data: { status, videoUrl?, message? } }
 *
 * 未配置可用模型时返回 409 MODEL_NOT_CONFIGURED，客户端据此回退演示模拟路径。
 * 计费：提交前按模型 creditPrice 扣减（单事务）；提交失败全额退款；
 * 任务终态失败按策略 failedTaskRefund 退款；用量写 UsageLedger 价格快照。
 */

import { z } from "zod";
import { resolveAuthUser } from "@/lib/auth-server";
import {
  AdminApiError,
  handleRouteError,
  jsonOk,
} from "@/lib/admin/http";
import {
  fetchDashScopeVideoTask,
  submitDashScopeVideoTask,
} from "@/lib/generation/dashscope";
import {
  GenerationConfigError,
  resolveVideoModelRuntime,
  resolveVideoPollRuntime,
} from "@/lib/generation/model-secret";
import {
  chargeGenerationCredits,
  recordGenerationUsage,
  refundFailedSubmit,
  refundFailedTask,
} from "@/lib/generation/billing";

const submitSchema = z.object({
  prompt: z.string().trim().min(1, "分镜提示词不能为空").max(2000),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional(),
  duration: z.number().int().min(1).max(16).optional(),
  startImage: z
    .string()
    .refine((v) => v.startsWith("data:image/"), "首帧图片必须是 data:image URL")
    .optional(),
  modelId: z.string().max(64).optional(),
});

async function requireUser(request: Request) {
  const user = await resolveAuthUser(request);
  if (!user) {
    throw new AdminApiError(401, "UNAUTHORIZED", "登录状态已失效，请重新登录");
  }
  return user;
}

async function resolveModelOrThrow(modelId?: string) {
  const { model, reason } = await resolveVideoModelRuntime(modelId);
  if (!model) {
    throw new AdminApiError(409, "MODEL_NOT_CONFIGURED", reason ?? "未配置可用的视频生成模型");
  }
  return model;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = submitSchema.parse(await request.json().catch(() => null));
    const model = await resolveModelOrThrow(body.modelId);

    const ledgerKey = await chargeGenerationCredits(user.id, model.creditPrice);

    let taskId: string;
    try {
      taskId = await submitDashScopeVideoTask({
        apiBase: model.apiBase,
        apiKey: model.apiKey,
        model: model.apiModel,
        prompt: body.prompt,
        aspectRatio: body.aspectRatio,
        duration: body.duration,
        startImage: body.startImage,
      });
    } catch (error) {
      // 提交失败未产生真实用量：全额退款后再把原始错误抛给客户端
      if (ledgerKey) await refundFailedSubmit(user.id, ledgerKey);
      throw error;
    }

    await recordGenerationUsage({
      taskId,
      userId: user.id,
      model,
      credits: model.creditPrice,
      ledgerKey,
    });

    // 响应只回任务 ID，不回 apiModel / 端点等内部配置
    return jsonOk({ taskId }, 201);
  } catch (error) {
    if (error instanceof GenerationConfigError) {
      return handleRouteError(new AdminApiError(409, "MODEL_NOT_CONFIGURED", error.message));
    }
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const taskId = new URL(request.url).searchParams.get("taskId");
    if (!taskId) {
      throw new AdminApiError(400, "INVALID_TASK_ID", "缺少 taskId 查询参数");
    }
    // 轮询走独立解析：优先用提交该任务的模型（含已停用行），模型下线不中断查询
    const poll = await resolveVideoPollRuntime(taskId);

    const state = await fetchDashScopeVideoTask({
      apiBase: poll.apiBase,
      apiKey: poll.apiKey,
      taskId,
    });

    if (state.status === "FAILED" || state.status === "CANCELED") {
      await refundFailedTask(taskId);
    }

    // 响应只回任务状态，不回 apiModel / 端点等内部配置
    return jsonOk({
      status: state.status,
      videoUrl: state.videoUrl,
      message: state.message,
    });
  } catch (error) {
    if (error instanceof GenerationConfigError) {
      return handleRouteError(new AdminApiError(409, "MODEL_NOT_CONFIGURED", error.message));
    }
    return handleRouteError(error);
  }
}
