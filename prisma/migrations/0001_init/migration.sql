-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'risk', 'disabled');

-- CreateEnum
CREATE TYPE "AdminRoleName" AS ENUM ('platform_admin', 'enterprise_admin', 'commercial_ops', 'finance', 'support', 'auditor');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('active', 'suspended', 'closed');

-- CreateEnum
CREATE TYPE "CreditAccountType" AS ENUM ('recharge', 'member', 'gift', 'enterprise');

-- CreateEnum
CREATE TYPE "CreditLedgerEntryType" AS ENUM ('grant', 'consume', 'refund', 'expire', 'recharge', 'membership_reset');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('approved', 'pending', 'rejected');

-- CreateEnum
CREATE TYPE "OrderCategory" AS ENUM ('recharge', 'membership', 'enterprise');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'refunded', 'closed');

-- CreateEnum
CREATE TYPE "PaymentChannel" AS ENUM ('wechat', 'alipay', 'bank', 'balance');

-- CreateEnum
CREATE TYPE "PlanAudience" AS ENUM ('personal', 'team', 'enterprise');

-- CreateEnum
CREATE TYPE "QueueType" AS ENUM ('standard', 'priority', 'dedicated');

-- CreateEnum
CREATE TYPE "ModelCapability" AS ENUM ('video', 'image', 'audio', 'text');

-- CreateEnum
CREATE TYPE "ModelHealth" AS ENUM ('healthy', 'degraded', 'offline');

-- CreateEnum
CREATE TYPE "UsageStatus" AS ENUM ('success', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "nickname" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,
    "membershipPlanId" TEXT,
    "membershipExpiresAt" TIMESTAMP(3),
    "maxConcurrency" INTEGER NOT NULL DEFAULT 3,
    "monthlyComputeQuota" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AdminRoleName" NOT NULL,
    "grantedBy" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'active',
    "contractNo" TEXT,
    "adminUserId" TEXT,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "creditBalance" INTEGER NOT NULL DEFAULT 0,
    "maxConcurrency" INTEGER NOT NULL DEFAULT 10,
    "monthlyComputeQuota" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" "CreditAccountType" NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" TEXT NOT NULL,
    "entryType" "CreditLedgerEntryType" NOT NULL,
    "accountType" "CreditAccountType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "beforeBalance" INTEGER NOT NULL,
    "afterBalance" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "orderId" TEXT,
    "operatorId" TEXT,
    "approverId" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'approved',
    "reason" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "OrderCategory" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "amountCent" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "channel" "PaymentChannel" NOT NULL,
    "productSnapshot" JSONB NOT NULL,
    "priceSnapshot" JSONB NOT NULL,
    "paymentNo" TEXT,
    "refundNo" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageLedger" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "projectName" TEXT,
    "taskType" TEXT NOT NULL DEFAULT '',
    "modelId" TEXT NOT NULL,
    "modelConfigVersion" INTEGER NOT NULL DEFAULT 1,
    "credits" INTEGER NOT NULL,
    "vendorCostCent" INTEGER NOT NULL DEFAULT 0,
    "priceSnapshot" JSONB NOT NULL,
    "status" "UsageStatus" NOT NULL DEFAULT 'success',
    "units" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audience" "PlanAudience" NOT NULL,
    "priceMonthlyCent" INTEGER NOT NULL,
    "priceYearlyMonthlyCent" INTEGER NOT NULL,
    "monthlyCredits" INTEGER NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "concurrency" INTEGER NOT NULL DEFAULT 1,
    "monthlyComputeQuota" INTEGER NOT NULL DEFAULT 0,
    "queue" "QueueType" NOT NULL DEFAULT 'standard',
    "featureWhitelist" TEXT[],
    "modelWhitelist" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanEntitlement" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PlanEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RechargeTier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCent" INTEGER NOT NULL,
    "baseCredits" INTEGER NOT NULL,
    "bonusCredits" INTEGER NOT NULL DEFAULT 0,
    "firstPurchaseOnly" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RechargeTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "capability" "ModelCapability" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "secretRef" TEXT,
    "secretCipher" TEXT,
    "apiKeyLast4" TEXT,
    "billingUnit" TEXT NOT NULL,
    "vendorCostCent" INTEGER NOT NULL DEFAULT 0,
    "creditPrice" INTEGER NOT NULL DEFAULT 0,
    "maxConcurrency" INTEGER NOT NULL DEFAULT 1,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 60,
    "health" "ModelHealth" NOT NULL DEFAULT 'healthy',
    "outputOptions" TEXT[],
    "allowedPlans" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditPolicy" (
    "id" TEXT NOT NULL DEFAULT 'platform',
    "creditsPerYuan" INTEGER NOT NULL,
    "deductionOrder" TEXT[],
    "giftExpiryDays" INTEGER NOT NULL,
    "memberResetDay" INTEGER NOT NULL,
    "minimumGrant" INTEGER NOT NULL,
    "failedTaskRefund" BOOLEAN NOT NULL DEFAULT true,
    "negativeBalanceAllowed" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "beforeSnapshot" JSONB,
    "afterSnapshot" JSONB,
    "reason" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");

-- CreateIndex
CREATE INDEX "AdminRole_role_idx" ON "AdminRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRole_userId_role_key" ON "AdminRole"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_role_key" ON "UserRole"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CreditAccount_userId_accountType_key" ON "CreditAccount"("userId", "accountType");

-- CreateIndex
CREATE UNIQUE INDEX "CreditLedger_idempotencyKey_key" ON "CreditLedger"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CreditLedger_userId_createdAt_idx" ON "CreditLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditLedger_entryType_createdAt_idx" ON "CreditLedger"("entryType", "createdAt");

-- CreateIndex
CREATE INDEX "CreditLedger_operatorId_createdAt_idx" ON "CreditLedger"("operatorId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_category_createdAt_idx" ON "Order"("category", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UsageLedger_taskId_key" ON "UsageLedger"("taskId");

-- CreateIndex
CREATE INDEX "UsageLedger_userId_createdAt_idx" ON "UsageLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UsageLedger_modelId_createdAt_idx" ON "UsageLedger"("modelId", "createdAt");

-- CreateIndex
CREATE INDEX "UsageLedger_status_createdAt_idx" ON "UsageLedger"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Plan_audience_enabled_idx" ON "Plan"("audience", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "PlanEntitlement_planId_key_key" ON "PlanEntitlement"("planId", "key");

-- CreateIndex
CREATE INDEX "RechargeTier_enabled_idx" ON "RechargeTier"("enabled");

-- CreateIndex
CREATE INDEX "ModelConfig_capability_enabled_idx" ON "ModelConfig"("capability", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAuditLog_idempotencyKey_key" ON "AdminAuditLog"("idempotencyKey");

-- CreateIndex
CREATE INDEX "AdminAuditLog_operatorId_createdAt_idx" ON "AdminAuditLog"("operatorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetType_targetId_createdAt_idx" ON "AdminAuditLog"("targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRole" ADD CONSTRAINT "AdminRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditAccount" ADD CONSTRAINT "CreditAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageLedger" ADD CONSTRAINT "UsageLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEntitlement" ADD CONSTRAINT "PlanEntitlement_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- 立账完整性：积分账本与审计日志仅允许追加（禁止 UPDATE / DELETE）
CREATE OR REPLACE FUNCTION "forbid_append_only_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'append-only violation: % is immutable', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "credit_ledger_append_only"
BEFORE UPDATE OR DELETE ON "CreditLedger"
FOR EACH ROW EXECUTE FUNCTION "forbid_append_only_mutation"();

CREATE TRIGGER "admin_audit_log_append_only"
BEFORE UPDATE OR DELETE ON "AdminAuditLog"
FOR EACH ROW EXECUTE FUNCTION "forbid_append_only_mutation"();
