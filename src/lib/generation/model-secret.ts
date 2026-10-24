/**
 * 服务端生成模型解析：从 admin 模型配置（Prisma ModelConfig）读取启用的视频模型，
 * 并仅在本进程内解密密钥（密钥明文不返回给任何调用方、不写日志）。
 */

import { getPrisma } from "@/lib/db";
import { decryptLocal, SecretAdapterError } from "@/lib/admin/secret-adapter";

export type VideoModelRuntime = {
  id: string;
  name: string;
  /** DashScope API base，如 https://dashscope.aliyuncs.com */
  apiBase: string;
  /** DashScope 模型名（如 wan2.2-t2v-plus） */
  apiModel: string;
  apiKey: string;
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
  const chosen = row ?? rows[0];

  let apiKey: string | null = null;
  if (chosen.secretCipher) {
    apiKey = decryptCipher(chosen.secretCipher);
  } else {
    return { model: null, reason: "模型密钥存储在外部 KMS，当前运行环境无法解密" };
  }

  return {
    model: {
      id: chosen.id,
      name: chosen.name,
      apiBase: chosen.endpoint.replace(/\/$/, ""),
      apiModel: resolveApiModel(chosen.outputOptions, chosen.id),
      apiKey,
    },
    reason: null,
  };
}
