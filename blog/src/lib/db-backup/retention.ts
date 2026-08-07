import {
  DB_BACKUP_CUSTOM_ID_PATTERN,
  DB_BACKUP_MONTHLY_KEEP,
  DB_BACKUP_WEEKLY_KEEP,
} from '@/lib/db-backup/constants';

export type BackupFileRef = {
  key: string;
  customId: string | null;
};

export type DatedBackupRef = BackupFileRef & {
  customId: string;
  date: string;
};

/**
 * customId `db-backup-YYYY-MM-DD...` ise takvim tarihini döner.
 */
export function parseBackupCustomId(
  customId: string | null | undefined,
): DatedBackupRef['date'] | null {
  if (!customId) return null;
  const match = DB_BACKUP_CUSTOM_ID_PATTERN.exec(customId);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}

export function toDatedBackupRefs(files: BackupFileRef[]): DatedBackupRef[] {
  const dated: DatedBackupRef[] = [];

  for (const file of files) {
    const date = parseBackupCustomId(file.customId);
    if (!date || !file.customId) continue;
    dated.push({ key: file.key, customId: file.customId, date });
  }

  // Aynı gün birden fazla unique id olabilir; full customId ile en yeniyi üste al.
  return dated.sort((a, b) => b.customId.localeCompare(a.customId));
}

/**
 * Son N haftalık + ayın 1’indeki son M yedeği tutar; silinecek file key’leri döner.
 * En güncel yedek her zaman korunur.
 */
export function selectBackupKeysToDelete(
  files: BackupFileRef[],
  weeklyKeep = DB_BACKUP_WEEKLY_KEEP,
  monthlyKeep = DB_BACKUP_MONTHLY_KEEP,
): string[] {
  const dated = toDatedBackupRefs(files);
  if (dated.length === 0) return [];

  const keepCustomIds = new Set<string>();

  keepCustomIds.add(dated[0].customId);

  for (const file of dated.slice(0, weeklyKeep)) {
    keepCustomIds.add(file.customId);
  }

  const monthStarts = dated.filter((file) => file.date.endsWith('-01'));
  for (const file of monthStarts.slice(0, monthlyKeep)) {
    keepCustomIds.add(file.customId);
  }

  return dated
    .filter((file) => !keepCustomIds.has(file.customId))
    .map((file) => file.key);
}

/**
 * Her yüklemede unique customId — UploadThing silinen id’yi hemen recycle etmez.
 */
export function buildBackupCustomId(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const unique = `${date.getUTCHours().toString().padStart(2, '0')}${date
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}${date.getUTCSeconds().toString().padStart(2, '0')}-${date.getUTCMilliseconds().toString().padStart(3, '0')}`;
  return `db-backup-${year}-${month}-${day}-${unique}`;
}

export function buildBackupFileName(customId: string): string {
  return `${customId}.json.gz`;
}

export function buildPublicSnapshotCustomId(date = new Date()): string {
  return `public-snapshot-${date.getTime()}`;
}
