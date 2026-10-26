-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementItem" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "iconKey" TEXT,
    "linkUrl" TEXT,
    "badge" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "extra" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlacementItem_placementId_status_sortOrder_idx" ON "PlacementItem"("placementId", "status", "sortOrder");

-- AddForeignKey
ALTER TABLE "PlacementItem" ADD CONSTRAINT "PlacementItem_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
