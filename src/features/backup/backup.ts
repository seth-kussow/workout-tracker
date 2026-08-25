import { ALL_TABLE_NAMES, db } from '../../db/schema';

const SCHEMA_VERSION = 1;
const LAST_BACKUP_KEY = 'workout-tracker:last-backup-at';

interface BackupFile {
  schemaVersion: number;
  exportedAt: string;
  tables: Record<(typeof ALL_TABLE_NAMES)[number], unknown[]>;
}

export async function exportBackup(): Promise<void> {
  const tables = {} as BackupFile['tables'];
  for (const name of ALL_TABLE_NAMES) {
    tables[name] = await db.table(name).toArray();
  }
  const payload: BackupFile = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    tables,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `workout-tracker-backup-${dateStamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

export function getLastBackupAt(): Date | null {
  const raw = localStorage.getItem(LAST_BACKUP_KEY);
  return raw ? new Date(raw) : null;
}

function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.schemaVersion === 'number' &&
    typeof v.tables === 'object' &&
    v.tables !== null &&
    ALL_TABLE_NAMES.every((name) => Array.isArray((v.tables as Record<string, unknown>)[name]))
  );
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!isBackupFile(parsed)) {
    throw new Error('This file is not a valid Workout Tracker backup.');
  }
  if (parsed.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(`Backup schema version ${parsed.schemaVersion} is not supported (expected ${SCHEMA_VERSION}).`);
  }

  await db.transaction('rw', ALL_TABLE_NAMES.map((name) => db.table(name)), async () => {
    for (const name of ALL_TABLE_NAMES) {
      await db.table(name).clear();
      await db.table(name).bulkAdd(parsed.tables[name]);
    }
  });
}
