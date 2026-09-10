import { describe, expect, it } from "vitest";
import {
  creditPolicyInputSchema,
  grantInputSchema,
  listQuerySchema,
  modelInputSchema,
  modelSecretSchema,
  rechargeTierInputSchema,
  userStatusSchema,
} from "@/lib/admin/validation";

describe("admin 输入校验", () => {
  it("权益发放必须填写原因", () => {
    expect(() =>
      grantInputSchema.parse({ kind: "credits", userId: "U-1", bucket: "gift", amount: 100, reason: "x" }),
    ).toThrow();
    expect(
      grantInputSchema.parse({ kind: "credits", userId: "U-1", bucket: "gift", amount: 100, reason: "客诉补偿" }),
    ).toEqual({ kind: "credits", userId: "U-1", bucket: "gift", amount: 100, reason: "客诉补偿" });
  });

  it("发放数量必须为正整数且不允许浮点", () => {
    expect(() =>
      grantInputSchema.parse({ kind: "credits", userId: "U-1", bucket: "gift", amount: 1.5, reason: "合同补充" }),
    ).toThrow();
    expect(() =>
      grantInputSchema.parse({ kind: "credits", userId: "U-1", bucket: "gift", amount: 0, reason: "合同补充" }),
    ).toThrow();
  });

  it("状态变更原因必填", () => {
    expect(userStatusSchema.parse({ status: "risk", reason: "请求频率异常" })).toEqual({
      status: "risk",
      reason: "请求频率异常",
    });
    expect(() => userStatusSchema.parse({ status: "risk" })).toThrow();
    expect(() => userStatusSchema.parse({ status: "banned", reason: "违规" })).toThrow();
  });

  it("金额字段最多两位小数", () => {
    const tier = { id: "tier-1", name: "档位", price: 9.999, baseCredits: 100, bonusCredits: 0, firstPurchaseOnly: false, enabled: true };
    expect(() => rechargeTierInputSchema.parse(tier)).toThrow();
    expect(() => rechargeTierInputSchema.parse({ ...tier, price: 9.99 })).not.toThrow();
  });

  it("模型端点必须是 HTTPS", () => {
    const model = {
      name: "Doubao Pro",
      vendor: "ByteDance",
      capability: "video",
      endpoint: "http://api.vendor.com",
      billingUnit: "秒",
      vendorCost: 0.05,
      creditPrice: 10,
      maxConcurrency: 10,
      timeoutSeconds: 300,
      health: "healthy",
      outputOptions: ["720p"],
      allowedPlans: ["plan-pro"],
      enabled: true,
    };
    expect(() => modelInputSchema.parse(model)).toThrow();
    expect(() => modelInputSchema.parse({ ...model, endpoint: "https://api.vendor.com" })).not.toThrow();
  });

  it("模型密钥长度下限", () => {
    expect(() => modelSecretSchema.parse({ secret: "short" })).toThrow();
    expect(() => modelSecretSchema.parse({ secret: "sk-1234567890" })).not.toThrow();
  });

  it("积分策略扣减顺序必须四账户不重复", () => {
    const policy = {
      creditsPerYuan: 10,
      deductionOrder: ["gift", "gift", "member", "recharge"],
      giftExpiryDays: 180,
      memberResetDay: 1,
      minimumGrant: 100,
      failedTaskRefund: true,
      negativeBalanceAllowed: false,
    };
    expect(() => creditPolicyInputSchema.parse(policy)).toThrow();
    expect(() =>
      creditPolicyInputSchema.parse({ ...policy, deductionOrder: ["gift", "member", "enterprise", "recharge"] }),
    ).not.toThrow();
  });

  it("列表查询参数强制分页边界", () => {
    expect(listQuerySchema.parse({})).toMatchObject({ page: 1, pageSize: 50 });
    expect(listQuerySchema.parse({ page: "2", pageSize: "30" })).toMatchObject({ page: 2, pageSize: 30 });
    expect(() => listQuerySchema.parse({ page: "0" })).toThrow();
    expect(() => listQuerySchema.parse({ pageSize: "500" })).toThrow();
  });
});
