INSERT INTO "Permission" ("key", "groupKey", "sortOrder", "updatedAt")
VALUES
  ('upload:project-image', 'upload', 35, CURRENT_TIMESTAMP),
  ('project:publish', 'project', 17, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE
SET "groupKey" = EXCLUDED."groupKey",
    "sortOrder" = EXCLUDED."sortOrder",
    "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "Permission"
SET "sortOrder" = "sortOrder" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "groupKey" = 'upload'
  AND "key" IN ('upload:cv', 'upload:delete');

UPDATE "Permission"
SET "sortOrder" = "sortOrder" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "groupKey" = 'project'
  AND "key" = 'project:admin-list';
