import { describe, expect, it } from 'vitest';
import {
  buildBackupCustomId,
  buildBackupFileName,
  parseBackupCustomId,
  selectBackupKeysToDelete,
} from './retention';

describe('parseBackupCustomId', () => {
  it('parses date-only and unique custom ids', () => {
    expect(parseBackupCustomId('db-backup-2026-08-07')).toBe('2026-08-07');
    expect(parseBackupCustomId('db-backup-2026-08-07-192400-123')).toBe(
      '2026-08-07',
    );
  });

  it('rejects invalid ids', () => {
    expect(parseBackupCustomId('backup-2026-08-07')).toBeNull();
    expect(parseBackupCustomId(null)).toBeNull();
  });
});

describe('buildBackupCustomId', () => {
  it('formats UTC date with unique suffix', () => {
    const id = buildBackupCustomId(new Date(Date.UTC(2026, 7, 7, 19, 24, 0, 42)));
    expect(id.startsWith('db-backup-2026-08-07-')).toBe(true);
    expect(buildBackupFileName(id)).toBe(`${id}.json.gz`);
  });
});

describe('selectBackupKeysToDelete', () => {
  it('keeps newest weekly and month-start backups', () => {
    const files = [
      { key: 'k1', customId: 'db-backup-2026-08-03-1' },
      { key: 'k2', customId: 'db-backup-2026-07-27-1' },
      { key: 'k3', customId: 'db-backup-2026-07-20-1' },
      { key: 'k4', customId: 'db-backup-2026-07-13-1' },
      { key: 'k5', customId: 'db-backup-2026-07-06-1' },
      { key: 'k6', customId: 'db-backup-2026-07-01-1' },
      { key: 'k7', customId: 'db-backup-2026-06-01-1' },
      { key: 'k8', customId: 'db-backup-2026-05-01-1' },
      { key: 'k9', customId: 'db-backup-2026-04-01-1' },
      { key: 'k10', customId: null },
      { key: 'k11', customId: 'avatar-xyz' },
    ];

    const deleted = selectBackupKeysToDelete(files, 4, 3);

    expect(deleted.sort()).toEqual(['k5', 'k9'].sort());
  });

  it('returns empty when nothing to prune', () => {
    expect(
      selectBackupKeysToDelete([
        { key: 'a', customId: 'db-backup-2026-08-01-1' },
        { key: 'b', customId: 'db-backup-2026-07-25-1' },
      ]),
    ).toEqual([]);
  });

  it('never deletes the newest backup even when keep counts are zero', () => {
    const deleted = selectBackupKeysToDelete(
      [
        { key: 'newest', customId: 'db-backup-2026-08-03-9' },
        { key: 'old', customId: 'db-backup-2026-01-01-1' },
        { key: 'older', customId: 'db-backup-2025-12-01-1' },
      ],
      0,
      0,
    );

    expect(deleted.sort()).toEqual(['old', 'older'].sort());
    expect(deleted).not.toContain('newest');
  });
});
