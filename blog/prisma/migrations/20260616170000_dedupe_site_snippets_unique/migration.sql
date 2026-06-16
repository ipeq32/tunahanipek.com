-- Yinelenen site snippet satırlarını kaldır (en düşük sortOrder / en eski kayıt kalır)
DELETE FROM "SiteSnippet"
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY locale, type, content
        ORDER BY "sortOrder" ASC, "createdAt" ASC
      ) AS row_num
    FROM "SiteSnippet"
  ) ranked
  WHERE row_num > 1
);

CREATE UNIQUE INDEX "SiteSnippet_locale_type_content_key"
  ON "SiteSnippet"("locale", "type", "content");
