import { describe, expect, it } from "vitest";
import {
  computeDeductionSplit,
  InsufficientBalanceError,
  normalizeBalances,
} from "@/lib/admin/credit";

describe("积分扣减顺序", () => {
  it("按 deductionOrder 依次扣减多账户", () => {
    const steps = computeDeductionSplit(
      { gift: 100, member: 200, enterprise: 0, recharge: 500 },
      250,
      ["gift", "member", "enterprise", "recharge"],
      false,
    );
    expect(steps).toEqual([
      { accountType: "gift", amount: 100 },
      { accountType: "member", amount: 150 },
    ]);
  });

  it("充值积分作为最后顺位兜底", () => {
    const steps = computeDeductionSplit(
      { gift: 30, member: 0, recharge: 470 },
      500,
      ["gift", "member", "enterprise", "recharge"],
      false,
    );
    expect(steps).toEqual([
      { accountType: "gift", amount: 30 },
      { accountType: "recharge", amount: 470 },
    ]);
  });

  it("负余额关闭时余额不足抛错", () => {
    expect(() =>
      computeDeductionSplit({ recharge: 100 }, 200, ["gift", "member", "enterprise", "recharge"], false),
    ).toThrow(InsufficientBalanceError);
  });

  it("负余额开启时缺口计入最后顺位账户", () => {
    const steps = computeDeductionSplit(
      { recharge: 100 },
      150,
      ["gift", "member", "enterprise", "recharge"],
      true,
    );
    expect(steps).toEqual([{ accountType: "recharge", amount: 150 }]);
  });

  it("非正整数金额直接拒绝", () => {
    expect(() => computeDeductionSplit({}, 0, ["gift", "member", "enterprise", "recharge"], false)).toThrow();
    expect(() => computeDeductionSplit({}, -5, ["gift", "member", "enterprise", "recharge"], false)).toThrow();
    expect(() => computeDeductionSplit({}, 1.5, ["gift", "member", "enterprise", "recharge"], false)).toThrow();
  });

  it("空余额被规范化为四账户零值", () => {
    expect(normalizeBalances(undefined)).toEqual({ recharge: 0, member: 0, gift: 0, enterprise: 0 });
    expect(normalizeBalances({ recharge: 12.9 }).recharge).toBe(12);
  });
});
