INSERT INTO "Permission" ("key", "groupKey", "sortOrder", "updatedAt")
VALUES ('upload:profile-image', 'upload', 33, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE
SET "groupKey" = EXCLUDED."groupKey",
    "sortOrder" = EXCLUDED."sortOrder",
    "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "Permission"
SET "sortOrder" = "sortOrder" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "groupKey" = 'upload'
  AND "key" IN ('upload:blog-image', 'upload:cv', 'upload:delete');

INSERT INTO "RolePermission" ("accessRoleId", "permissionId")
SELECT ar.id, p.id
FROM "AccessRole" ar
CROSS JOIN "Permission" p
WHERE ar.slug = 'member'
  AND p.key = 'upload:profile-image'
ON CONFLICT DO NOTHING;
