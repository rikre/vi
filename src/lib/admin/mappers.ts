import type {
  AdminAuditLog as DbAuditLog,
  ModelConfig as DbModel,
  CreditPolicy as DbPolicy,
  Order as DbOrder,
  Plan as DbPlan,
  RechargeTier as DbTier,
  UsageLedger as DbUsage,
  User as DbUser,
} from "@prisma/client";
import type {
  AdminAuditLog,
  AdminModelConfig,
  AdminOrder,
  AdminPlan,
  AdminRechargeTier,
  AdminUser,
  CreditBucket,
  CreditPolicy,
  UsageLedgerItem,
} from "@/types/admin";

const DEFAULT_FEATURES = ["seedance-2.0"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function jsonString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export type UserAggregates = {
  lifetimePaidCent: Map<string, number>;
  lifetimeConsumed: Map<string, number>;
  taskCount: Map<string, number>;
};

type UserRow = DbUser & {
  creditAccounts: { accountType: string; balance: number }[];
  organization: { name: string } | null;
};

export function mapUser(
  row: UserRow,
  planNameById: Map<string, string>,
  planFeaturesById: Map<string, string[]>,
  aggregates: UserAggregates,
): AdminUser {
  const balances: Record<CreditBucket, number> = { recharge: 0, member: 0, gift: 0, enterprise: 0 };
  for (const account of row.creditAccounts) {
    if (account.accountType in balances) {
      balances[account.accountType as CreditBucket] = account.balance;
    }
  }
  const planId = row.membershipPlanId;
  const planName = planId ? planNameById.get(planId) ?? null : null;
  const features = planId ? planFeaturesById.get(planId) ?? DEFAULT_FEATURES : DEFAULT_FEATURES;
  return {
    id: row.id,
    nickname: row.nickname,
    contact: row.phone ?? row.email ?? "—",
    organization: row.organization?.name ?? null,
    registeredAt: formatDateTime(row.registeredAt),
    lastActiveAt: formatDateTime(row.lastActiveAt),
    status: row.status,
    membership: {
      planId,
      planName: planName ?? "普通用户",
      expiresAt: row.membershipExpiresAt ? formatDate(row.membershipExpiresAt) : null,
    },
    balances,
    lifetimePaid: Math.round((aggregates.lifetimePaidCent.get(row.id) ?? 0) / 100),
    lifetimeConsumed: aggregates.lifetimeConsumed.get(row.id) ?? 0,
    taskCount: aggregates.taskCount.get(row.id) ?? 0,
    maxConcurrency: row.maxConcurrency,
    monthlyComputeQuota: row.monthlyComputeQuota,
    featureWhitelist: features,
  };
}

export function mapOrder(row: DbOrder): AdminOrder {
  const product = row.productSnapshot as { name?: unknown };
  return {
    id: row.id,
    userId: row.userId,
    product: jsonString(product?.name, "未知商品"),
    category: row.category,
    amount: row.amountCent / 100,
    credits: row.credits,
    status: row.status,
    channel: row.channel,
    paidAt: row.paidAt ? formatDateTime(row.paidAt) : "—",
  };
}

export function mapUsage(row: DbUsage, modelNameById: Map<string, string>): UsageLedgerItem {
  return {
    id: row.taskId,
    userId: row.userId,
    modelId: row.modelId,
    modelName: modelNameById.get(row.modelId) ?? row.modelId,
    taskType: row.taskType,
    units: row.units,
    credits: row.credits,
    cost: row.vendorCostCent / 100,
    status: row.status,
    project: row.projectName ?? "非项目生成",
    createdAt: formatDateTime(row.createdAt),
  };
}

export function mapPlan(row: DbPlan): AdminPlan {
  return {
    id: row.id,
    name: row.name,
    audience: row.audience,
    priceMonthly: row.priceMonthlyCent / 100,
    priceYearlyMonthly: row.priceYearlyMonthlyCent / 100,
    monthlyCredits: row.monthlyCredits,
    seats: row.seats,
    concurrency: row.concurrency,
    monthlyComputeQuota: row.monthlyComputeQuota,
    queue: row.queue,
    features: row.featureWhitelist,
    enabled: row.enabled,
  };
}

export function mapTier(row: DbTier): AdminRechargeTier {
  return {
    id: row.id,
    name: row.name,
    price: row.priceCent / 100,
    baseCredits: row.baseCredits,
    bonusCredits: row.bonusCredits,
    firstPurchaseOnly: row.firstPurchaseOnly,
    enabled: row.enabled,
  };
}

export function mapModel(row: DbModel): AdminModelConfig {
  return {
    id: row.id,
    name: row.name,
    vendor: row.vendor,
    capability: row.capability,
    endpoint: row.endpoint,
    apiKeyLast4: row.apiKeyLast4 ?? "",
    enabled: row.enabled,
    health: row.health,
    billingUnit: row.billingUnit,
    vendorCost: row.vendorCostCent / 100,
    creditPrice: row.creditPrice,
    maxConcurrency: row.maxConcurrency,
    timeoutSeconds: row.timeoutSeconds,
    outputOptions: row.outputOptions,
    allowedPlans: row.allowedPlans,
  };
}

export function mapPolicy(row: DbPolicy): CreditPolicy {
  const order = row.deductionOrder.filter((bucket): bucket is CreditBucket =>
    (["recharge", "member", "gift", "enterprise"] as const).includes(bucket as CreditBucket),
  );
  return {
    creditsPerYuan: row.creditsPerYuan,
    deductionOrder: order.length === 4 ? order : ["gift", "member", "enterprise", "recharge"],
    giftExpiryDays: row.giftExpiryDays,
    memberResetDay: row.memberResetDay,
    minimumGrant: row.minimumGrant,
    failedTaskRefund: row.failedTaskRefund,
    negativeBalanceAllowed: row.negativeBalanceAllowed,
  };
}

export function mapAuditLog(
  row: DbAuditLog & { operator: { nickname: string } | null },
): AdminAuditLog {
  const detail =
    row.reason ??
    (row.afterSnapshot ? JSON.stringify(row.afterSnapshot).slice(0, 200) : "无详情");
  return {
    id: row.id,
    operator: row.operator?.nickname ?? row.operatorId,
    action: row.action,
    target: row.targetType === row.targetId ? row.targetId : `${row.targetType}:${row.targetId}`,
    detail,
    createdAt: formatDateTime(row.createdAt),
  };
}
