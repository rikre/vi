/**
 * 可重复执行的管理后台种子数据。
 * 运行：npm run db:seed（要求 DATABASE_URL 已指向完成迁移的 PostgreSQL）
 */
import { Prisma, PrismaClient } from "@prisma/client";
import { INITIAL_ADMIN_STATE } from "../src/lib/admin-data";
import {
  ARTISTS,
  CAMPAIGN_SLIDES,
  IP_LIBRARY,
  QUICK_ACTIONS,
  THEATERS,
  TREND_CARDS,
  WIDE_BANNER,
} from "../src/components/home/home-data";

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
  // AdminAuditLog / CreditLedger 为 append-only（migration 触发器禁止行级 DELETE），改用 TRUNCATE 重置
  await prisma.$executeRawUnsafe('TRUNCATE "AdminAuditLog", "CreditLedger"');
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
        // 文化火焰传媒为折扣示范企业：减免 30%（七折优惠）
        discountPct: name.includes("文化") ? 30 : 0,
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

  console.log("设置企业成员挂靠与主账号…");
  // 文化火焰传媒成员管理演示数据：霓凰加入该企业并担任主账号（主账号必须来自该企业现有成员）
  const cultureOrgId = orgs.get("文化火焰传媒");
  if (cultureOrgId) {
    await prisma.user.update({
      where: { id: "U10086741" },
      data: { organizationId: cultureOrgId },
    });
    await prisma.organization.update({
      where: { id: cultureOrgId },
      data: { adminUserId: "U10086741" },
    });
  }

  console.log("写入订单（含价格与商品快照）…");
  // 企业类订单挂接到下单用户所属企业（organizationId 非空 = 企业订单）
  const userOrgId = new Map(
    INITIAL_ADMIN_STATE.users
      .filter((user) => user.organization)
      .map((user) => [user.id, orgs.get(user.organization as string) ?? null]),
  );
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
        organizationId: order.category === "enterprise" ? userOrgId.get(order.userId) ?? null : null,
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
        targetType: /^[U\d]/.test(log.target) ? "user" : "platform",
        targetId: log.target,
        reason: log.detail,
        createdAt: parseDate(log.createdAt, 0),
      },
    });
  }

  console.log("写入首页运营位…");
  await seedPlacements();

  console.log("种子数据写入完成 ✔");
}

/** 首页运营位：平台预置 7 个位 + 静态素材映射。已存在则跳过，保证 seed 可重跑且不覆盖后台改动。 */
async function seedPlacements(): Promise<void> {
  type SeedItem = {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    iconKey?: string;
    linkUrl?: string;
    badge?: string;
    sortOrder: number;
    extra?: Record<string, unknown>;
  };
  type SeedPlacement = { id: string; name: string; type: string; items: SeedItem[] };

  const placements: SeedPlacement[] = [
    {
      id: "home_carousel",
      name: "首页活动轮播",
      type: "carousel",
      items: CAMPAIGN_SLIDES.map((slide, index) => ({
        title: slide.title,
        linkUrl: slide.href,
        sortOrder: index,
        extra: { staticId: slide.id, highlights: slide.highlights, countdownDays: slide.countdownDays ?? null },
      })),
    },
    {
      id: "home_banner",
      name: "首页通栏横幅",
      type: "single",
      items: [
        {
          title: WIDE_BANNER.text,
          imageUrl: WIDE_BANNER.img,
          linkUrl: WIDE_BANNER.href,
          sortOrder: 0,
          extra: { character: WIDE_BANNER.character },
        },
      ],
    },
    {
      id: "home_quick_actions",
      name: "首页快捷入口",
      type: "list",
      items: QUICK_ACTIONS.map((action, index) => ({
        title: action.title,
        subtitle: action.desc,
        imageUrl: action.img,
        linkUrl: action.href,
        sortOrder: index,
      })),
    },
    {
      id: "home_trend_cards",
      name: "首页趋势卡",
      type: "list",
      items: TREND_CARDS.map((card, index) => ({
        title: card.title,
        linkUrl: card.href,
        sortOrder: index,
        extra: {
          staticId: card.id,
          date: card.date,
          percent: card.percent,
          direction: card.direction,
          hotCount: card.hotCount,
          newCount: card.newCount,
          tags: card.tags,
        },
      })),
    },
    {
      id: "home_ip_library",
      name: "首页IP库精选",
      type: "list",
      items: IP_LIBRARY.map((ip, index) => ({
        title: ip.title,
        imageUrl: ip.img,
        linkUrl: ip.href,
        sortOrder: index,
        extra: { level: ip.level, channel: ip.channel, genre: ip.genre },
      })),
    },
    {
      id: "home_artists",
      name: "首页创作者推荐",
      type: "list",
      items: ARTISTS.map((artist, index) => ({
        title: artist.name,
        subtitle: artist.desc,
        imageUrl: artist.img,
        sortOrder: index,
      })),
    },
    {
      id: "home_theaters",
      name: "首页剧场精选",
      type: "list",
      items: THEATERS.map((theater, index) => ({
        title: theater.title,
        subtitle: theater.author,
        imageUrl: theater.img,
        sortOrder: index,
      })),
    },
  ];

  for (const placement of placements) {
    const existing = await prisma.placement.findUnique({
      where: { id: placement.id },
      include: { _count: { select: { items: true } } },
    });
    if (existing) continue; // 已存在（含后台改过）则跳过
    await prisma.placement.create({
      data: {
        id: placement.id,
        name: placement.name,
        type: placement.type,
        enabled: true,
        items: {
          create: placement.items.map((item) => ({
            title: item.title,
            subtitle: item.subtitle ?? null,
            imageUrl: item.imageUrl ?? null,
            iconKey: item.iconKey ?? null,
            linkUrl: item.linkUrl ?? null,
            badge: item.badge ?? null,
            sortOrder: item.sortOrder,
            status: "active",
            extra: (item.extra ?? undefined) as Prisma.InputJsonValue | undefined,
          })),
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("种子数据写入失败：", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
