-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('GENERIC', 'COOLIFY');

-- CreateEnum
CREATE TYPE "WebhookEventSeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('NEW', 'READ', 'ARCHIVED');

-- CreateTable
CREATE TABLE "WebhookSource" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "provider" "WebhookProvider" NOT NULL DEFAULT 'GENERIC',
    "secretEnc" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastEventAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WebhookSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "sourceId" UUID NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'unknown',
    "severity" "WebhookEventSeverity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "headers" JSONB,
    "clientIp" TEXT,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'NEW',
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookSource_slug_key" ON "WebhookSource"("slug");

-- CreateIndex
CREATE INDEX "WebhookSource_enabled_idx" ON "WebhookSource"("enabled");

-- CreateIndex
CREATE INDEX "WebhookEvent_sourceId_receivedAt_idx" ON "WebhookEvent"("sourceId", "receivedAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_receivedAt_idx" ON "WebhookEvent"("status", "receivedAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_severity_receivedAt_idx" ON "WebhookEvent"("severity", "receivedAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_idx" ON "WebhookEvent"("eventType");

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WebhookSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
