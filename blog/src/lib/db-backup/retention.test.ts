import { describe, expect, it } from 'vitest';
import {
  buildBackupCustomId,
  buildBackupFileName,
  parseBackupCustomId,
  selectBackupKeysToDelete,
} from './retention';

describe('parseBackupCustomId', () => {
  it('parses valid custom ids', () => {
    expect(parseBackupCustomId('db-backup-2026-08-07')).toBe('2026-08-07');
  });

  it('rejects invalid ids', () => {
    expect(parseBackupCustomId('backup-2026-08-07')).toBeNull();
    expect(parseBackupCustomId(null)).toBeNull();
  });
});

describe('buildBackupCustomId', () => {
  it('formats UTC date', () => {
    expect(buildBackupCustomId(new Date(Date.UTC(2026, 7, 7)))).toBe(
      'db-backup-2026-08-07',
    );
    expect(buildBackupFileName('db-backup-2026-08-07')).toBe(
      'db-backup-2026-08-07.json.gz',
    );
  });
});

describe('selectBackupKeysToDelete', () => {
  it('keeps newest weekly and month-start backups', () => {
    const files = [
      { key: 'k1', customId: 'db-backup-2026-08-03' },
      { key: 'k2', customId: 'db-backup-2026-07-27' },
      { key: 'k3', customId: 'db-backup-2026-07-20' },
      { key: 'k4', customId: 'db-backup-2026-07-13' },
      { key: 'k5', customId: 'db-backup-2026-07-06' },
      { key: 'k6', customId: 'db-backup-2026-07-01' },
      { key: 'k7', customId: 'db-backup-2026-06-01' },
      { key: 'k8', customId: 'db-backup-2026-05-01' },
      { key: 'k9', customId: 'db-backup-2026-04-01' },
      { key: 'k10', customId: null },
      { key: 'k11', customId: 'avatar-xyz' },
    ];

    const deleted = selectBackupKeysToDelete(files, 4, 3);

    // Weekly keep: 08-03, 07-27, 07-20, 07-13
    // Monthly keep: 07-01, 06-01, 05-01 (04-01 drops)
    // Also 07-06 is outside weekly top-4 and not month-start → delete
    expect(deleted.sort()).toEqual(['k5', 'k9'].sort());
  });

  it('returns empty when nothing to prune', () => {
    expect(
      selectBackupKeysToDelete([
        { key: 'a', customId: 'db-backup-2026-08-01' },
        { key: 'b', customId: 'db-backup-2026-07-25' },
      ]),
    ).toEqual([]);
  });

  it('never deletes the newest backup even when keep counts are zero', () => {
    const deleted = selectBackupKeysToDelete(
      [
        { key: 'newest', customId: 'db-backup-2026-08-03' },
        { key: 'old', customId: 'db-backup-2026-01-01' },
        { key: 'older', customId: 'db-backup-2025-12-01' },
      ],
      0,
      0,
    );

    expect(deleted.sort()).toEqual(['old', 'older'].sort());
    expect(deleted).not.toContain('newest');
  });
});
