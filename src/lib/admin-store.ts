import { INITIAL_ADMIN_STATE } from "@/lib/admin-data";
import * as adminApi from "@/lib/admin-api-client";
import { newIdempotencyKey } from "@/lib/admin-api-client";
import type {
  AdminModelConfig,
  AdminOrganization,
  AdminOrganizationMembers,
  AdminPlacement,
  AdminPlacementItem,
  AdminPlan,
  AdminRechargeTier,
  AdminState,
  AdminUser,
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
    const [users, orders, usage, plans, tiers, models, placements, organizations, policy, logs] = await Promise.all([
      adminApi.fetchUsers({ page: 1, pageSize: 100 }),
      adminApi.fetchOrders({ page: 1, pageSize: 100 }),
      adminApi.fetchUsage({ page: 1, pageSize: 100 }),
      adminApi.fetchPlans(),
      adminApi.fetchRechargeTiers(),
      adminApi.fetchModels(),
      adminApi.fetchPlacements(),
      adminApi.fetchOrganizations({ page: 1, pageSize: 100 }),
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
      placements,
      organizations: organizations.items,
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

// ---------------------------------------------------------------------------
// 运营位写操作
// ---------------------------------------------------------------------------

/** 运营位整位更新（改名 / 启停）。 */
export async function updateAdminPlacement(
  placementId: string,
  input: { name?: string; enabled?: boolean },
): Promise<void> {
  await adminApi.patchPlacement(placementId, input, newIdempotencyKey());
  await loadAdminState();
}

/**
 * 保存运营位素材：itemId 为空时新建，否则更新。
 * extra 为运营位富字段（轮播高亮、趋势卡统计等），编辑时原样透传，不在表单中修改。
 */
export async function saveAdminPlacementItem(
  placementId: string,
  payload: adminApi.PlacementItemPayload,
  itemId?: string,
): Promise<void> {
  if (itemId) {
    await adminApi.patchPlacementItem(itemId, payload, newIdempotencyKey());
  } else {
    await adminApi.postPlacementItem(placementId, payload, newIdempotencyKey());
  }
  await loadAdminState();
}

export async function deleteAdminPlacementItem(itemId: string): Promise<void> {
  await adminApi.deletePlacementItem(itemId, newIdempotencyKey());
  await loadAdminState();
}

// ---------------------------------------------------------------------------
// 企业管理写操作
// ---------------------------------------------------------------------------

/** 保存企业配置：orgId 为空时新建，否则更新（可含状态）。 */
export async function saveAdminOrganization(
  payload: adminApi.OrganizationPayload & { status?: AdminOrganization["status"] },
  orgId?: string,
): Promise<void> {
  if (orgId) {
    await adminApi.patchOrganization(orgId, payload, newIdempotencyKey());
  } else {
    await adminApi.postOrganization(payload, newIdempotencyKey());
  }
  await loadAdminState();
}

/** 企业订单创建：返回订单号与整数分金额，供调用方提示。 */
export async function createAdminEnterpriseOrder(
  organizationId: string,
  credits: number,
  reason: string,
): Promise<adminApi.EnterpriseOrderResult> {
  const result = await adminApi.postEnterpriseOrder(
    organizationId,
    { credits, reason },
    newIdempotencyKey(),
  );
  await loadAdminState();
  return result;
}

// ---------------------------------------------------------------------------
// 企业成员管理
// ---------------------------------------------------------------------------

/** 企业成员列表（含主账号标记与席位占用）。 */
export async function fetchAdminOrganizationMembers(
  organizationId: string,
): Promise<AdminOrganizationMembers> {
  return adminApi.fetchOrganizationMembers(organizationId);
}

/** 后台用户搜索：成员管理弹框添加成员时选择目标用户。 */
export async function searchAdminUsers(q: string): Promise<adminApi.ListResult<AdminUser>> {
  return adminApi.fetchUsers({ q, page: 1, pageSize: 20 });
}

/** 添加企业成员：成功后刷新后台状态。 */
export async function addAdminOrganizationMember(
  organizationId: string,
  userId: string,
  reason: string,
): Promise<void> {
  await adminApi.postOrganizationMember(organizationId, { userId, reason }, newIdempotencyKey());
  await loadAdminState();
}

/** 移除企业成员（主账号须先更换）。 */
export async function removeAdminOrganizationMember(
  organizationId: string,
  userId: string,
): Promise<void> {
  await adminApi.deleteOrganizationMember(organizationId, userId);
  await loadAdminState();
}

/** 更换企业主账号：adminUserId 传 null 表示暂由操作人代管。 */
export async function changeAdminOrganizationAdmin(
  organizationId: string,
  adminUserId: string | null,
): Promise<void> {
  await adminApi.patchOrganization(organizationId, { adminUserId }, newIdempotencyKey());
  await loadAdminState();
}
