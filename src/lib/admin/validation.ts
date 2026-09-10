import { z } from "zod";
import { ADMIN_ROLE_NAMES } from "@/lib/admin/rbac";

/** 积分桶，与前端 CreditBucket 保持一致。 */
export const CREDIT_BUCKETS = ["recharge", "member", "gift", "enterprise"] as const;

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,63}$/;

const yuanField = z
  .number()
  .min(0)
  .max(10_000_000)
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, {
    message: "金额最多支持两位小数",
  });

const positiveInt = (label: string, max = 2_000_000_000) =>
  z.number().int().min(0, `${label}不能为负`).max(max, `${label}超出上限`);

export const grantInputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("credits"),
    userId: z.string().min(1),
    bucket: z.enum(CREDIT_BUCKETS),
    amount: z.number().int().min(1, "发放数量必须为正整数").max(100_000_000),
    reason: z.string().trim().min(2, "请填写发放原因").max(500),
  }),
  z.object({
    kind: z.literal("membership"),
    userId: z.string().min(1),
    planId: z.string().regex(idPattern, "套餐 ID 不合法"),
    durationDays: z.number().int().min(1).max(3_650),
    reason: z.string().trim().min(2, "请填写发放原因").max(500),
  }),
  z.object({
    kind: z.literal("compute"),
    userId: z.string().min(1),
    maxConcurrency: z.number().int().min(1).max(10_000),
    monthlyComputeQuota: z.number().int().min(0).max(2_000_000_000),
    reason: z.string().trim().min(2, "请填写发放原因").max(500),
  }),
]);

export const userStatusSchema = z.object({
  status: z.enum(["active", "risk", "disabled"]),
  reason: z.string().trim().min(2, "状态变更必须填写原因").max(500),
});

export const planInputSchema = z.object({
  id: z.string().regex(idPattern, "套餐 ID 仅支持字母、数字与 . _ : -"),
  name: z.string().trim().min(1, "请填写套餐名称").max(50),
  audience: z.enum(["personal", "team", "enterprise"]),
  priceMonthly: yuanField,
  priceYearlyMonthly: yuanField,
  monthlyCredits: positiveInt("每月积分"),
  seats: z.number().int().min(1).max(10_000),
  concurrency: z.number().int().min(1).max(10_000),
  monthlyComputeQuota: positiveInt("月算力额度"),
  queue: z.enum(["standard", "priority", "dedicated"]),
  features: z.array(z.string().min(1).max(64)).max(50),
  modelWhitelist: z.array(z.string().min(1).max(64)).max(100).optional(),
  enabled: z.boolean(),
});

export const rechargeTierInputSchema = z.object({
  id: z.string().regex(idPattern, "档位 ID 仅支持字母、数字与 . _ : -"),
  name: z.string().trim().min(1, "请填写档位名称").max(50),
  price: yuanField.refine((value) => value > 0, "售价必须大于 0"),
  baseCredits: z.number().int().min(1, "基础积分必须为正整数").max(100_000_000),
  bonusCredits: positiveInt("赠送积分", 100_000_000),
  firstPurchaseOnly: z.boolean(),
  enabled: z.boolean(),
});

export const modelInputSchema = z.object({
  name: z.string().trim().min(1, "请填写模型名称").max(80),
  vendor: z.string().trim().min(1, "请填写供应商").max(80),
  capability: z.enum(["video", "image", "audio", "text"]),
  endpoint: z.string().url().startsWith("https://", "端点必须为 HTTPS 地址").max(500),
  billingUnit: z.string().trim().min(1).max(30),
  vendorCost: yuanField,
  creditPrice: positiveInt("积分售价", 1_000_000),
  maxConcurrency: z.number().int().min(1).max(100_000),
  timeoutSeconds: z.number().int().min(1).max(86_400),
  health: z.enum(["healthy", "degraded", "offline"]),
  outputOptions: z.array(z.string().min(1).max(64)).max(50),
  allowedPlans: z.array(z.string().min(1).max(64)).max(100),
  enabled: z.boolean(),
});

export const modelSecretSchema = z.object({
  secret: z.string().trim().min(8, "密钥长度过短").max(4_096),
});

export const creditPolicyInputSchema = z.object({
  creditsPerYuan: z.number().int().min(1).max(100_000),
  deductionOrder: z.array(z.enum(CREDIT_BUCKETS)).length(4, "扣减顺序必须包含全部四类账户").refine(
    (order) => new Set(order).size === 4,
    { message: "扣减顺序中账户不能重复" },
  ),
  giftExpiryDays: z.number().int().min(1).max(3_650),
  memberResetDay: z.number().int().min(1).max(28, "会员重置日应为 1–28"),
  minimumGrant: z.number().int().min(1).max(10_000_000),
  failedTaskRefund: z.boolean(),
  negativeBalanceAllowed: z.boolean(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  q: z.string().trim().max(120).optional(),
  status: z.string().trim().max(30).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
export type GrantInput = z.infer<typeof grantInputSchema>;
export type PlanInput = z.infer<typeof planInputSchema>;
export type RechargeTierInput = z.infer<typeof rechargeTierInputSchema>;
export type ModelInput = z.infer<typeof modelInputSchema>;
export type CreditPolicyInput = z.infer<typeof creditPolicyInputSchema>;

export function parseListQuery(url: string): ListQuery {
  const params = Object.fromEntries(new URL(url).searchParams.entries());
  const entries = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined),
  );
  return listQuerySchema.parse(entries);
}

export const ADMIN_ROLE_NAME_SCHEMA = z.enum(ADMIN_ROLE_NAMES);

/** 解析 JSON 请求体；非对象返回 null。 */
export async function parseJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  const payload = (await request.json().catch(() => null)) as unknown;
  return typeof payload === "object" && payload !== null && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : null;
}
