import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { AdminApiError } from "@/lib/admin/http";
import type { AdminSession } from "@/lib/admin/session";
import {
  LARGE_GRANT_APPROVAL_THRESHOLD,
  SUPPORT_GRANT_BUCKET,
  SUPPORT_GRANT_CAP,
} from "@/lib/admin/rbac";
import type {
  CreditPolicyInput,
  GrantInput,
  ModelInput,
  PlanInput,
  RechargeTierInput,
} from "@/lib/admin/validation";
import { storeModelSecret } from "@/lib/admin/secret-adapter";
import { mapModel, mapPlan, mapPolicy, mapTier } from "@/lib/admin/mappers";
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
      if (isSupportOnly(session)) {
        if (input.bucket !== SUPPORT_GRANT_BUCKET) {
          throw new AdminApiError(403, "FORBIDDEN", "客服角色仅可向赠送积分账户补偿");
        }
        if (input.amount > SUPPORT_GRANT_CAP) {
          throw new AdminApiError(403, "FORBIDDEN", `客服单笔补偿上限为 ${SUPPORT_GRANT_CAP} 积分`);
        }
      }
      const policy = await tx.creditPolicy.findUnique({ where: { id: "platform" } });
      const minimumGrant = policy?.minimumGrant ?? 1;
      if (input.amount < minimumGrant) {
        throw new AdminApiError(400, "INVALID_GRANT", `最低发放数量为 ${minimumGrant} 积分`);
      }

      const balancesBefore: Record<string, number> = {};
      for (const account of user.creditAccounts) {
        balancesBefore[account.accountType] = account.balance;
      }

      const needsApproval =
        input.amount >= LARGE_GRANT_APPROVAL_THRESHOLD && !session.roles.includes("platform_admin");
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
          entryType: "grant",
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
        action: "定向积分发放",
        targetType: "user",
        targetId: user.id,
        before: { bucket: input.bucket, balance: before },
        after: { bucket: input.bucket, balance: after, granted: input.amount },
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
