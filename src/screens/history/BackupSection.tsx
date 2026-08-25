import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { exportBackup, getLastBackupAt, importBackup } from '../../features/backup/backup';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastBackupAt, setLastBackupAt] = useState(() => getLastBackupAt());
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    await exportBackup();
    setLastBackupAt(getLastBackupAt());
    setMessage('Backup downloaded.');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('This replaces all current data on this device with the backup file. Continue?')) return;
    try {
      await importBackup(file);
      setMessage('Backup restored.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed.');
    }
  };

  return (
    <Card>
      <p className="mb-1 text-sm font-medium text-slate-400">Backup</p>
      <p className="mb-3 text-xs text-slate-500">
        Data lives only on this device.{' '}
        {lastBackupAt ? `Last backup: ${lastBackupAt.toLocaleDateString()}.` : 'No backup taken yet.'}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={handleExport}>
          Export
        </Button>
        <Button variant="secondary" className="flex-1" onClick={handleImportClick}>
          Import
        </Button>
      </div>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
      {message && <p className="mt-2 text-xs text-slate-500">{message}</p>}
    </Card>
  );
}
