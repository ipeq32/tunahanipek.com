CREATE TYPE "SiteSnippetType" AS ENUM ('TIP', 'FOOTER_MOTTO');

CREATE TABLE "SiteSnippet" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "type" "SiteSnippetType" NOT NULL,
    "locale" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SiteSnippet_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SiteSnippet_type_locale_sortOrder_idx" ON "SiteSnippet"("type", "locale", "sortOrder");
CREATE INDEX "SiteSnippet_type_locale_isActive_idx" ON "SiteSnippet"("type", "locale", "isActive");

INSERT INTO "Permission" ("key", "groupKey", "sortOrder", "updatedAt")
VALUES
  ('site-copy:read', 'site-copy', 41, CURRENT_TIMESTAMP),
  ('site-copy:update', 'site-copy', 42, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE
SET "groupKey" = EXCLUDED."groupKey",
    "sortOrder" = EXCLUDED."sortOrder",
    "updatedAt" = CURRENT_TIMESTAMP;
