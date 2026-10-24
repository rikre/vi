/**
 * 生成任务积分计费：扣减 / 退款 / 用量记账。
 * 复用 admin 既有设施：computeDeductionSplit 扣减顺序纯函数、
 * CreditAccount 乐观锁、CreditLedger 追加账本与 UsageLedger 用量流水。
 * 扣减整体在单事务内完成：余额读取、分桶拆分与账本写入要么全部生效要么全部回滚。
 */

import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { AdminApiError } from "@/lib/admin/http";
import { computeDeductionSplit, InsufficientBalanceError } from "@/lib/admin/credit";
import type { CreditBucket } from "@/types/admin";
import type { VideoModelRuntime } from "@/lib/generation/model-secret";

type Tx = Prisma.TransactionClient;

type Balances = Partial<Record<CreditBucket, number>>;

/** 事务内乐观锁调整积分账户余额；冲突时最多重试 3 次（与 admin/mutations 同规则）。 */
async function adjustBalanceInTx(
  tx: Tx,
  userId: string,
  accountType: CreditBucket,
  delta: number,
  allowNegative: boolean,
): Promise<{ before: number; after: number }> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const account = await tx.creditAccount.upsert({
      where: { userId_accountType: { userId, accountType } },
      create: { userId, accountType, balance: 0 },
      update: {},
    });
    if (!allowNegative && account.balance + delta < 0) {
      throw new AdminApiError(402, "INSUFFICIENT_BALANCE", "积分余额不足");
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

async function readBalancesInTx(tx: Tx, userId: string): Promise<Balances> {
  const accounts = await tx.creditAccount.findMany({ where: { userId } });
  const balances: Balances = {};
  for (const account of accounts) {
    balances[account.accountType as CreditBucket] = account.balance;
  }
  return balances;
}

/** 按策略顺序扣减生成积分，写入 consume 账本，返回账本键。免费模型（0 积分）直接跳过。 */
export async function chargeGenerationCredits(userId: string, credits: number): Promise<string | null> {
  if (credits <= 0) return null;
  const ledgerKey = randomUUID();

  await getPrisma().$transaction(async (tx) => {
    const policy = await tx.creditPolicy.findUnique({ where: { id: "platform" } });
    if (!policy) {
      throw new AdminApiError(503, "CREDIT_POLICY_NOT_FOUND", "积分策略未初始化，请运行种子脚本");
    }

    let steps;
    try {
      steps = computeDeductionSplit(
        await readBalancesInTx(tx, userId),
        credits,
        policy.deductionOrder as CreditBucket[],
        policy.negativeBalanceAllowed,
      );
    } catch (error) {
      if (error instanceof InsufficientBalanceError) {
        throw new AdminApiError(402, "INSUFFICIENT_BALANCE", error.message);
      }
      throw error;
    }

    for (const step of steps) {
      const { before, after } = await adjustBalanceInTx(
        tx,
        userId,
        step.accountType,
        -step.amount,
        policy.negativeBalanceAllowed,
      );
      await tx.creditLedger.create({
        data: {
          entryType: "consume",
          accountType: step.accountType,
          amount: -step.amount,
          beforeBalance: before,
          afterBalance: after,
          userId,
          reason: "视频生成消耗",
          idempotencyKey: `${ledgerKey}:${step.accountType}`,
        },
      });
    }
  });

  return ledgerKey;
}

/** 事务内按 consume 账本逐笔回补；以 refund 账本键唯一约束保证幂等。 */
async function refundEntriesInTx(
  tx: Tx,
  userId: string,
  entries: {
    idempotencyKey: string | null;
    accountType: CreditBucket;
    amount: number;
  }[],
  taskId: string | null,
  reason: string,
): Promise<void> {
  for (const entry of entries) {
    const { before, after } = await adjustBalanceInTx(tx, userId, entry.accountType, -entry.amount, true);
    await tx.creditLedger.create({
      data: {
        entryType: "refund",
        accountType: entry.accountType,
        amount: -entry.amount,
        beforeBalance: before,
        afterBalance: after,
        userId,
        taskId: taskId ?? undefined,
        reason,
        idempotencyKey: `${entry.idempotencyKey ?? randomUUID()}:refund:${taskId ?? "submit"}`,
      },
    });
  }
}

/** 提交外部生成失败：全额回补本次扣减（未产生真实用量，不记 UsageLedger）。 */
export async function refundFailedSubmit(userId: string, ledgerKey: string): Promise<void> {
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const entries = await tx.creditLedger.findMany({
      where: { userId, idempotencyKey: { startsWith: `${ledgerKey}:` }, entryType: "consume" },
      orderBy: { createdAt: "asc" },
    });
    await refundEntriesInTx(
      tx,
      userId,
      entries.map((entry) => ({
        idempotencyKey: entry.idempotencyKey,
        accountType: entry.accountType as CreditBucket,
        amount: entry.amount,
      })),
      null,
      "生成任务提交失败退款",
    );
  });
}

/**
 * 任务终态失败退款：按策略 failedTaskRefund 决定是否回补。
 * 以 UsageLedger.status=refunded 做幂等闸门，重复轮询不会重复退款。
 */
export async function refundFailedTask(taskId: string): Promise<void> {
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const policy = await tx.creditPolicy.findUnique({ where: { id: "platform" } });
    if (!policy?.failedTaskRefund) return;

    const claimed = await tx.usageLedger.updateMany({
      where: { taskId, status: { not: "refunded" } },
      data: { status: "refunded" },
    });
    if (claimed.count === 0) return; // 已退款或无流水（幂等）

    const entries = await tx.creditLedger.findMany({
      where: { taskId, entryType: "consume" },
      orderBy: { createdAt: "asc" },
    });
    for (const entry of entries) {
      const bucket = entry.accountType as CreditBucket;
      const { before, after } = await adjustBalanceInTx(tx, entry.userId, bucket, -entry.amount, true);
      await tx.creditLedger.create({
        data: {
          entryType: "refund",
          accountType: entry.accountType,
          amount: -entry.amount,
          beforeBalance: before,
          afterBalance: after,
          userId: entry.userId,
          taskId,
          reason: "生成任务失败退款",
          idempotencyKey: `${entry.idempotencyKey}:refund:${taskId}`,
        },
      });
    }
  });
}

/** 任务提交成功后写用量流水（价格快照），并把 taskId 回填到 consume 账本。 */
export async function recordGenerationUsage(params: {
  taskId: string;
  userId: string;
  model: VideoModelRuntime;
  credits: number;
  ledgerKey: string | null;
}): Promise<void> {
  const { taskId, userId, model, credits, ledgerKey } = params;
  await getPrisma().$transaction(async (tx) => {
    await tx.usageLedger.create({
      data: {
        id: randomUUID(),
        taskId,
        userId,
        taskType: "video",
        modelId: model.id,
        modelConfigVersion: model.version,
        credits,
        vendorCostCent: model.vendorCostCent,
        priceSnapshot: {
          creditPrice: model.creditPrice,
          vendorCostCent: model.vendorCostCent,
          billingUnit: model.billingUnit,
          model: model.apiModel,
        },
        status: "success",
        units: "1",
      },
    });
    if (ledgerKey) {
      await tx.creditLedger.updateMany({
        where: { userId, idempotencyKey: { startsWith: `${ledgerKey}:` }, entryType: "consume" },
        data: { taskId },
      });
    }
  });
}
