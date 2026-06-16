-- Permission catalog
CREATE TABLE "Permission" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "key" TEXT NOT NULL,
    "groupKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");
CREATE INDEX "Permission_groupKey_sortOrder_idx" ON "Permission"("groupKey", "sortOrder");

-- Access roles
CREATE TABLE "AccessRole" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AccessRole_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AccessRole_slug_key" ON "AccessRole"("slug");
CREATE INDEX "AccessRole_isSystem_idx" ON "AccessRole"("isSystem");

-- Role ↔ Permission junction
CREATE TABLE "RolePermission" (
    "accessRoleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("accessRoleId", "permissionId")
);

CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

ALTER TABLE "RolePermission"
  ADD CONSTRAINT "RolePermission_accessRoleId_fkey"
  FOREIGN KEY ("accessRoleId") REFERENCES "AccessRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RolePermission"
  ADD CONSTRAINT "RolePermission_permissionId_fkey"
  FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed permission catalog
INSERT INTO "Permission" ("key", "groupKey", "sortOrder", "updatedAt") VALUES
  ('blog:read', 'blog', 0, CURRENT_TIMESTAMP),
  ('blog:create', 'blog', 1, CURRENT_TIMESTAMP),
  ('blog:update', 'blog', 2, CURRENT_TIMESTAMP),
  ('blog:update-any', 'blog', 3, CURRENT_TIMESTAMP),
  ('blog:delete', 'blog', 4, CURRENT_TIMESTAMP),
  ('blog:delete-any', 'blog', 5, CURRENT_TIMESTAMP),
  ('blog:publish', 'blog', 6, CURRENT_TIMESTAMP),
  ('blog:auto-publish', 'blog', 7, CURRENT_TIMESTAMP),
  ('blog:admin-list', 'blog', 8, CURRENT_TIMESTAMP),
  ('comment:create', 'comment', 9, CURRENT_TIMESTAMP),
  ('comment:react', 'comment', 10, CURRENT_TIMESTAMP),
  ('comment:moderate', 'comment', 11, CURRENT_TIMESTAMP),
  ('project:read', 'project', 12, CURRENT_TIMESTAMP),
  ('project:create', 'project', 13, CURRENT_TIMESTAMP),
  ('project:update', 'project', 14, CURRENT_TIMESTAMP),
  ('project:delete', 'project', 15, CURRENT_TIMESTAMP),
  ('project:admin-list', 'project', 16, CURRENT_TIMESTAMP),
  ('user:read', 'user', 17, CURRENT_TIMESTAMP),
  ('user:update-role', 'user', 18, CURRENT_TIMESTAMP),
  ('user:delete', 'user', 19, CURRENT_TIMESTAMP),
  ('role:read', 'role', 20, CURRENT_TIMESTAMP),
  ('role:create', 'role', 21, CURRENT_TIMESTAMP),
  ('role:update', 'role', 22, CURRENT_TIMESTAMP),
  ('role:delete', 'role', 23, CURRENT_TIMESTAMP),
  ('ai:status', 'ai', 24, CURRENT_TIMESTAMP),
  ('ai:content-blog', 'ai', 25, CURRENT_TIMESTAMP),
  ('ai:content-project', 'ai', 26, CURRENT_TIMESTAMP),
  ('ai:settings-read', 'ai', 27, CURRENT_TIMESTAMP),
  ('ai:settings-update', 'ai', 28, CURRENT_TIMESTAMP),
  ('ai:settings-test', 'ai', 29, CURRENT_TIMESTAMP),
  ('resume:read', 'resume', 30, CURRENT_TIMESTAMP),
  ('resume:update', 'resume', 31, CURRENT_TIMESTAMP),
  ('resume:delete', 'resume', 32, CURRENT_TIMESTAMP),
  ('upload:blog-image', 'upload', 33, CURRENT_TIMESTAMP),
  ('upload:cv', 'upload', 34, CURRENT_TIMESTAMP),
  ('upload:delete', 'upload', 35, CURRENT_TIMESTAMP),
  ('profile:update', 'profile', 36, CURRENT_TIMESTAMP),
  ('password:update', 'profile', 37, CURRENT_TIMESTAMP),
  ('account:read', 'profile', 38, CURRENT_TIMESTAMP),
  ('account:unlink', 'profile', 39, CURRENT_TIMESTAMP),
  ('account:link', 'profile', 40, CURRENT_TIMESTAMP);

-- Seed system roles
INSERT INTO "AccessRole" ("id", "name", "slug", "description", "isSystem", "updatedAt")
VALUES
  (
    '00000000-0000-4000-8000-000000000001',
    'Üye',
    'member',
    'Temel site erişimi ve profil yönetimi',
    true,
    CURRENT_TIMESTAMP
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'Süper Admin',
    'super-admin',
    'Sistem yöneticisi rolü — yetkiler özel rollere göre atanır',
    true,
    CURRENT_TIMESTAMP
  );

-- Assign member role permissions
INSERT INTO "RolePermission" ("accessRoleId", "permissionId")
SELECT '00000000-0000-4000-8000-000000000001', p.id
FROM "Permission" p
WHERE p.key IN (
  'blog:read', 'project:read', 'comment:create', 'comment:react',
  'profile:update', 'password:update', 'account:read', 'account:unlink',
  'account:link', 'upload:delete'
);

-- Add accessRoleId column (nullable during backfill)
ALTER TABLE "User" ADD COLUMN "accessRoleId" UUID;

UPDATE "User"
SET "accessRoleId" = '00000000-0000-4000-8000-000000000001'
WHERE "role" IN ('USER', 'ADMIN') AND "accessRoleId" IS NULL;

UPDATE "User"
SET "accessRoleId" = '00000000-0000-4000-8000-000000000002'
WHERE "role" = 'SUPER_ADMIN' AND "accessRoleId" IS NULL;

UPDATE "User"
SET "accessRoleId" = '00000000-0000-4000-8000-000000000001'
WHERE "accessRoleId" IS NULL;

ALTER TABLE "User" ALTER COLUMN "accessRoleId" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_accessRoleId_fkey"
  FOREIGN KEY ("accessRoleId") REFERENCES "AccessRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
