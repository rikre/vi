import { describe, expect, it } from "vitest";
import {
  creditPolicyInputSchema,
  enterpriseOrderInputSchema,
  grantInputSchema,
  listQuerySchema,
  modelInputSchema,
  modelSecretSchema,
  organizationInputSchema,
  organizationMemberInputSchema,
  organizationPatchSchema,
  placementItemInputSchema,
  placementItemPatchSchema,
  placementPatchSchema,
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

  it("运营位素材链接必须是 URL 或站内路径", () => {
    const item = { title: "素材", linkUrl: "javascript:alert(1)", sortOrder: 0 };
    expect(() => placementItemInputSchema.parse(item)).toThrow();
    expect(() => placementItemInputSchema.parse({ ...item, linkUrl: "不是链接" })).toThrow();
    expect(placementItemInputSchema.parse({ ...item, linkUrl: "/library" }).linkUrl).toBe("/library");
    expect(placementItemInputSchema.parse({ ...item, linkUrl: "https://bollo.video" }).linkUrl).toBe("https://bollo.video");
    expect(placementItemInputSchema.parse({ ...item, linkUrl: "" }).linkUrl).toBe(null);
    expect(placementItemInputSchema.parse({ ...item, linkUrl: null }).linkUrl).toBe(null);
  });

  it("运营位素材标题必填且排序值边界 0–9999", () => {
    expect(() => placementItemInputSchema.parse({ title: "", sortOrder: 0 })).toThrow();
    expect(() => placementItemInputSchema.parse({ title: "x".repeat(81) })).toThrow();
    expect(() => placementItemInputSchema.parse({ title: "素材", sortOrder: -1 })).toThrow();
    expect(() => placementItemInputSchema.parse({ title: "素材", sortOrder: 10_000 })).toThrow();
    expect(placementItemInputSchema.parse({ title: "素材" }).sortOrder).toBe(0);
    expect(placementItemInputSchema.parse({ title: "素材", sortOrder: 9_999 }).sortOrder).toBe(9_999);
  });

  it("运营位素材时间窗口：结束必须晚于开始", () => {
    const item = { title: "素材", startAt: "2026-10-25T10:00:00Z", endAt: "2026-10-25T10:00:00Z" };
    expect(() => placementItemInputSchema.parse(item)).toThrow();
    expect(() =>
      placementItemInputSchema.parse({ ...item, endAt: "2026-10-24T10:00:00Z" }),
    ).toThrow();
    expect(() =>
      placementItemInputSchema.parse({ ...item, endAt: "2026-10-25T11:00:00Z" }),
    ).not.toThrow();
  });

  it("运营位素材 PATCH 状态枚举受限且可空字段归一化", () => {
    // 注：链接/时间字段经 transform 后空对象也会输出 null，"至少一字段"由路由层基于原始 body 判断
    expect(() => placementItemPatchSchema.parse({ status: "offline" })).toThrow();
    expect(placementItemPatchSchema.parse({ status: "hidden" }).status).toBe("hidden");
    expect(placementItemPatchSchema.parse({ sortOrder: 5, subtitle: null }).sortOrder).toBe(5);
    expect(placementItemPatchSchema.parse({ imageUrl: "" }).imageUrl).toBe(null);
    expect(() => placementItemPatchSchema.parse({ linkUrl: "javascript:alert(1)" })).toThrow();
  });

  it("运营位整位 PATCH 至少提供名称或启停之一", () => {
    expect(() => placementPatchSchema.parse({})).toThrow();
    expect(() => placementPatchSchema.parse({ name: "" })).toThrow();
    expect(placementPatchSchema.parse({ enabled: false }).enabled).toBe(false);
    expect(placementPatchSchema.parse({ name: "首页轮播" }).name).toBe("首页轮播");
    expect(placementPatchSchema.parse({ name: " 首页轮播 ", enabled: true }).name).toBe("首页轮播");
  });

  it("订单列表支持 scope 过滤且枚举受限", () => {
    expect(listQuerySchema.parse({ scope: "enterprise" }).scope).toBe("enterprise");
    expect(listQuerySchema.parse({ scope: "personal" }).scope).toBe("personal");
    expect(listQuerySchema.parse({}).scope).toBeUndefined();
    expect(() => listQuerySchema.parse({ scope: "all" })).toThrow();
  });

  it("企业配置：折扣 0-90 边界与席位/并发边界", () => {
    const org = { name: "星芒文化", seats: 20, maxConcurrency: 20, monthlyComputeQuota: 1_000_000, discountPct: 30 };
    expect(organizationInputSchema.parse(org).discountPct).toBe(30);
    expect(organizationInputSchema.parse({ ...org, discountPct: 0 }).discountPct).toBe(0);
    expect(organizationInputSchema.parse({ ...org, discountPct: 90 }).discountPct).toBe(90);
    expect(() => organizationInputSchema.parse({ ...org, discountPct: -1 })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, discountPct: 91 })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, discountPct: 30.5 })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, name: "" })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, name: "长".repeat(61) })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, contractNo: "长".repeat(41) })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, seats: 0 })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, seats: 10_001 })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, maxConcurrency: 0 })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, monthlyComputeQuota: -1 })).toThrow();
    expect(() => organizationInputSchema.parse({ ...org, monthlyComputeQuota: 2_000_000_001 })).toThrow();
  });

  it("企业配置：到期时间可空且空串归一化为 null", () => {
    const org = { name: "星芒文化", seats: 20, maxConcurrency: 20, monthlyComputeQuota: 0, discountPct: 0 };
    expect(organizationInputSchema.parse(org).expiresAt).toBe(null);
    expect(organizationInputSchema.parse({ ...org, expiresAt: "" }).expiresAt).toBe(null);
    expect(organizationInputSchema.parse({ ...org, expiresAt: null }).expiresAt).toBe(null);
    expect(organizationInputSchema.parse({ ...org, expiresAt: "2027-12-31" }).expiresAt).toBeInstanceOf(Date);
    // PATCH：未提供保持 undefined，空串显式清空
    expect(organizationPatchSchema.parse({ discountPct: 10 }).expiresAt).toBeUndefined();
    expect(organizationPatchSchema.parse({ expiresAt: "" }).expiresAt).toBe(null);
    expect(() => organizationPatchSchema.parse({ status: "frozen" })).toThrow();
    expect(organizationPatchSchema.parse({ status: "suspended" }).status).toBe("suspended");
  });

  it("企业订单：积分必须为 1-1e8 正整数且原因必填", () => {
    expect(enterpriseOrderInputSchema.parse({ credits: 10_000, reason: "合同 Q4 增补" }).credits).toBe(10_000);
    expect(() => enterpriseOrderInputSchema.parse({ credits: 0, reason: "合同增补" })).toThrow();
    expect(() => enterpriseOrderInputSchema.parse({ credits: -5, reason: "合同增补" })).toThrow();
    expect(() => enterpriseOrderInputSchema.parse({ credits: 1.5, reason: "合同增补" })).toThrow();
    expect(() => enterpriseOrderInputSchema.parse({ credits: 100_000_001, reason: "合同增补" })).toThrow();
    expect(() => enterpriseOrderInputSchema.parse({ credits: 10_000, reason: "x" })).toThrow();
    expect(() => enterpriseOrderInputSchema.parse({ credits: 10_000, reason: "x".repeat(501) })).toThrow();
  });

  it("企业成员：用户必选且添加原因必填（2-500 字）", () => {
    const member = { userId: "U10086741", reason: "企业合同增补席位" };
    expect(organizationMemberInputSchema.parse(member)).toEqual(member);
    expect(organizationMemberInputSchema.parse({ ...member, userId: " U10086741 " }).userId).toBe("U10086741");
    expect(() => organizationMemberInputSchema.parse({ userId: "", reason: "合同增补" })).toThrow();
    expect(() => organizationMemberInputSchema.parse({ userId: " ", reason: "合同增补" })).toThrow();
    expect(() => organizationMemberInputSchema.parse({ userId: "U10086741" })).toThrow();
    expect(() => organizationMemberInputSchema.parse({ userId: "U10086741", reason: "x" })).toThrow();
    expect(() => organizationMemberInputSchema.parse({ userId: "U10086741", reason: "长".repeat(501) })).toThrow();
    expect(() => organizationMemberInputSchema.parse({ userId: "长".repeat(65), reason: "合同增补" })).toThrow();
  });

  it("企业主账号：可空字段归一化（新建空串→null，PATCH 未提供→undefined）", () => {
    const org = { name: "星芒文化", seats: 20, maxConcurrency: 20, monthlyComputeQuota: 0, discountPct: 0 };
    expect(organizationInputSchema.parse(org).adminUserId).toBe(null);
    expect(organizationInputSchema.parse({ ...org, adminUserId: "" }).adminUserId).toBe(null);
    expect(organizationInputSchema.parse({ ...org, adminUserId: null }).adminUserId).toBe(null);
    expect(organizationInputSchema.parse({ ...org, adminUserId: " U10086741 " }).adminUserId).toBe("U10086741");
    expect(() => organizationInputSchema.parse({ ...org, adminUserId: "长".repeat(65) })).toThrow();
    // PATCH：显式传 null / 空串 = 取消主账号（代管），未提供 = 保持不变
    expect(organizationPatchSchema.parse({ discountPct: 10 }).adminUserId).toBeUndefined();
    expect(organizationPatchSchema.parse({ adminUserId: null }).adminUserId).toBe(null);
    expect(organizationPatchSchema.parse({ adminUserId: "" }).adminUserId).toBe(null);
    expect(organizationPatchSchema.parse({ adminUserId: " U10086741 " }).adminUserId).toBe("U10086741");
    expect(() => organizationPatchSchema.parse({ adminUserId: "长".repeat(65) })).toThrow();
  });
});
