INSERT INTO "Permission" ("key", "groupKey", "sortOrder", "updatedAt")
VALUES ('ai:content-site-copy', 'ai', 30, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE
SET "groupKey" = EXCLUDED."groupKey",
    "sortOrder" = EXCLUDED."sortOrder",
    "updatedAt" = CURRENT_TIMESTAMP;
