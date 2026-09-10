import type { CreditBucket } from "@/types/admin";

/**
 * 积分扣减顺序的纯函数实现。
 * 余额与扣减额均为整数；不满足扣减条件时抛错，由调用方在事务内回滚。
 */
export type DeductionStep = { accountType: CreditBucket; amount: number };

export class InsufficientBalanceError extends Error {
  constructor(
    public readonly required: number,
    public readonly available: number,
  ) {
    super(`积分余额不足：需要 ${required}，可用 ${available}`);
    this.name = "InsufficientBalanceError";
  }
}

const BUCKETS: readonly CreditBucket[] = ["recharge", "member", "gift", "enterprise"];

export function normalizeBalances(
  balances: Partial<Record<CreditBucket, number>> | undefined | null,
): Record<CreditBucket, number> {
  const result: Record<CreditBucket, number> = { recharge: 0, member: 0, gift: 0, enterprise: 0 };
  if (!balances) return result;
  for (const bucket of BUCKETS) {
    const value = balances[bucket];
    if (typeof value === "number" && Number.isFinite(value)) {
      result[bucket] = Math.trunc(value);
    }
  }
  return result;
}

/**
 * 按 deductionOrder 顺序拆分扣减金额。
 * - amount 必须为正整数
 * - negativeAllowed=false 时，总余额不足抛 InsufficientBalanceError
 * - negativeAllowed=true 时，不足部分计入最后一个顺位账户（允许出现负余额）
 */
export function computeDeductionSplit(
  balances: Partial<Record<CreditBucket, number>>,
  amount: number,
  deductionOrder: readonly CreditBucket[],
  negativeAllowed: boolean,
): DeductionStep[] {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("扣减金额必须为正整数");
  }
  const order = deductionOrder.length === 4 ? deductionOrder : (["gift", "member", "enterprise", "recharge"] as const);
  const current = normalizeBalances(balances);
  const total = order.reduce((sum, bucket) => sum + current[bucket], 0);

  if (!negativeAllowed && total < amount) {
    throw new InsufficientBalanceError(amount, total);
  }

  const steps: DeductionStep[] = [];
  let remaining = amount;
  for (const bucket of order) {
    if (remaining <= 0) break;
    const available = current[bucket];
    if (available <= 0) continue;
    const take = Math.min(available, remaining);
    steps.push({ accountType: bucket, amount: take });
    remaining -= take;
  }
  if (remaining > 0) {
    if (!negativeAllowed) {
      throw new InsufficientBalanceError(amount, total);
    }
    const last = order[order.length - 1];
    const existing = steps.find((step) => step.accountType === last);
    if (existing) {
      existing.amount += remaining;
    } else {
      steps.push({ accountType: last, amount: remaining });
    }
  }
  return steps;
}
