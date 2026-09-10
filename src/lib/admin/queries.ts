import type { Prisma, PrismaClient } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { AdminApiError } from "@/lib/admin/http";
import type { ListQuery } from "@/lib/admin/validation";
import {
  mapAuditLog,
  mapOrder,
  mapPlan,
  mapPolicy,
  mapModel,
  mapTier,
  mapUsage,
  mapUser,
  type UserAggregates,
} from "@/lib/admin/mappers";
import type {
  AdminModelConfig,
  AdminOrder,
  AdminPlan,
  AdminRechargeTier,
  AdminUser,
  CreditPolicy,
  UsageLedgerItem,
} from "@/types/admin";

export type ListResult<T> = { items: T[]; total: number; page: number; pageSize: number };

async function loadUserAggregates(prisma: PrismaClient): Promise<UserAggregates> {
  const [paidOrders, usageAgg, usageCount] = await Promise.all([
    prisma.order.groupBy({
      by: ["userId"],
      where: { status: "paid" },
      _sum: { amountCent: true },
    }),
    prisma.usageLedger.groupBy({
      by: ["userId"],
      _sum: { credits: true },
    }),
    prisma.usageLedger.groupBy({ by: ["userId"], _count: { _all: true } }),
  ]);
  return {
    lifetimePaidCent: new Map(paidOrders.map((row) => [row.userId, row._sum.amountCent ?? 0])),
    lifetimeConsumed: new Map(
      usageAgg.map((row) => [row.userId, Math.abs(row._sum.credits ?? 0)]),
    ),
    taskCount: new Map(usageCount.map((row) => [row.userId, row._count._all])),
  };
}

async function loadPlanIndex(prisma: PrismaClient) {
  const plans = await prisma.plan.findMany();
  return {
    planNameById: new Map(plans.map((plan) => [plan.id, plan.name])),
    planFeaturesById: new Map(plans.map((plan) => [plan.id, plan.featureWhitelist])),
  };
}

function userWhere(query: ListQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  if (query.status && ["active", "risk", "disabled"].includes(query.status)) {
    where.status = query.status as "active" | "risk" | "disabled";
  }
  if (query.q) {
    where.OR = [
      { id: { contains: query.q, mode: "insensitive" } },
      { nickname: { contains: query.q, mode: "insensitive" } },
      { phone: { contains: query.q } },
      { email: { contains: query.q, mode: "insensitive" } },
      { organization: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }
  if (query.from || query.to) {
    where.registeredAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }
  return where;
}

export async function listUsers(query: ListQuery): Promise<ListResult<AdminUser>> {
  const prisma = getPrisma();
  const where = userWhere(query);
  const [rows, total, { planNameById, planFeaturesById }, aggregates] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { creditAccounts: true, organization: { select: { name: true } } },
      orderBy: { registeredAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.user.count({ where }),
    loadPlanIndex(prisma),
    loadUserAggregates(prisma),
  ]);
  return {
    items: rows.map((row) => mapUser(row, planNameById, planFeaturesById, aggregates)),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getUser(id: string): Promise<AdminUser> {
  const prisma = getPrisma();
  const row = await prisma.user.findUnique({
    where: { id },
    include: { creditAccounts: true, organization: { select: { name: true } } },
  });
  if (!row) throw new AdminApiError(404, "USER_NOT_FOUND", "用户不存在");
  const [{ planNameById, planFeaturesById }, aggregates] = await Promise.all([
    loadPlanIndex(prisma),
    loadUserAggregates(prisma),
  ]);
  return mapUser(row, planNameById, planFeaturesById, aggregates);
}

export async function listOrders(query: ListQuery): Promise<ListResult<AdminOrder>> {
  const prisma = getPrisma();
  const where: Prisma.OrderWhereInput = {};
  if (query.status && ["pending", "paid", "refunded", "closed"].includes(query.status)) {
    where.status = query.status as "pending" | "paid" | "refunded" | "closed";
  }
  if (query.q) {
    where.OR = [
      { id: { contains: query.q, mode: "insensitive" } },
      { userId: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }
  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.order.count({ where }),
  ]);
  return { items: rows.map(mapOrder), total, page: query.page, pageSize: query.pageSize };
}

export async function listUsage(query: ListQuery): Promise<ListResult<UsageLedgerItem>> {
  const prisma = getPrisma();
  const where: Prisma.UsageLedgerWhereInput = {};
  if (query.status && ["success", "failed", "refunded"].includes(query.status)) {
    where.status = query.status as "success" | "failed" | "refunded";
  }
  if (query.q) {
    where.OR = [
      { taskId: { contains: query.q, mode: "insensitive" } },
      { userId: { contains: query.q, mode: "insensitive" } },
      { projectName: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }
  const [rows, total, models] = await Promise.all([
    prisma.usageLedger.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.usageLedger.count({ where }),
    prisma.modelConfig.findMany({ select: { id: true, name: true } }),
  ]);
  const modelNameById = new Map(models.map((model) => [model.id, model.name]));
  return {
    items: rows.map((row) => mapUsage(row, modelNameById)),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function listPlans(): Promise<AdminPlan[]> {
  const rows = await getPrisma().plan.findMany({ orderBy: [{ audience: "asc" }, { priceMonthlyCent: "asc" }] });
  return rows.map(mapPlan);
}

export async function listRechargeTiers(): Promise<AdminRechargeTier[]> {
  const rows = await getPrisma().rechargeTier.findMany({ orderBy: { priceCent: "asc" } });
  return rows.map(mapTier);
}

export async function listModels(): Promise<AdminModelConfig[]> {
  const rows = await getPrisma().modelConfig.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(mapModel);
}

export async function getCreditPolicy(): Promise<CreditPolicy> {
  const row = await getPrisma().creditPolicy.findUnique({ where: { id: "platform" } });
  if (!row) throw new AdminApiError(404, "CREDIT_POLICY_NOT_FOUND", "积分策略未初始化，请运行种子脚本");
  return mapPolicy(row);
}

export async function listAuditLogs(query: ListQuery) {
  const prisma = getPrisma();
  const where: Prisma.AdminAuditLogWhereInput = {};
  if (query.q) {
    where.OR = [
      { action: { contains: query.q, mode: "insensitive" } },
      { targetId: { contains: query.q, mode: "insensitive" } },
      { reason: { contains: query.q, mode: "insensitive" } },
      { operator: { nickname: { contains: query.q, mode: "insensitive" } } },
    ];
  }
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }
  const [rows, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      include: { operator: { select: { nickname: true } } },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);
  return { items: rows.map(mapAuditLog), total, page: query.page, pageSize: query.pageSize };
}

export type DashboardData = {
  totalUsers: number;
  paidUsers: number;
  revenueYuan: number;
  refundedYuan: number;
  consumedCredits: number;
  vendorCostYuan: number;
  grossMarginPercent: number;
  enabledPlans: number;
  enabledTiers: number;
  healthyModels: number;
  totalModels: number;
  enterpriseUsers: number;
  riskUsers: number;
  recentAuditCount: number;
};

export async function getDashboard(): Promise<DashboardData> {
  const prisma = getPrisma();
  const [totalUsers, paidUsersAgg, refundAgg, usageAgg, planAgg, tierAgg, modelAgg, enterpriseUsers, riskUsers, recentAuditCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.order.groupBy({ by: ["userId"], where: { status: "paid" }, _sum: { amountCent: true } }),
      prisma.order.aggregate({ where: { status: "refunded" }, _sum: { amountCent: true } }),
      prisma.usageLedger.aggregate({ _sum: { credits: true, vendorCostCent: true } }),
      prisma.plan.count({ where: { enabled: true } }),
      prisma.rechargeTier.count({ where: { enabled: true } }),
      prisma.modelConfig.groupBy({ by: ["health"], _count: { _all: true } }),
      prisma.user.count({ where: { organizationId: { not: null } } }),
      prisma.user.count({ where: { status: "risk" } }),
      prisma.adminAuditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } } }),
    ]);
  const revenueCent = paidUsersAgg.reduce((sum, row) => sum + (row._sum.amountCent ?? 0), 0);
  const vendorCostCent = usageAgg._sum.vendorCostCent ?? 0;
  const gross = revenueCent > 0 ? Math.round(((revenueCent - vendorCostCent) / revenueCent) * 100) : 0;
  return {
    totalUsers,
    paidUsers: paidUsersAgg.length,
    revenueYuan: revenueCent / 100,
    refundedYuan: (refundAgg._sum.amountCent ?? 0) / 100,
    consumedCredits: Math.abs(usageAgg._sum.credits ?? 0),
    vendorCostYuan: vendorCostCent / 100,
    grossMarginPercent: gross,
    enabledPlans: planAgg,
    enabledTiers: tierAgg,
    healthyModels: modelAgg.find((row) => row.health === "healthy")?._count._all ?? 0,
    totalModels: modelAgg.reduce((sum, row) => sum + row._count._all, 0),
    enterpriseUsers,
    riskUsers,
    recentAuditCount,
  };
}
