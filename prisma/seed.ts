/**
 * 可重复执行的管理后台种子数据。
 * 运行：npm run db:seed（要求 DATABASE_URL 已指向完成迁移的 PostgreSQL）
 */
import { PrismaClient } from "@prisma/client";
import { INITIAL_ADMIN_STATE } from "../src/lib/admin-data";

const prisma = new PrismaClient();

/** mock 登录的管理员账号（见 src/lib/auth-server.ts mockUser） */
const MOCK_ADMIN_ID = "10086420";

function parseDate(value: string, fallbackDaysAgo = 0): Date {
  const parsed = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date(Date.now() - fallbackDaysAgo * 86_400_000);
}

async function main(): Promise<void> {
  console.log("清空既有数据…");
  await prisma.adminAuditLog.deleteMany();
  await prisma.creditLedger.deleteMany();
  await prisma.usageLedger.deleteMany();
  await prisma.order.deleteMany();
  await prisma.creditAccount.deleteMany();
  await prisma.adminRole.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.planEntitlement.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.rechargeTier.deleteMany();
  await prisma.modelConfig.deleteMany();
  await prisma.creditPolicy.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log("写入企业客户…");
  const orgNames = Array.from(
    new Set(INITIAL_ADMIN_STATE.users.map((user) => user.organization).filter((name): name is string => Boolean(name))),
  );
  const orgs = new Map<string, string>();
  for (const [index, name] of orgNames.entries()) {
    const org = await prisma.organization.create({
      data: {
        id: `ORG-${String(index + 1).padStart(3, "0")}`,
        name,
        status: "active",
        contractNo: `HT-2026-${String(index + 1).padStart(4, "0")}`,
        seats: name.includes("文化") ? 5 : 3,
        creditBalance: 0,
        maxConcurrency: 30,
        monthlyComputeQuota: 360_000,
      },
    });
    orgs.set(name, org.id);
  }

  console.log("写入套餐与权益…");
  for (const plan of INITIAL_ADMIN_STATE.plans) {
    await prisma.plan.create({
      data: {
        id: plan.id,
        name: plan.name,
        audience: plan.audience,
        priceMonthlyCent: Math.round(plan.priceMonthly * 100),
        priceYearlyMonthlyCent: Math.round(plan.priceYearlyMonthly * 100),
        monthlyCredits: plan.monthlyCredits,
        seats: plan.seats,
        concurrency: plan.concurrency,
        monthlyComputeQuota: plan.monthlyComputeQuota,
        queue: plan.queue,
        featureWhitelist: plan.features,
        modelWhitelist: plan.features.filter(
          (feature) => !feature.endsWith("-export") && !["watermark-free", "priority-queue", "api-access", "private-model", "audit-export"].includes(feature),
        ),
        enabled: plan.enabled,
      },
    });
    if (plan.features.length > 0) {
      await prisma.planEntitlement.createMany({
        data: plan.features.map((feature) => ({ planId: plan.id, key: feature, value: "true" })),
      });
    }
  }

  console.log("写入充值档位…");
  for (const tier of INITIAL_ADMIN_STATE.rechargeTiers) {
    await prisma.rechargeTier.create({
      data: {
        id: tier.id,
        name: tier.name,
        priceCent: Math.round(tier.price * 100),
        baseCredits: tier.baseCredits,
        bonusCredits: tier.bonusCredits,
        firstPurchaseOnly: tier.firstPurchaseOnly,
        enabled: tier.enabled,
      },
    });
  }

  console.log("写入模型配置（不含密钥，密钥请通过 /api/admin/models/:id/secret 写入）…");
  for (const model of INITIAL_ADMIN_STATE.models) {
    await prisma.modelConfig.create({
      data: {
        id: model.id,
        name: model.name,
        vendor: model.vendor,
        capability: model.capability,
        endpoint: model.endpoint,
        apiKeyLast4: model.apiKeyLast4,
        billingUnit: model.billingUnit,
        vendorCostCent: Math.round(model.vendorCost * 100),
        creditPrice: model.creditPrice,
        maxConcurrency: model.maxConcurrency,
        timeoutSeconds: model.timeoutSeconds,
        health: model.health,
        outputOptions: model.outputOptions,
        allowedPlans: model.allowedPlans,
        enabled: model.enabled,
      },
    });
  }

  console.log("写入积分策略…");
  await prisma.creditPolicy.create({
    data: {
      id: "platform",
      creditsPerYuan: INITIAL_ADMIN_STATE.creditPolicy.creditsPerYuan,
      deductionOrder: INITIAL_ADMIN_STATE.creditPolicy.deductionOrder,
      giftExpiryDays: INITIAL_ADMIN_STATE.creditPolicy.giftExpiryDays,
      memberResetDay: INITIAL_ADMIN_STATE.creditPolicy.memberResetDay,
      minimumGrant: INITIAL_ADMIN_STATE.creditPolicy.minimumGrant,
      failedTaskRefund: INITIAL_ADMIN_STATE.creditPolicy.failedTaskRefund,
      negativeBalanceAllowed: INITIAL_ADMIN_STATE.creditPolicy.negativeBalanceAllowed,
    },
  });

  console.log("写入用户（含 mock 登录管理员）…");
  for (const user of INITIAL_ADMIN_STATE.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        nickname: user.nickname,
        phone: user.contact.match(/^\d{11}$/) ? user.contact : null,
        email: user.contact.includes("@") ? user.contact : null,
        status: user.status,
        registeredAt: parseDate(user.registeredAt, 120),
        lastActiveAt: parseDate(user.lastActiveAt, 1),
        organizationId: user.organization ? orgs.get(user.organization) ?? null : null,
        membershipPlanId: user.membership.planId,
        membershipExpiresAt: user.membership.expiresAt ? parseDate(user.membership.expiresAt, 0) : null,
        maxConcurrency: user.maxConcurrency,
        monthlyComputeQuota: user.monthlyComputeQuota,
        adminRoles: user.id === INITIAL_ADMIN_STATE.users[0].id
          ? { create: [{ role: "enterprise_admin" }] }
          : undefined,
        userRoles: { create: [{ role: "member" }] },
        creditAccounts: {
          create: (Object.entries(user.balances) as [string, number][])
            .filter(([, balance]) => balance > 0)
            .map(([accountType, balance]) => ({
              accountType: accountType as "recharge" | "member" | "gift" | "enterprise",
              balance,
            })),
        },
      },
    });
  }

  // mock 登录管理员：roles 来自 auth-server 的 mockUser，具备平台与企业管理员权限
  await prisma.user.create({
    data: {
      id: MOCK_ADMIN_ID,
      nickname: "bollo 用户",
      email: "bollo@bollo.video",
      status: "active",
      maxConcurrency: 20,
      monthlyComputeQuota: 180_000,
      adminRoles: {
        create: [{ role: "platform_admin" }, { role: "enterprise_admin" }],
      },
      userRoles: { create: [{ role: "member" }] },
      creditAccounts: {
        create: [
          { accountType: "recharge", balance: 1_580 },
          { accountType: "member", balance: 800 },
          { accountType: "gift", balance: 200 },
        ],
      },
    },
  });

  console.log("写入订单（含价格与商品快照）…");
  for (const order of INITIAL_ADMIN_STATE.orders) {
    await prisma.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        category: order.category,
        status: order.status,
        amountCent: Math.round(order.amount * 100),
        credits: order.credits,
        channel: order.channel,
        productSnapshot: { name: order.product },
        priceSnapshot: {
          amountYuan: order.amount,
          credits: order.credits,
          policyVersion: 1,
        },
        paidAt: parseDate(order.paidAt, 1),
        refundedAt: order.status === "refunded" ? parseDate(order.paidAt, 1) : null,
        refundNo: order.status === "refunded" ? `RF${order.id.slice(-8)}` : null,
        createdAt: parseDate(order.paidAt, 1),
      },
    });
  }

  console.log("写入消费流水（含模型配置版本与价格快照）…");
  for (const item of INITIAL_ADMIN_STATE.usage) {
    const model = INITIAL_ADMIN_STATE.models.find((candidate) => candidate.id === item.modelId);
    await prisma.usageLedger.create({
      data: {
        id: item.id,
        taskId: item.id,
        userId: item.userId,
        projectName: item.project,
        taskType: item.taskType,
        modelId: item.modelId,
        modelConfigVersion: 1,
        credits: item.credits,
        vendorCostCent: Math.round(item.cost * 100),
        priceSnapshot: {
          modelName: item.modelName,
          creditPrice: model?.creditPrice ?? 0,
          vendorCostYuan: model?.vendorCost ?? 0,
          billingUnit: model?.billingUnit ?? "单位",
          modelVersion: 1,
        },
        status: item.status,
        units: item.units,
        createdAt: parseDate(item.createdAt, 0),
      },
    });
  }

  console.log("写入初始审计日志…");
  for (const log of INITIAL_ADMIN_STATE.auditLogs) {
    await prisma.adminAuditLog.create({
      data: {
        operatorId: MOCK_ADMIN_ID,
        action: log.action,
        targetType: "platform",
        targetId: log.target,
        reason: log.detail,
        createdAt: parseDate(log.createdAt, 0),
      },
    });
  }

  console.log("种子数据写入完成 ✔");
}

main()
  .catch((error) => {
    console.error("种子数据写入失败：", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
