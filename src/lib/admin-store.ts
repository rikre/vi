import { INITIAL_ADMIN_STATE } from "@/lib/admin-data";
import * as adminApi from "@/lib/admin-api-client";
import { newIdempotencyKey } from "@/lib/admin-api-client";
import type {
  AdminModelConfig,
  AdminPlan,
  AdminRechargeTier,
  AdminState,
  AdminUserStatus,
  CreditPolicy,
  EntitlementGrant,
} from "@/types/admin";

/**
 * API-backed 管理后台状态层（替代 localStorage）。
 * - 读：首次进入后台时并行拉取全部列表，聚合为 AdminState 视图模型
 * - 写：调用 /api/admin/* 写接口（自动携带 Idempotency-Key），成功后刷新对应数据
 * - 通过 useSyncExternalStore 订阅，保留组件既有的同步读取习惯
 */

export type AdminStoreStatus = "idle" | "loading" | "ready" | "error";

type Listener = () => void;

const listeners = new Set<Listener>();
let state: AdminState = INITIAL_ADMIN_STATE;
let status: AdminStoreStatus = "idle";
let errorMessage: string | null = null;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeAdminState(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAdminState(): AdminState {
  return state;
}

export function getAdminServerState(): AdminState {
  return INITIAL_ADMIN_STATE;
}

export function getAdminStoreStatus(): AdminStoreStatus {
  return status;
}

export function getAdminStoreError(): string | null {
  return errorMessage;
}

/** 并行拉取全部后台数据并聚合为 AdminState。 */
export async function loadAdminState(): Promise<void> {
  if (status === "loading") return;
  status = "loading";
  errorMessage = null;
  emit();
  try {
    const [users, orders, usage, plans, tiers, models, policy, logs] = await Promise.all([
      adminApi.fetchUsers({ page: 1, pageSize: 100 }),
      adminApi.fetchOrders({ page: 1, pageSize: 100 }),
      adminApi.fetchUsage({ page: 1, pageSize: 100 }),
      adminApi.fetchPlans(),
      adminApi.fetchRechargeTiers(),
      adminApi.fetchModels(),
      adminApi.fetchCreditPolicy(),
      adminApi.fetchAuditLogs({ page: 1, pageSize: 50 }),
    ]);
    state = {
      users: users.items,
      orders: orders.items,
      usage: usage.items,
      plans: plans.items,
      rechargeTiers: tiers.items,
      models: models.items,
      creditPolicy: policy,
      auditLogs: logs.items,
    };
    status = "ready";
    emit();
  } catch (error) {
    status = "error";
    errorMessage = error instanceof Error ? error.message : "数据加载失败，请稍后重试";
    emit();
  }
}

export async function grantEntitlement(grant: EntitlementGrant): Promise<void> {
  const result = (await adminApi.postGrant(grant, newIdempotencyKey())) as { approvalStatus?: string; replayed?: boolean } | undefined;
  if (result?.approvalStatus === "pending") {
    throw new Error("发放金额超过大额阈值，已提交审批，未直接入账");
  }
  await loadAdminState();
}

export async function updateAdminUserStatus(
  userId: string,
  status: AdminUserStatus,
  reason: string,
): Promise<void> {
  await adminApi.patchUserStatus(userId, status, reason, newIdempotencyKey());
  await loadAdminState();
}

export async function saveAdminPlan(plan: AdminPlan): Promise<void> {
  const input: adminApi.PlanPayload = {
    id: plan.id,
    name: plan.name,
    audience: plan.audience,
    priceMonthly: plan.priceMonthly,
    priceYearlyMonthly: plan.priceYearlyMonthly,
    monthlyCredits: plan.monthlyCredits,
    seats: plan.seats,
    concurrency: plan.concurrency,
    monthlyComputeQuota: plan.monthlyComputeQuota,
    queue: plan.queue,
    features: plan.features,
    enabled: plan.enabled,
  };
  const exists = state.plans.some((candidate) => candidate.id === plan.id);
  if (exists) {
    await adminApi.patchPlan(plan.id, input, newIdempotencyKey());
  } else {
    await adminApi.postPlan(input, newIdempotencyKey());
  }
  await loadAdminState();
}

export async function saveRechargeTier(tier: AdminRechargeTier): Promise<void> {
  const input: adminApi.TierPayload = {
    id: tier.id,
    name: tier.name,
    price: tier.price,
    baseCredits: tier.baseCredits,
    bonusCredits: tier.bonusCredits,
    firstPurchaseOnly: tier.firstPurchaseOnly,
    enabled: tier.enabled,
  };
  const exists = state.rechargeTiers.some((candidate) => candidate.id === tier.id);
  if (exists) {
    await adminApi.patchTier(tier.id, input, newIdempotencyKey());
  } else {
    await adminApi.postTier(input, newIdempotencyKey());
  }
  await loadAdminState();
}

export async function saveModelConfig(model: AdminModelConfig): Promise<string> {
  const { id, apiKeyLast4, ...input } = model;
  void apiKeyLast4;
  const exists = state.models.some((candidate) => candidate.id === id);
  let modelId = id;
  if (exists) {
    await adminApi.patchModel(id, input, newIdempotencyKey());
  } else {
    const created = await adminApi.postModel(input, newIdempotencyKey());
    modelId = created.id;
  }
  await loadAdminState();
  return modelId;
}

/** 模型密钥单独提交：提交后由调用方立即清空表单中的明文。 */
export async function saveModelSecret(modelId: string, secret: string): Promise<void> {
  await adminApi.postModelSecret(modelId, secret, newIdempotencyKey());
  await loadAdminState();
}

export async function saveCreditPolicy(policy: CreditPolicy): Promise<void> {
  await adminApi.patchCreditPolicy(policy, newIdempotencyKey());
  await loadAdminState();
}
