/**
 * 服务端生成模型解析：从 admin 模型配置（Prisma ModelConfig）读取启用的视频模型，
 * 并仅在本进程内解密密钥（密钥明文不返回给任何调用方、不写日志）。
 */

import { getPrisma } from "@/lib/db";
import { decryptLocal, SecretAdapterError } from "@/lib/admin/secret-adapter";
import type { ModelConfig } from "@prisma/client";

export type VideoModelRuntime = {
  id: string;
  name: string;
  /** DashScope API base，如 https://dashscope.aliyuncs.com */
  apiBase: string;
  /** DashScope 模型名（如 wan2.2-t2v-plus） */
  apiModel: string;
  apiKey: string;
  /** 以下为计费快照字段（提交任务时写入流水，价格变动不影响已提交任务） */
  creditPrice: number;
  vendorCostCent: number;
  billingUnit: string;
  version: number;
};

export class GenerationConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerationConfigError";
  }
}

function resolveApiModel(outputOptions: string[], id: string): string {
  // outputOptions 由管理员配置为该模型可用的 DashScope 模型名列表，取第一项为默认
  return outputOptions[0] ?? id;
}

function decryptCipher(cipher: string): string {
  const keyBase64 = process.env.ADMIN_SECRET_ENCRYPTION_KEY;
  if (!keyBase64) {
    throw new GenerationConfigError("模型密钥已加密存储，但本环境未配置解密密钥");
  }
  try {
    return decryptLocal(cipher, Buffer.from(keyBase64, "base64"));
  } catch (error) {
    if (error instanceof SecretAdapterError) throw new GenerationConfigError(error.message);
    throw error;
  }
}

function toRuntime(row: ModelConfig): VideoModelRuntime {
  return {
    id: row.id,
    name: row.name,
    apiBase: row.endpoint.replace(/\/$/, ""),
    apiModel: resolveApiModel(row.outputOptions, row.id),
    apiKey: decryptCipher(row.secretCipher!),
    creditPrice: row.creditPrice,
    vendorCostCent: row.vendorCostCent,
    billingUnit: row.billingUnit,
    version: row.version,
  };
}

/** 解析可用的视频生成模型；未配置或密钥不可用时返回 null（reason 说明原因）。 */
export async function resolveVideoModelRuntime(
  preferredId?: string,
): Promise<{ model: VideoModelRuntime | null; reason: string | null }> {
  const rows = await getPrisma().modelConfig.findMany({
    where: { capability: "video", enabled: true },
    orderBy: { createdAt: "asc" },
  });
  if (rows.length === 0) {
    return { model: null, reason: "未配置任何启用的视频生成模型" };
  }
  const row = preferredId ? rows.find((r) => r.id === preferredId) : undefined;
  // 指定模型未命中时直接判不可用，不用其他模型静默顶替
  if (preferredId && !row) {
    return { model: null, reason: "指定的生成模型不存在或未启用" };
  }
  const chosen = row ?? rows[0];

  if (!chosen.secretCipher) {
    return { model: null, reason: "模型密钥存储在外部 KMS，当前运行环境无法解密" };
  }

  try {
    return { model: toRuntime(chosen), reason: null };
  } catch (error) {
    if (error instanceof GenerationConfigError) {
      return { model: null, reason: error.message };
    }
    throw error;
  }
}

/**
 * 轮询专用解析：优先用提交该任务的模型行（即使随后被停用也能查任务），
 * 密钥不可用时回退到任意启用的视频模型。轮询不因模型下线而 409 中断。
 */
export async function resolveVideoPollRuntime(taskId: string): Promise<VideoModelRuntime> {
  const prisma = getPrisma();
  const usage = await prisma.usageLedger.findUnique({
    where: { taskId },
    select: { modelId: true },
  });

  const candidates: ModelConfig[] = [];
  if (usage) {
    const row = await prisma.modelConfig.findUnique({ where: { id: usage.modelId } });
    if (row) candidates.push(row);
  }
  if (candidates.length === 0) {
    const enabled = await prisma.modelConfig.findMany({
      where: { capability: "video", enabled: true },
      orderBy: { createdAt: "asc" },
    });
    candidates.push(...enabled);
  }

  for (const row of candidates) {
    if (!row.secretCipher) continue;
    try {
      return toRuntime(row);
    } catch (error) {
      if (!(error instanceof GenerationConfigError)) throw error;
    }
  }
  throw new GenerationConfigError("当前没有可解密的视频模型密钥，无法查询生成任务");
}
