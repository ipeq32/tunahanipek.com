-- CreateTable
CREATE TABLE "Language" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTranslation" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "blogId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BlogTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTranslation" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "projectId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProjectTranslation_pkey" PRIMARY KEY ("id")
);

-- Seed languages
INSERT INTO "Language" ("id", "code", "name", "isDefault", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
    (uuid_generate_v4(), 'tr', 'Türkçe', true, true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'en', 'English', false, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Migrate existing blog content to Turkish translations
INSERT INTO "BlogTranslation" ("id", "blogId", "languageId", "title", "content", "summary", "published", "createdAt", "updatedAt")
SELECT
    uuid_generate_v4(),
    b."id",
    l."id",
    b."title",
    b."content",
    b."summary",
    b."published",
    b."createdAt",
    b."updatedAt"
FROM "Blog" b
CROSS JOIN "Language" l
WHERE l."code" = 'tr';

-- Migrate existing project content to Turkish translations
INSERT INTO "ProjectTranslation" ("id", "projectId", "languageId", "title", "description", "published", "createdAt", "updatedAt")
SELECT
    uuid_generate_v4(),
    p."id",
    l."id",
    p."title",
    p."description",
    p."published",
    p."createdAt",
    p."updatedAt"
FROM "Project" p
CROSS JOIN "Language" l
WHERE l."code" = 'tr';

-- Drop migrated columns from Blog
ALTER TABLE "Blog" DROP COLUMN "title",
DROP COLUMN "content",
DROP COLUMN "summary",
DROP COLUMN "published";

-- Drop migrated columns from Project
ALTER TABLE "Project" DROP COLUMN "title",
DROP COLUMN "description",
DROP COLUMN "published";

-- DropIndex
DROP INDEX IF EXISTS "Project_published_sortOrder_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTranslation_blogId_languageId_key" ON "BlogTranslation"("blogId", "languageId");

-- CreateIndex
CREATE INDEX "BlogTranslation_languageId_published_idx" ON "BlogTranslation"("languageId", "published");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTranslation_projectId_languageId_key" ON "ProjectTranslation"("projectId", "languageId");

-- CreateIndex
CREATE INDEX "ProjectTranslation_languageId_published_idx" ON "ProjectTranslation"("languageId", "published");

-- CreateIndex
CREATE INDEX "Project_sortOrder_idx" ON "Project"("sortOrder");

-- AddForeignKey
ALTER TABLE "BlogTranslation" ADD CONSTRAINT "BlogTranslation_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTranslation" ADD CONSTRAINT "BlogTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTranslation" ADD CONSTRAINT "ProjectTranslation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTranslation" ADD CONSTRAINT "ProjectTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
