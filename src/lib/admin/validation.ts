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
    amount: z
      .number()
      .int()
      .refine((value) => value !== 0, "变动数量不能为零")
      .refine((value) => Math.abs(value) <= 100_000_000, "变动数量超出上限"),
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

/** 链接字段：http(s) 合法 URL 或 / 开头的站内路径；空字符串 / null 归一化为 null。 */
const optionalLinkField = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) return null;
    return value.trim();
  })
  .refine((value) => value === null || value === "" || value.startsWith("/") || /^https?:\/\/\S+$/.test(value), {
    message: "必须是合法 URL（http(s):// 或 / 开头的站内路径）",
  })
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || value.length <= 1_000, { message: "链接长度超出上限" });

const optionalDateField = z
  .union([z.coerce.date(), z.null()])
  .optional()
  .transform((value) => value ?? null);

/** 生效窗口校验：两者都填写时 endAt 必须晚于 startAt。 */
function validateTimeWindow(data: { startAt: Date | null; endAt: Date | null }, ctx: z.RefinementCtx): void {
  if (data.startAt && data.endAt && data.endAt.getTime() <= data.startAt.getTime()) {
    ctx.addIssue({ code: "custom", path: ["endAt"], message: "结束时间必须晚于开始时间" });
  }
}

export const placementItemInputSchema = z
  .object({
    title: z.string().trim().min(1, "请填写素材标题").max(80),
    subtitle: z.string().trim().max(200, "副标题最多 200 字").optional().default(""),
    imageUrl: optionalLinkField,
    iconKey: z.string().trim().max(64, "图标标识最多 64 字").optional().default(""),
    linkUrl: optionalLinkField,
    badge: z.string().trim().max(200, "角标最多 200 字").optional().default(""),
    sortOrder: z.number().int().min(0, "排序值不能为负").max(9_999, "排序值 0–9999").optional().default(0),
    status: z.enum(["active", "hidden"]).optional().default("active"),
    startAt: optionalDateField,
    endAt: optionalDateField,
    extra: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .superRefine(validateTimeWindow);

export const placementItemPatchSchema = z
  .object({
    title: z.string().trim().min(1, "请填写素材标题").max(80).optional(),
    subtitle: z.string().trim().max(200, "副标题最多 200 字").nullable().optional(),
    imageUrl: optionalLinkField,
    iconKey: z.string().trim().max(64, "图标标识最多 64 字").nullable().optional(),
    linkUrl: optionalLinkField,
    badge: z.string().trim().max(200, "角标最多 200 字").nullable().optional(),
    sortOrder: z.number().int().min(0, "排序值不能为负").max(9_999, "排序值 0–9999").optional(),
    status: z.enum(["active", "hidden"]).optional(),
    startAt: optionalDateField,
    endAt: optionalDateField,
    extra: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .superRefine(validateTimeWindow);

export const placementPatchSchema = z
  .object({
    name: z.string().trim().min(1, "请填写运营位名称").max(50, "名称最多 50 字").optional(),
    enabled: z.boolean().optional(),
  })
  .refine((data) => data.name !== undefined || data.enabled !== undefined, {
    message: "至少需要提供名称或启停状态之一",
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
  /** 订单范围：enterprise=企业订单（organizationId 非空），personal=普通用户订单 */
  scope: z.enum(["enterprise", "personal"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

/** 可空日期输入：null / 空串 / 合法日期。注意 null 必须先于 coerce.date() 判定，避免被解析成 epoch。 */
const nullableDateIn = z.union([z.null(), z.literal(""), z.coerce.date()]);

/** 创建场景：未提供归一化为 null（长期有效）。 */
const nullableDateForCreate = nullableDateIn
  .optional()
  .transform((value) => (value === undefined || value === "" ? null : value));

/** 更新场景：未提供保持 undefined（不修改），空串显式清空为 null。 */
const nullableDateForPatch = nullableDateIn
  .optional()
  .transform((value) => (value === undefined ? undefined : value === "" ? null : value));

/** 可空用户 ID：null / 空串归一化为 null（表示暂由操作人代管），非空时 trim。 */
const nullableUserIdIn = z.union([z.string(), z.null()]);

/** 创建场景：未提供或空串归一化为 null。 */
const nullableUserIdForCreate = nullableUserIdIn
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  })
  .refine((value) => value === null || value.length <= 64, { message: "用户 ID 最多 64 字" });

/** 更新场景：未提供保持 undefined（不修改），空串 / null 显式清空为代管。 */
const nullableUserIdForPatch = nullableUserIdIn
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  })
  .refine((value) => value === undefined || value === null || value.length <= 64, {
    message: "用户 ID 最多 64 字",
  });

export const organizationInputSchema = z.object({
  name: z.string().trim().min(1, "请填写企业名称").max(60, "企业名称最多 60 字"),
  contractNo: z.string().trim().max(40, "合同号最多 40 字").optional().default(""),
  adminUserId: nullableUserIdForCreate,
  seats: z.number().int().min(1, "席位数至少为 1").max(10_000),
  maxConcurrency: z.number().int().min(1, "并发上限至少为 1").max(10_000),
  monthlyComputeQuota: positiveInt("月算力额度"),
  discountPct: z.number().int().min(0, "折扣不能为负").max(90, "折扣最高减免 90%"),
  expiresAt: nullableDateForCreate,
});

export const organizationPatchSchema = z.object({
  name: z.string().trim().min(1, "请填写企业名称").max(60, "企业名称最多 60 字").optional(),
  status: z.enum(["active", "suspended", "closed"]).optional(),
  contractNo: z.string().trim().max(40, "合同号最多 40 字").nullable().optional(),
  adminUserId: nullableUserIdForPatch,
  seats: z.number().int().min(1, "席位数至少为 1").max(10_000).optional(),
  maxConcurrency: z.number().int().min(1, "并发上限至少为 1").max(10_000).optional(),
  monthlyComputeQuota: positiveInt("月算力额度").optional(),
  discountPct: z.number().int().min(0, "折扣不能为负").max(90, "折扣最高减免 90%").optional(),
  expiresAt: nullableDateForPatch,
});

/** 企业成员添加：目标用户必填，原因必填 2-500 字（写入审计）。 */
export const organizationMemberInputSchema = z.object({
  userId: z.string().trim().min(1, "请选择要添加的用户").max(64, "用户 ID 最多 64 字"),
  reason: z.string().trim().min(2, "请填写添加原因").max(500, "添加原因最多 500 字"),
});

export const enterpriseOrderInputSchema = z.object({
  credits: z
    .number()
    .int("发放积分必须为整数")
    .min(1, "发放积分必须为正整数")
    .max(100_000_000, "单笔发放积分超出上限"),
  reason: z.string().trim().min(2, "请填写创建原因").max(500),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
export type OrganizationInput = z.infer<typeof organizationInputSchema>;
export type OrganizationPatch = z.infer<typeof organizationPatchSchema>;
export type OrganizationMemberInput = z.infer<typeof organizationMemberInputSchema>;
export type EnterpriseOrderInput = z.infer<typeof enterpriseOrderInputSchema>;
export type GrantInput = z.infer<typeof grantInputSchema>;
export type PlanInput = z.infer<typeof planInputSchema>;
export type RechargeTierInput = z.infer<typeof rechargeTierInputSchema>;
export type ModelInput = z.infer<typeof modelInputSchema>;
export type CreditPolicyInput = z.infer<typeof creditPolicyInputSchema>;
export type PlacementItemInput = z.infer<typeof placementItemInputSchema>;
export type PlacementItemPatch = z.infer<typeof placementItemPatchSchema>;
export type PlacementPatch = z.infer<typeof placementPatchSchema>;

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
