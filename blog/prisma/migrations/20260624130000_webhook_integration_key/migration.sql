-- Replace WebhookProvider enum with extensible integrationKey string
ALTER TABLE "WebhookSource" ADD COLUMN "integrationKey" TEXT NOT NULL DEFAULT 'generic';

UPDATE "WebhookSource"
SET "integrationKey" = CASE
  WHEN "provider" = 'COOLIFY' THEN 'coolify'
  ELSE 'generic'
END;

ALTER TABLE "WebhookSource" DROP COLUMN "provider";

DROP TYPE "WebhookProvider";
