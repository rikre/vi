-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "discountPct" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Order_organizationId_createdAt_idx" ON "Order"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
