import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * 模型密钥存储适配器。
 * - 生产：优先写入外部 KMS（KMS_API_BASE_URL），仅保存密钥引用与末四位
 * - 本地开发：ADMIN_SECRET_ENCRYPTION_KEY（32 字节 base64）做 AES-256-GCM 加密后落库
 * 密钥明文永不出现在响应、日志或浏览器中。
 */
export type SecretWriteResult = {
  secretRef: string;
  apiKeyLast4: string;
  secretCipher: string | null;
};

export class SecretAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretAdapterError";
  }
}

function toBase64(input: Buffer): string {
  return input.toString("base64");
}

function encryptLocal(plaintext: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${toBase64(iv)}:${toBase64(tag)}:${toBase64(encrypted)}`;
}

/** 供运维验证与轮换时使用；管理 API 不暴露解密能力。 */
export function decryptLocal(cipherText: string, key: Buffer): string {
  const [version, ivPart, tagPart, dataPart] = cipherText.split(":");
  if (version !== "v1" || !ivPart || !tagPart || !dataPart) {
    throw new SecretAdapterError("密文格式不合法");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivPart, "base64"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

async function storeToKms(modelId: string, secret: string): Promise<string> {
  const base = process.env.KMS_API_BASE_URL;
  const token = process.env.KMS_API_KEY;
  if (!base || !token) throw new SecretAdapterError("KMS 未配置");
  const url = new URL("secrets", base.endsWith("/") ? base : `${base}/`);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: `bollo/model/${modelId}`, value: secret }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new SecretAdapterError("KMS 写入失败");
    const payload = (await response.json().catch(() => null)) as unknown;
    const ref =
      typeof payload === "object" && payload !== null && "ref" in payload
        ? String((payload as { ref: unknown }).ref)
        : null;
    if (!ref) throw new SecretAdapterError("KMS 返回了无效引用");
    return ref;
  } catch (error) {
    if (error instanceof SecretAdapterError) throw error;
    throw new SecretAdapterError("KMS 请求失败");
  }
}

function loadLocalKey(): Buffer {
  const encoded = process.env.ADMIN_SECRET_ENCRYPTION_KEY;
  if (!encoded) {
    throw new SecretAdapterError(
      "本地密钥存储需要 ADMIN_SECRET_ENCRYPTION_KEY（32 字节 base64）；生产环境请配置 KMS_API_BASE_URL",
    );
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new SecretAdapterError("ADMIN_SECRET_ENCRYPTION_KEY 必须为 32 字节 base64 编码");
  }
  return key;
}

/** 存储模型密钥，返回引用、末四位与（本地适配器下的）密文。 */
export async function storeModelSecret(modelId: string, secret: string): Promise<SecretWriteResult> {
  const apiKeyLast4 = secret.slice(-4).toUpperCase();
  if (process.env.KMS_API_BASE_URL && process.env.KMS_API_KEY) {
    const secretRef = await storeToKms(modelId, secret);
    return { secretRef, apiKeyLast4, secretCipher: null };
  }
  const key = loadLocalKey();
  const secretRef = `local://${modelId}`;
  return { secretRef, apiKeyLast4, secretCipher: encryptLocal(secret, key) };
}

export function isLocalSecretAdapter(): boolean {
  return !(process.env.KMS_API_BASE_URL && process.env.KMS_API_KEY);
}
