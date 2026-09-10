export type AdminUserStatus = "active" | "disabled" | "risk";
export type CreditBucket = "recharge" | "member" | "gift" | "enterprise";
export type PlanAudience = "personal" | "team" | "enterprise";
export type ModelCapability = "video" | "image" | "audio" | "text";

export type AdminUser = {
  id: string;
  nickname: string;
  contact: string;
  organization: string | null;
  registeredAt: string;
  lastActiveAt: string;
  status: AdminUserStatus;
  membership: {
    planId: string | null;
    planName: string;
    expiresAt: string | null;
  };
  balances: Record<CreditBucket, number>;
  lifetimePaid: number;
  lifetimeConsumed: number;
  taskCount: number;
  maxConcurrency: number;
  monthlyComputeQuota: number;
  featureWhitelist: string[];
};

export type AdminOrder = {
  id: string;
  userId: string;
  product: string;
  category: "recharge" | "membership" | "enterprise";
  amount: number;
  credits: number;
  status: "paid" | "refunded" | "pending" | "closed";
  channel: "wechat" | "alipay" | "bank" | "balance";
  paidAt: string;
};

export type UsageLedgerItem = {
  id: string;
  userId: string;
  modelId: string;
  modelName: string;
  taskType: string;
  units: string;
  credits: number;
  cost: number;
  status: "success" | "failed" | "refunded";
  project: string;
  createdAt: string;
};

export type AdminPlan = {
  id: string;
  name: string;
  audience: PlanAudience;
  priceMonthly: number;
  priceYearlyMonthly: number;
  monthlyCredits: number;
  seats: number;
  concurrency: number;
  monthlyComputeQuota: number;
  queue: "standard" | "priority" | "dedicated";
  features: string[];
  enabled: boolean;
};

export type AdminRechargeTier = {
  id: string;
  name: string;
  price: number;
  baseCredits: number;
  bonusCredits: number;
  firstPurchaseOnly: boolean;
  enabled: boolean;
};

export type AdminModelConfig = {
  id: string;
  name: string;
  vendor: string;
  capability: ModelCapability;
  endpoint: string;
  apiKeyLast4: string;
  enabled: boolean;
  health: "healthy" | "degraded" | "offline";
  billingUnit: string;
  vendorCost: number;
  creditPrice: number;
  maxConcurrency: number;
  timeoutSeconds: number;
  outputOptions: string[];
  allowedPlans: string[];
};

export type CreditPolicy = {
  creditsPerYuan: number;
  deductionOrder: CreditBucket[];
  giftExpiryDays: number;
  memberResetDay: number;
  minimumGrant: number;
  failedTaskRefund: boolean;
  negativeBalanceAllowed: boolean;
};

export type AdminAuditLog = {
  id: string;
  operator: string;
  action: string;
  target: string;
  detail: string;
  createdAt: string;
};

export type AdminState = {
  users: AdminUser[];
  orders: AdminOrder[];
  usage: UsageLedgerItem[];
  plans: AdminPlan[];
  rechargeTiers: AdminRechargeTier[];
  models: AdminModelConfig[];
  creditPolicy: CreditPolicy;
  auditLogs: AdminAuditLog[];
};

export type EntitlementGrant =
  | {
      kind: "credits";
      userId: string;
      bucket: CreditBucket;
      amount: number;
      reason: string;
    }
  | {
      kind: "membership";
      userId: string;
      planId: string;
      durationDays: number;
      reason: string;
    }
  | {
      kind: "compute";
      userId: string;
      maxConcurrency: number;
      monthlyComputeQuota: number;
      reason: string;
    };
