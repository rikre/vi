import type {
  AdminModelConfig,
  AdminOrder,
  AdminPlan,
  AdminRechargeTier,
  AdminUser,
  AdminUserStatus,
  CreditPolicy,
  EntitlementGrant,
  UsageLedgerItem,
} from "@/types/admin";

/** 管理后台 API 客户端错误：携带 HTTP 状态码与后端 code。 */
export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

type ApiEnvelope<T> = { data: T } | { error: { code: string; message: string } };

export type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type DashboardData = {
  totalUsers: number;
  paidUsers: number;
  revenueYuan: number;
  refundedYuan: number;
  consumedCredits: number;
  vendorCostYuan: number;
  grossMarginPercent: number;
  enabledPlans: number;
  enabledTiers: number;
  healthyModels: number;
  totalModels: number;
  enterpriseUsers: number;
  riskUsers: number;
  recentAuditCount: number;
};

type QueryParams = Record<string, string | number | undefined>;

function buildQuery(params?: QueryParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  const response = await fetch(`/api/admin${path}`, {
    ...init,
    headers: { ...headers, ...init.headers },
    credentials: "same-origin",
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload || "error" in payload) {
    const message =
      payload && "error" in payload ? payload.error.message : `请求失败（HTTP ${response.status}）`;
    const code = payload && "error" in payload ? payload.error.code : "UNKNOWN";
    throw new AdminApiError(response.status, code, message);
  }
  return payload.data;
}

export function newIdempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// 读接口
// ---------------------------------------------------------------------------

export function fetchDashboard(): Promise<DashboardData> {
  return request<DashboardData>("/dashboard");
}

export function fetchUsers(params?: QueryParams): Promise<ListResult<AdminUser>> {
  return request<ListResult<AdminUser>>(`/users${buildQuery(params)}`);
}

export function fetchUser(id: string): Promise<AdminUser> {
  return request<AdminUser>(`/users/${encodeURIComponent(id)}`);
}

export function fetchOrders(params?: QueryParams): Promise<ListResult<AdminOrder>> {
  return request<ListResult<AdminOrder>>(`/orders${buildQuery(params)}`);
}

export function fetchUsage(params?: QueryParams): Promise<ListResult<UsageLedgerItem>> {
  return request<ListResult<UsageLedgerItem>>(`/usage-ledger${buildQuery(params)}`);
}

export function fetchPlans(): Promise<{ items: AdminPlan[] }> {
  return request<{ items: AdminPlan[] }>("/plans");
}

export function fetchRechargeTiers(): Promise<{ items: AdminRechargeTier[] }> {
  return request<{ items: AdminRechargeTier[] }>("/recharge-tiers");
}

export function fetchModels(): Promise<{ items: AdminModelConfig[] }> {
  return request<{ items: AdminModelConfig[] }>("/models");
}

export function fetchCreditPolicy(): Promise<CreditPolicy> {
  return request<CreditPolicy>("/credit-policy");
}

export function fetchAuditLogs(params?: QueryParams): Promise<ListResult<AdminAuditLogView>> {
  return request<ListResult<AdminAuditLogView>>(`/audit-logs${buildQuery(params)}`);
}

export type AdminAuditLogView = {
  id: string;
  operator: string;
  action: string;
  target: string;
  detail: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// 写接口（全部携带 Idempotency-Key）
// ---------------------------------------------------------------------------

export function postGrant(grant: EntitlementGrant, idempotencyKey: string): Promise<unknown> {
  return request<unknown>(`/users/${encodeURIComponent(grant.userId)}/grants`, {
    method: "POST",
    body: JSON.stringify(grant),
    idempotencyKey,
  });
}

export function patchUserStatus(
  userId: string,
  status: AdminUserStatus,
  reason: string,
  idempotencyKey: string,
): Promise<unknown> {
  return request<unknown>(`/users/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
    idempotencyKey,
  });
}

export function postPlan(input: PlanPayload, idempotencyKey: string): Promise<unknown> {
  return request<unknown>("/plans", {
    method: "POST",
    body: JSON.stringify(input),
    idempotencyKey,
  });
}

export function patchPlan(id: string, input: PlanPayload, idempotencyKey: string): Promise<unknown> {
  return request<unknown>(`/plans/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    idempotencyKey,
  });
}

export type PlanPayload = {
  id: string;
  name: string;
  audience: AdminPlan["audience"];
  priceMonthly: number;
  priceYearlyMonthly: number;
  monthlyCredits: number;
  seats: number;
  concurrency: number;
  monthlyComputeQuota: number;
  queue: AdminPlan["queue"];
  features: string[];
  enabled: boolean;
};

export type TierPayload = {
  id: string;
  name: string;
  price: number;
  baseCredits: number;
  bonusCredits: number;
  firstPurchaseOnly: boolean;
  enabled: boolean;
};

export function postTier(input: TierPayload, idempotencyKey: string): Promise<unknown> {
  return request<unknown>("/recharge-tiers", {
    method: "POST",
    body: JSON.stringify(input),
    idempotencyKey,
  });
}

export function patchTier(id: string, input: TierPayload, idempotencyKey: string): Promise<unknown> {
  return request<unknown>(`/recharge-tiers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    idempotencyKey,
  });
}

export type ModelPayload = Omit<AdminModelConfig, "id" | "apiKeyLast4">;

export function postModel(
  input: ModelPayload,
  idempotencyKey: string,
): Promise<{ id: string; created: boolean }> {
  return request<{ id: string; created: boolean }>("/models", {
    method: "POST",
    body: JSON.stringify(input),
    idempotencyKey,
  });
}

export function patchModel(id: string, input: ModelPayload, idempotencyKey: string): Promise<unknown> {
  return request<unknown>(`/models/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    idempotencyKey,
  });
}

export function postModelSecret(
  id: string,
  secret: string,
  idempotencyKey: string,
): Promise<{ secretRef: string; apiKeyLast4: string }> {
  return request<{ secretRef: string; apiKeyLast4: string }>(
    `/models/${encodeURIComponent(id)}/secret`,
    { method: "POST", body: JSON.stringify({ secret }), idempotencyKey },
  );
}

export function patchCreditPolicy(
  input: CreditPolicy,
  idempotencyKey: string,
): Promise<unknown> {
  return request<unknown>("/credit-policy", {
    method: "PATCH",
    body: JSON.stringify(input),
    idempotencyKey,
  });
}
