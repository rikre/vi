import { randomUUID } from "node:crypto";
import type { Organization as DbOrganization, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { AdminApiError } from "@/lib/admin/http";
import type { AdminSession } from "@/lib/admin/session";
import {
  LARGE_GRANT_APPROVAL_THRESHOLD,
  SUPPORT_GRANT_BUCKET,
  SUPPORT_GRANT_CAP,
} from "@/lib/admin/rbac";
import { computeEnterpriseOrderPricing } from "@/lib/enterprise-pricing";
import type {
  CreditPolicyInput,
  EnterpriseOrderInput,
  GrantInput,
  ModelInput,
  OrganizationInput,
  OrganizationMemberInput,
  OrganizationPatch,
  PlanInput,
  PlacementItemInput,
  PlacementItemPatch,
  PlacementPatch,
  RechargeTierInput,
} from "@/lib/admin/validation";
import { storeModelSecret } from "@/lib/admin/secret-adapter";
import { mapModel, mapPlan, mapPlacementItem, mapPolicy, mapTier } from "@/lib/admin/mappers";
import type { CreditBucket, ModelCapability } from "@/types/admin";

type Tx = Prisma.TransactionClient;

export type MutationResult<T> = T & { replayed?: boolean };

function scopedIdempotencyKey(session: AdminSession, idempotencyKey: string | null): string {
  return `${session.userId}:${idempotencyKey ?? randomUUID()}`;
}

async function isIdempotentReplay(
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<boolean> {
  if (!idempotencyKey) return false;
  const existing = await getPrisma().adminAuditLog.findUnique({
    where: { idempotencyKey: scopedIdempotencyKey(session, idempotencyKey) },
    select: { id: true },
  });
  return existing !== null;
}

type AuditEntry = {
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
};

async function writeAudit(
  tx: Tx,
  session: AdminSession,
  entry: AuditEntry,
  idempotencyKey: string,
): Promise<void> {
  await tx.adminAuditLog.create({
    data: {
      operatorId: session.userId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      beforeSnapshot: (entry.before ?? undefined) as Prisma.InputJsonValue | undefined,
      afterSnapshot: (entry.after ?? undefined) as Prisma.InputJsonValue | undefined,
      reason: entry.reason,
      ip: session.ip,
      userAgent: session.userAgent,
      idempotencyKey,
    },
  });
}

/** 乐观锁调整积分账户余额；冲突时最多重试 3 次。 */
async function adjustCreditBalance(
  tx: Tx,
  userId: string,
  accountType: CreditBucket,
  delta: number,
): Promise<{ before: number; after: number }> {
  if (!Number.isInteger(delta) || delta === 0) {
    throw new AdminApiError(400, "INVALID_AMOUNT", "积分变动数量必须为非零整数");
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const account = await tx.creditAccount.upsert({
      where: { userId_accountType: { userId, accountType } },
      create: { userId, accountType, balance: 0 },
      update: {},
    });
    if (account.balance + delta < 0) {
      throw new AdminApiError(400, "INSUFFICIENT_BALANCE", "积分余额不足");
    }
    const updated = await tx.creditAccount.updateMany({
      where: { id: account.id, version: account.version },
      data: { balance: { increment: delta }, version: { increment: 1 } },
    });
    if (updated.count === 1) {
      return { before: account.balance, after: account.balance + delta };
    }
  }
  throw new AdminApiError(409, "CONCURRENT_CONFLICT", "账户并发冲突，请重试");
}

function isSupportOnly(session: AdminSession): boolean {
  const elevated = ["platform_admin", "enterprise_admin", "commercial_ops"];
  return session.roles.includes("support") && !session.roles.some((role) => elevated.includes(role));
}

export type GrantResult = {
  kind: GrantInput["kind"];
  approvalStatus?: "approved" | "pending";
};

/** 定向权益发放：加积分 / 配会员 / 配算力。全部走事务 + 审计 + 幂等。 */
export async function grantEntitlement(
  input: GrantInput,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<GrantResult>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { kind: input.kind, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: input.userId },
      include: { creditAccounts: true },
    });
    if (!user) throw new AdminApiError(404, "USER_NOT_FOUND", "用户不存在");

    if (input.kind === "credits") {
      const isDeduct = input.amount < 0;
      if (isSupportOnly(session)) {
        if (isDeduct) {
          throw new AdminApiError(403, "FORBIDDEN", "客服角色不可执行积分扣减");
        }
        if (input.bucket !== SUPPORT_GRANT_BUCKET) {
          throw new AdminApiError(403, "FORBIDDEN", "客服角色仅可向赠送积分账户补偿");
        }
        if (input.amount > SUPPORT_GRANT_CAP) {
          throw new AdminApiError(403, "FORBIDDEN", `客服单笔补偿上限为 ${SUPPORT_GRANT_CAP} 积分`);
        }
      }
      const policy = await tx.creditPolicy.findUnique({ where: { id: "platform" } });
      const minimumGrant = policy?.minimumGrant ?? 1;
      if (!isDeduct && input.amount < minimumGrant) {
        throw new AdminApiError(400, "INVALID_GRANT", `最低发放数量为 ${minimumGrant} 积分`);
      }

      const balancesBefore: Record<string, number> = {};
      for (const account of user.creditAccounts) {
        balancesBefore[account.accountType] = account.balance;
      }

      const needsApproval =
        !isDeduct &&
        input.amount >= LARGE_GRANT_APPROVAL_THRESHOLD &&
        !session.roles.includes("platform_admin");
      if (needsApproval) {
        await writeAudit(tx, session, {
          action: "大额积分发放待审批",
          targetType: "user",
          targetId: user.id,
          before: { balances: balancesBefore },
          reason: `拟发放 ${input.amount} 积分至 ${input.bucket} 账户：${input.reason}`,
        }, key);
        return { kind: "credits", approvalStatus: "pending" as const };
      }

      const { before, after } = await adjustCreditBalance(tx, user.id, input.bucket, input.amount);
      await tx.creditLedger.create({
        data: {
          entryType: isDeduct ? "deduct" : "grant",
          accountType: input.bucket,
          amount: input.amount,
          beforeBalance: before,
          afterBalance: after,
          userId: user.id,
          operatorId: session.userId,
          approverId: session.userId,
          approvalStatus: "approved",
          reason: input.reason,
          idempotencyKey: key,
        },
      });
      await writeAudit(tx, session, {
        action: isDeduct ? "定向积分扣减" : "定向积分发放",
        targetType: "user",
        targetId: user.id,
        before: { bucket: input.bucket, balance: before },
        after: isDeduct
          ? { bucket: input.bucket, balance: after, deducted: Math.abs(input.amount) }
          : { bucket: input.bucket, balance: after, granted: input.amount },
        reason: input.reason,
      }, key);
      return { kind: "credits", approvalStatus: "approved" as const };
    }

    if (input.kind === "membership") {
      const plan = await tx.plan.findUnique({ where: { id: input.planId } });
      if (!plan) throw new AdminApiError(404, "PLAN_NOT_FOUND", "会员方案不存在");
      if (!plan.enabled) throw new AdminApiError(400, "PLAN_DISABLED", "该套餐已停用，不可用于发放");

      const base =
        user.membershipExpiresAt && user.membershipExpiresAt.getTime() > Date.now()
          ? user.membershipExpiresAt
          : new Date();
      const expiresAt = new Date(base.getTime() + input.durationDays * 86_400_000);
      await tx.user.update({
        where: { id: user.id },
        data: {
          membershipPlanId: plan.id,
          membershipExpiresAt: expiresAt,
          maxConcurrency: plan.concurrency,
          monthlyComputeQuota: plan.monthlyComputeQuota,
        },
      });
      await writeAudit(tx, session, {
        action: "定向会员配置",
        targetType: "user",
        targetId: user.id,
        before: { planId: user.membershipPlanId, expiresAt: user.membershipExpiresAt?.toISOString() ?? null },
        after: { planId: plan.id, planName: plan.name, expiresAt: expiresAt.toISOString(), durationDays: input.durationDays },
        reason: input.reason,
      }, key);
      return { kind: "membership" };
    }

    await tx.user.update({
      where: { id: user.id },
      data: {
        maxConcurrency: input.maxConcurrency,
        monthlyComputeQuota: input.monthlyComputeQuota,
      },
    });
    await writeAudit(tx, session, {
      action: "定向算力配置",
      targetType: "user",
      targetId: user.id,
      before: { maxConcurrency: user.maxConcurrency, monthlyComputeQuota: user.monthlyComputeQuota },
      after: { maxConcurrency: input.maxConcurrency, monthlyComputeQuota: input.monthlyComputeQuota },
      reason: input.reason,
    }, key);
    return { kind: "compute" };
  });
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "risk" | "disabled",
  reason: string,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ status: "active" | "risk" | "disabled" }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { status, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new AdminApiError(404, "USER_NOT_FOUND", "用户不存在");
    await tx.user.update({ where: { id: userId }, data: { status } });
    await writeAudit(tx, session, {
      action: "用户状态变更",
      targetType: "user",
      targetId: userId,
      before: { status: user.status },
      after: { status },
      reason,
    }, key);
    return { status };
  });
}

function planData(input: PlanInput) {
  return {
    name: input.name,
    audience: input.audience,
    priceMonthlyCent: Math.round(input.priceMonthly * 100),
    priceYearlyMonthlyCent: Math.round(input.priceYearlyMonthly * 100),
    monthlyCredits: input.monthlyCredits,
    seats: input.seats,
    concurrency: input.concurrency,
    monthlyComputeQuota: input.monthlyComputeQuota,
    queue: input.queue,
    featureWhitelist: input.features,
    modelWhitelist: input.modelWhitelist ?? input.features.filter((feature) => !feature.endsWith("-export") && !["watermark-free", "priority-queue", "api-access", "private-model", "audit-export"].includes(feature)),
    enabled: input.enabled,
  };
}

/** 保存套餐：历史订单与任务不受影响（价格快照保存在订单/流水中）。 */
export async function savePlan(
  input: PlanInput,
  session: AdminSession,
  idempotencyKey: string | null,
  targetId?: string,
): Promise<MutationResult<{ id: string; created: boolean }>> {
  const id = targetId ?? input.id;
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { id, created: false, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const existing = await tx.plan.findUnique({ where: { id } });
    const data = planData(input);
    const plan = existing
      ? await tx.plan.update({ where: { id }, data: { ...data, version: { increment: 1 } } })
      : await tx.plan.create({ data: { id, ...data } });

    // 同步权益键值表（key-value 白名单）
    await tx.planEntitlement.deleteMany({ where: { planId: id } });
    if (plan.featureWhitelist.length > 0) {
      await tx.planEntitlement.createMany({
        data: plan.featureWhitelist.map((feature) => ({ planId: id, key: feature, value: "true" })),
      });
    }

    await writeAudit(tx, session, {
      action: existing ? "套餐配置更新" : "套餐创建",
      targetType: "plan",
      targetId: id,
      before: existing ? mapPlan(existing) : null,
      after: mapPlan(plan),
    }, key);
    return { id, created: !existing };
  });
}

export async function saveRechargeTier(
  input: RechargeTierInput,
  session: AdminSession,
  idempotencyKey: string | null,
  targetId?: string,
): Promise<MutationResult<{ id: string; created: boolean }>> {
  const id = targetId ?? input.id;
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { id, created: false, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const existing = await tx.rechargeTier.findUnique({ where: { id } });
    const data = {
      name: input.name,
      priceCent: Math.round(input.price * 100),
      baseCredits: input.baseCredits,
      bonusCredits: input.bonusCredits,
      firstPurchaseOnly: input.firstPurchaseOnly,
      enabled: input.enabled,
    };
    const tier = existing
      ? await tx.rechargeTier.update({ where: { id }, data: { ...data, version: { increment: 1 } } })
      : await tx.rechargeTier.create({ data: { id, ...data } });
    await writeAudit(tx, session, {
      action: existing ? "充值档位更新" : "充值档位创建",
      targetType: "recharge_tier",
      targetId: id,
      before: existing ? mapTier(existing) : null,
      after: mapTier(tier),
    }, key);
    return { id, created: !existing };
  });
}

function modelData(input: ModelInput) {
  return {
    name: input.name,
    vendor: input.vendor,
    capability: input.capability as ModelCapability,
    endpoint: input.endpoint,
    billingUnit: input.billingUnit,
    vendorCostCent: Math.round(input.vendorCost * 100),
    creditPrice: input.creditPrice,
    maxConcurrency: input.maxConcurrency,
    timeoutSeconds: input.timeoutSeconds,
    health: input.health,
    outputOptions: input.outputOptions,
    allowedPlans: input.allowedPlans,
    enabled: input.enabled,
  };
}

export async function saveModel(
  input: ModelInput,
  session: AdminSession,
  idempotencyKey: string | null,
  targetId?: string,
  modelId?: string,
): Promise<MutationResult<{ id: string; created: boolean }>> {
  const id = targetId ?? modelId ?? "";
  if (!id) throw new AdminApiError(400, "INVALID_MODEL_ID", "缺少模型 ID");
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { id, created: false, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const existing = await tx.modelConfig.findUnique({ where: { id } });
    const data = modelData(input);
    // 绝不通过本接口改写密钥字段；密钥只允许走 /models/:id/secret
    const model = existing
      ? await tx.modelConfig.update({ where: { id }, data: { ...data, version: { increment: 1 } } })
      : await tx.modelConfig.create({ data: { id, ...data } });
    await writeAudit(tx, session, {
      action: existing ? "模型配置更新" : "模型接入",
      targetType: "model",
      targetId: id,
      before: existing ? mapModel(existing) : null,
      after: mapModel(model),
    }, key);
    return { id, created: !existing };
  });
}

export async function saveModelSecret(
  modelId: string,
  secret: string,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ secretRef: string; apiKeyLast4: string }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { secretRef: "", apiKeyLast4: "", replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  const prisma = getPrisma();
  const existing = await prisma.modelConfig.findUnique({ where: { id: modelId } });
  if (!existing) throw new AdminApiError(404, "MODEL_NOT_FOUND", "模型不存在");

  // 密钥在事务外写入 KMS / 本地加密；事务内只保存引用、密文与末四位
  const stored = await storeModelSecret(modelId, secret);

  return prisma.$transaction(async (tx) => {
    const model = await tx.modelConfig.update({
      where: { id: modelId },
      data: {
        secretRef: stored.secretRef,
        secretCipher: stored.secretCipher,
        apiKeyLast4: stored.apiKeyLast4,
        version: { increment: 1 },
      },
    });
    await writeAudit(tx, session, {
      action: "模型密钥更新",
      targetType: "model",
      targetId: modelId,
      before: { secretRef: existing.secretRef, apiKeyLast4: existing.apiKeyLast4 ?? null },
      // after 快照中只有引用与末四位，绝不包含密钥明文
      after: { secretRef: model.secretRef, apiKeyLast4: model.apiKeyLast4 ?? null },
    }, key);
    return { secretRef: model.secretRef ?? stored.secretRef, apiKeyLast4: stored.apiKeyLast4 };
  });
}

export async function saveCreditPolicy(
  input: CreditPolicyInput,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ version: number }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { version: 0, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const existing = await tx.creditPolicy.findUnique({ where: { id: "platform" } });
    if (!existing) {
      throw new AdminApiError(503, "CREDIT_POLICY_NOT_FOUND", "积分策略未初始化，请运行种子脚本");
    }
    const policy = await tx.creditPolicy.update({
      where: { id: "platform" },
      data: {
        creditsPerYuan: input.creditsPerYuan,
        deductionOrder: input.deductionOrder,
        giftExpiryDays: input.giftExpiryDays,
        memberResetDay: input.memberResetDay,
        minimumGrant: input.minimumGrant,
        failedTaskRefund: input.failedTaskRefund,
        negativeBalanceAllowed: input.negativeBalanceAllowed,
        version: { increment: 1 },
      },
    });
    await writeAudit(tx, session, {
      action: "积分规则更新",
      targetType: "credit_policy",
      targetId: "platform",
      before: mapPolicy(existing),
      after: mapPolicy(policy),
    }, key);
    return { version: policy.version };
  });
}

/** 运营位整位启停 / 改名。 */
export async function updatePlacement(
  placementId: string,
  input: PlacementPatch,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ id: string; enabled: boolean; name: string }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { id: placementId, enabled: input.enabled ?? true, name: input.name ?? "", replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const existing = await tx.placement.findUnique({ where: { id: placementId } });
    if (!existing) throw new AdminApiError(404, "PLACEMENT_NOT_FOUND", "运营位不存在");
    const placement = await tx.placement.update({
      where: { id: placementId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      },
    });
    await writeAudit(tx, session, {
      action: input.enabled !== undefined && input.name === undefined ? "运营位启停" : "运营位更新",
      targetType: "placement",
      targetId: placementId,
      before: { name: existing.name, enabled: existing.enabled },
      after: { name: placement.name, enabled: placement.enabled },
    }, key);
    return { id: placement.id, enabled: placement.enabled, name: placement.name };
  });
}

function placementItemData(input: PlacementItemInput | PlacementItemPatch) {
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.subtitle !== undefined) data.subtitle = input.subtitle || null;
  if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
  if (input.iconKey !== undefined) data.iconKey = input.iconKey || null;
  if (input.linkUrl !== undefined) data.linkUrl = input.linkUrl;
  if (input.badge !== undefined) data.badge = input.badge || null;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  if (input.status !== undefined) data.status = input.status;
  if (input.startAt !== undefined) data.startAt = input.startAt;
  if (input.endAt !== undefined) data.endAt = input.endAt;
  if (input.extra !== undefined) data.extra = (input.extra ?? undefined) as Prisma.InputJsonValue | undefined;
  return data;
}

/** 运营位素材新增。 */
export async function createPlacementItem(
  placementId: string,
  input: PlacementItemInput,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ id: string }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { id: "", replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const placement = await tx.placement.findUnique({ where: { id: placementId } });
    if (!placement) throw new AdminApiError(404, "PLACEMENT_NOT_FOUND", "运营位不存在");
    const item = await tx.placementItem.create({
      data: {
        placementId,
        title: input.title,
        subtitle: input.subtitle || null,
        imageUrl: input.imageUrl,
        iconKey: input.iconKey || null,
        linkUrl: input.linkUrl,
        badge: input.badge || null,
        sortOrder: input.sortOrder,
        status: input.status,
        startAt: input.startAt,
        endAt: input.endAt,
        extra: (input.extra ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    await writeAudit(tx, session, {
      action: "运营位素材新增",
      targetType: "placement",
      targetId: placementId,
      after: mapPlacementItem(item),
    }, key);
    return { id: item.id };
  });
}

/** 运营位素材更新（含排序、上下架、定时窗口）。 */
export async function updatePlacementItem(
  itemId: string,
  input: PlacementItemPatch,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ id: string }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { id: itemId, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const existing = await tx.placementItem.findUnique({ where: { id: itemId } });
    if (!existing) throw new AdminApiError(404, "PLACEMENT_ITEM_NOT_FOUND", "运营位素材不存在");
    const item = await tx.placementItem.update({
      where: { id: itemId },
      data: placementItemData(input),
    });
    await writeAudit(tx, session, {
      action: "运营位素材更新",
      targetType: "placement",
      targetId: existing.placementId,
      before: mapPlacementItem(existing),
      after: mapPlacementItem(item),
    }, key);
    return { id: item.id };
  });
}

/** 运营位素材删除。 */
export async function deletePlacementItem(
  itemId: string,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ id: string }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { id: itemId, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const existing = await tx.placementItem.findUnique({ where: { id: itemId } });
    if (!existing) throw new AdminApiError(404, "PLACEMENT_ITEM_NOT_FOUND", "运营位素材不存在");
    await tx.placementItem.delete({ where: { id: itemId } });
    await writeAudit(tx, session, {
      action: "运营位素材删除",
      targetType: "placement",
      targetId: existing.placementId,
      before: mapPlacementItem(existing),
    }, key);
    return { id: itemId };
  });
}

// ---------------------------------------------------------------------------
// 企业管理：企业配置 / 折扣配置 / 企业订单创建
// ---------------------------------------------------------------------------

/** 审计快照中的企业字段（不含聚合数据）。 */
function orgSnapshot(org: DbOrganization) {
  return {
    name: org.name,
    status: org.status,
    contractNo: org.contractNo ?? null,
    adminUserId: org.adminUserId ?? null,
    seats: org.seats,
    maxConcurrency: org.maxConcurrency,
    monthlyComputeQuota: org.monthlyComputeQuota,
    discountPct: org.discountPct,
    expiresAt: org.expiresAt?.toISOString() ?? null,
  };
}

/** 校验企业管理员账号存在；未提供时返回 null。 */
async function ensureOrgAdmin(tx: Tx, adminUserId: string | null | undefined): Promise<string | null> {
  if (adminUserId === undefined || adminUserId === null || adminUserId === "") return null;
  const admin = await tx.user.findUnique({ where: { id: adminUserId }, select: { id: true } });
  if (!admin) throw new AdminApiError(404, "ORG_ADMIN_NOT_FOUND", "企业管理员账号不存在");
  return adminUserId;
}

/** 企业创建。 */
export async function createOrganization(
  input: OrganizationInput,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ id: string; created: boolean }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { id: "", created: false, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const adminUserId = await ensureOrgAdmin(tx, input.adminUserId ?? null);
    const org = await tx.organization.create({
      data: {
        name: input.name,
        contractNo: input.contractNo || null,
        adminUserId,
        seats: input.seats,
        maxConcurrency: input.maxConcurrency,
        monthlyComputeQuota: input.monthlyComputeQuota,
        discountPct: input.discountPct,
        expiresAt: input.expiresAt,
      },
    });
    await writeAudit(tx, session, {
      action: "企业创建",
      targetType: "organization",
      targetId: org.id,
      after: orgSnapshot(org),
    }, key);
    return { id: org.id, created: true };
  });
}

/** 企业配置与折扣更新（含状态与主账号变更）。仅更新请求中出现的字段。 */
export async function updateOrganization(
  organizationId: string,
  input: OrganizationPatch,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ id: string }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { id: organizationId, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const existing = await tx.organization.findUnique({ where: { id: organizationId } });
    if (!existing) throw new AdminApiError(404, "ORG_NOT_FOUND", "企业不存在");

    // 主账号变更：非空时必须从该企业现有成员中选择；留空（null）表示暂由操作人代管
    let adminUserId: string | null | undefined;
    if (input.adminUserId !== undefined) {
      if (input.adminUserId === null) {
        adminUserId = null;
      } else {
        const admin = await tx.user.findUnique({
          where: { id: input.adminUserId },
          select: { id: true, organizationId: true },
        });
        if (!admin) throw new AdminApiError(404, "ORG_ADMIN_NOT_FOUND", "主账号用户不存在");
        if (admin.organizationId !== organizationId) {
          throw new AdminApiError(400, "ADMIN_NOT_MEMBER", "主账号必须从该企业现有成员中选择");
        }
        adminUserId = input.adminUserId;
      }
    }
    const org = await tx.organization.update({
      where: { id: organizationId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.contractNo !== undefined ? { contractNo: input.contractNo || null } : {}),
        ...(adminUserId !== undefined ? { adminUserId } : {}),
        ...(input.seats !== undefined ? { seats: input.seats } : {}),
        ...(input.maxConcurrency !== undefined ? { maxConcurrency: input.maxConcurrency } : {}),
        ...(input.monthlyComputeQuota !== undefined ? { monthlyComputeQuota: input.monthlyComputeQuota } : {}),
        ...(input.discountPct !== undefined ? { discountPct: input.discountPct } : {}),
        ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
      },
    });
    await writeAudit(tx, session, {
      action: "企业配置更新",
      targetType: "organization",
      targetId: org.id,
      before: orgSnapshot(existing),
      after: orgSnapshot(org),
    }, key);
    return { id: org.id };
  });
}

/**
 * 添加企业成员：事务内校验企业状态、用户状态、归属冲突与席位上限。
 * 审计 after 快照包含 userId / nickname / memberCount。
 */
export async function addOrganizationMember(
  organizationId: string,
  input: OrganizationMemberInput,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ memberCount: number }>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return { memberCount: 0, replayed: true };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const org = await tx.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new AdminApiError(404, "ORG_NOT_FOUND", "企业不存在");
    if (org.status === "closed") {
      throw new AdminApiError(400, "ORG_CLOSED", "企业已关闭，不可添加成员");
    }
    const user = await tx.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new AdminApiError(404, "USER_NOT_FOUND", "用户不存在");
    if (user.status !== "active") {
      throw new AdminApiError(400, "USER_NOT_ACTIVE", "仅可添加状态正常的用户");
    }
    if (user.organizationId !== null) {
      throw new AdminApiError(
        409,
        "ENTERPRISE_MEMBERSHIP_CONFLICT",
        user.organizationId === organizationId
          ? "该用户已是本企业成员"
          : "该用户已归属其他企业，请先将其移出原企业",
      );
    }
    const memberCount = await tx.user.count({ where: { organizationId } });
    if (memberCount + 1 > org.seats) {
      throw new AdminApiError(400, "SEATS_EXCEEDED", `企业席位已满（${memberCount}/${org.seats}），请先扩充席位`);
    }
    await tx.user.update({ where: { id: user.id }, data: { organizationId } });
    await writeAudit(tx, session, {
      action: "企业成员添加",
      targetType: "organization",
      targetId: organizationId,
      before: { userId: user.id, nickname: user.nickname, memberCount },
      after: { userId: user.id, nickname: user.nickname, memberCount: memberCount + 1, seats: org.seats },
      reason: input.reason,
    }, key);
    return { memberCount: memberCount + 1 };
  });
}

/**
 * 移除企业成员：主账号必须先更换（否则 400 ADMIN_MEMBER_REQUIRED）。
 * 天然幂等：目标不是本企业成员时返回 404 MEMBER_NOT_FOUND，重复调用以 404 表示已完成移除。
 */
export async function removeOrganizationMember(
  organizationId: string,
  userId: string,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<{ memberCount: number }>> {
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const org = await tx.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new AdminApiError(404, "ORG_NOT_FOUND", "企业不存在");
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || user.organizationId !== organizationId) {
      throw new AdminApiError(404, "MEMBER_NOT_FOUND", "该用户不是本企业成员");
    }
    if (org.adminUserId === userId) {
      throw new AdminApiError(400, "ADMIN_MEMBER_REQUIRED", "主账号不可移除，请先更换企业主账号");
    }
    await tx.user.update({ where: { id: userId }, data: { organizationId: null } });
    const memberCount = await tx.user.count({ where: { organizationId } });
    await writeAudit(tx, session, {
      action: "企业成员移除",
      targetType: "organization",
      targetId: organizationId,
      before: { userId: user.id, nickname: user.nickname, memberCount: memberCount + 1 },
      after: { userId: user.id, nickname: user.nickname, memberCount },
    }, key);
    return { memberCount };
  });
}

function generateOrderId(): string {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `ORD${stamp}${now.getTime().toString(36).toUpperCase()}${randomUUID().slice(0, 4).toUpperCase()}`;
}

export type EnterpriseOrderResult = {
  orderId: string;
  organizationId: string;
  userId: string;
  credits: number;
  originalCent: number;
  amountCent: number;
  discountPct: number;
};

/**
 * 企业订单创建：线下对公收款核销后由管理侧建单并即时发放企业积分。
 * 事务内完成：建单（含价格快照）→ 乐观锁发放企业积分 → 账本留痕 → 企业余额累加 → 审计。
 */
export async function createEnterpriseOrder(
  input: EnterpriseOrderInput,
  organizationId: string,
  session: AdminSession,
  idempotencyKey: string | null,
): Promise<MutationResult<EnterpriseOrderResult>> {
  if (await isIdempotentReplay(session, idempotencyKey)) {
    return {
      orderId: "", organizationId, userId: "", credits: input.credits,
      originalCent: 0, amountCent: 0, discountPct: 0, replayed: true,
    };
  }
  const key = scopedIdempotencyKey(session, idempotencyKey);
  return getPrisma().$transaction(async (tx) => {
    const org = await tx.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new AdminApiError(404, "ORG_NOT_FOUND", "企业不存在");
    if (org.status !== "active") {
      throw new AdminApiError(400, "ORG_NOT_ACTIVE", "企业已停用或关闭，不可创建订单");
    }

    // 订单归属：优先企业管理员；未配置管理员时落到当前操作人并在审计中注明
    let orderUserId = org.adminUserId;
    let fallbackNote = "";
    if (orderUserId) {
      const admin = await tx.user.findUnique({ where: { id: orderUserId }, select: { id: true } });
      if (!admin) throw new AdminApiError(404, "ORG_ADMIN_NOT_FOUND", "企业管理员账号不存在");
    } else {
      orderUserId = session.userId;
      fallbackNote = "（企业未配置管理员，订单归属当前操作人）";
    }

    const policy = await tx.creditPolicy.findUnique({ where: { id: "platform" } });
    if (!policy) {
      throw new AdminApiError(503, "CREDIT_POLICY_NOT_FOUND", "积分策略未初始化，请运行种子脚本");
    }

    // 整数分定价：原价 = credits×100/creditsPerYuan，折后 = credits×(100-discountPct)/creditsPerYuan
    const { originalCent, amountCent } = computeEnterpriseOrderPricing(
      input.credits,
      policy.creditsPerYuan,
      org.discountPct,
    );
    const now = new Date();
    const order = await tx.order.create({
      data: {
        id: generateOrderId(),
        userId: orderUserId,
        category: "enterprise",
        status: "paid",
        amountCent,
        credits: input.credits,
        channel: "bank",
        productSnapshot: {
          name: `企业积分充值 · ${org.name}`,
          credits: input.credits,
          discountPct: org.discountPct,
          originalCent,
        },
        priceSnapshot: { perYuan: policy.creditsPerYuan },
        paidAt: now,
        organizationId: org.id,
      },
    });

    // 发放企业积分（乐观锁）+ 账本留痕；entryType=grant 与管理侧定向发放语义一致
    const { before, after } = await adjustCreditBalance(tx, orderUserId, "enterprise", input.credits);
    await tx.creditLedger.create({
      data: {
        entryType: "grant",
        accountType: "enterprise",
        amount: input.credits,
        beforeBalance: before,
        afterBalance: after,
        userId: orderUserId,
        orderId: order.id,
        operatorId: session.userId,
        approverId: session.userId,
        approvalStatus: "approved",
        reason: `企业订单 ${order.id}：${input.reason}`,
        idempotencyKey: key,
      },
    });

    // 企业维度积分余额同步累加（企业订单累计发放口径）
    await tx.organization.update({
      where: { id: org.id },
      data: { creditBalance: { increment: input.credits } },
    });

    await writeAudit(tx, session, {
      action: "企业订单创建",
      targetType: "organization",
      targetId: org.id,
      before: { creditBalance: org.creditBalance },
      after: {
        orgId: org.id,
        orderId: order.id,
        userId: orderUserId,
        credits: input.credits,
        amountCent,
        originalCent,
        discountPct: org.discountPct,
        creditBalance: org.creditBalance + input.credits,
      },
      reason: `${input.reason}${fallbackNote}`,
    }, key);

    return {
      orderId: order.id,
      organizationId: org.id,
      userId: orderUserId,
      credits: input.credits,
      originalCent,
      amountCent,
      discountPct: org.discountPct,
    };
  });
}
