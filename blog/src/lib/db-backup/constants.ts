export const DB_BACKUP_CUSTOM_ID_PREFIX = 'db-backup-';

/** Haftalık yedeklerden tutulacak adet. */
export const DB_BACKUP_WEEKLY_KEEP = 4;

/** Ayın 1’indeki yedeklerden tutulacak adet. */
export const DB_BACKUP_MONTHLY_KEEP = 3;

export const DB_BACKUP_FORMAT_VERSION = 1 as const;

/**
 * customId: db-backup-YYYY-MM-DD veya db-backup-YYYY-MM-DD-<unique>
 * (UploadThing silinen customId’yi hemen yeniden kullanmaya izin vermez.)
 */
export const DB_BACKUP_CUSTOM_ID_PATTERN =
  /^db-backup-(\d{4})-(\d{2})-(\d{2})(?:-.*)?$/;

/**
 * Public snapshot prefix. Her upload unique id alır; load en yeniyi seçer.
 * Retention full backup prune’undan bağımsızdır.
 */
export const PUBLIC_SNAPSHOT_CUSTOM_ID_PREFIX = 'public-snapshot-';

/** Geriye dönük sabit id (eski yüklemeler). */
export const PUBLIC_SNAPSHOT_CUSTOM_ID = 'public-snapshot-latest';

export const PUBLIC_SNAPSHOT_FORMAT_VERSION = 1 as const;

/** Public snapshot’tan tutulacak son N adet (yenisi yazılınca eskiler budanır). */
export const PUBLIC_SNAPSHOT_KEEP = 2;
