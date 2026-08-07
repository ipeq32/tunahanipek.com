export const DB_BACKUP_CUSTOM_ID_PREFIX = 'db-backup-';

/** Haftalık yedeklerden tutulacak adet. */
export const DB_BACKUP_WEEKLY_KEEP = 4;

/** Ayın 1’indeki yedeklerden tutulacak adet. */
export const DB_BACKUP_MONTHLY_KEEP = 3;

export const DB_BACKUP_FORMAT_VERSION = 1 as const;

/** customId: db-backup-YYYY-MM-DD */
export const DB_BACKUP_CUSTOM_ID_PATTERN =
  /^db-backup-(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Public (secret’sız) okuma snapshot’ı — DB down iken GET fallback.
 * Retention bu dosyaya dokunmaz (db-backup- prefix’i değil).
 */
export const PUBLIC_SNAPSHOT_CUSTOM_ID = 'public-snapshot-latest';

export const PUBLIC_SNAPSHOT_FORMAT_VERSION = 1 as const;