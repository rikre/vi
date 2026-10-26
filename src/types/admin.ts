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
  /** 企业订单归属企业名称；null = 普通用户订单 */
  organization: string | null;
  /** 企业订单折扣（减免百分比，来自商品快照）；null = 非企业订单 */
  discountPct: number | null;
};

export type AdminOrganization = {
  id: string;
  name: string;
  status: "active" | "suspended" | "closed";
  contractNo: string | null;
  adminUserId: string | null;
  adminNickname: string | null;
  seats: number;
  creditBalance: number;
  maxConcurrency: number;
  monthlyComputeQuota: number;
  discountPct: number;
  expiresAt: string | null;
  createdAt: string;
  memberCount: number;
  orderCount: number;
  /** 企业订单累计实收（分） */
  orderAmountCent: number;
};

/** 企业成员（成员管理弹框视图，含主账号标记）。 */
export type AdminOrganizationMember = {
  id: string;
  nickname: string;
  contact: string;
  registeredAt: string;
  status: AdminUserStatus;
  /** 是否为该企业主账号（企业管理员） */
  isAdmin: boolean;
};

/** 企业成员列表聚合：企业概要 + 成员明细。 */
export type AdminOrganizationMembers = {
  organizationId: string;
  organizationName: string;
  status: AdminOrganization["status"];
  seats: number;
  memberCount: number;
  adminUserId: string | null;
  adminNickname: string | null;
  items: AdminOrganizationMember[];
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
  /** 积分类操作的带符号变动量（发放为正、扣减为负），非积分操作为 null。 */
  amount: number | null;
};

export type AdminPlacementType = "carousel" | "single" | "list";

export type AdminPlacementItem = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  iconKey: string | null;
  linkUrl: string | null;
  badge: string | null;
  sortOrder: number;
  status: "active" | "hidden";
  startAt: string | null;
  endAt: string | null;
  extra: Record<string, unknown> | null;
};

export type AdminPlacement = {
  id: string;
  name: string;
  type: AdminPlacementType;
  enabled: boolean;
  items: AdminPlacementItem[];
};

export type AdminState = {
  users: AdminUser[];
  orders: AdminOrder[];
  usage: UsageLedgerItem[];
  plans: AdminPlan[];
  rechargeTiers: AdminRechargeTier[];
  models: AdminModelConfig[];
  placements: AdminPlacement[];
  organizations: AdminOrganization[];
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
