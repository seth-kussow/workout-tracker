import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { listAllLogs, listExercises } from '../../db/queries';
import { formatDisplayDate } from '../../lib/date';
import { Card } from '../../components/common/Card';
import { LogDetail } from './LogDetail';
import { ExerciseDetail } from './ExerciseDetail';
import { BackupSection } from './BackupSection';

type SubTab = 'logs' | 'exercises';

export function HistoryScreen() {
  const [subTab, setSubTab] = useState<SubTab>('logs');
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  const logs = useLiveQuery(() => listAllLogs(), []) ?? [];
  const exercises = useLiveQuery(() => listExercises(), []) ?? [];

  if (selectedLogId != null) {
    return <LogDetail logId={selectedLogId} onBack={() => setSelectedLogId(null)} />;
  }
  if (selectedExerciseId != null) {
    return <ExerciseDetail exerciseId={selectedExerciseId} onBack={() => setSelectedExerciseId(null)} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">History</h1>

      <div className="flex gap-1 rounded-xl bg-slate-900 p-1">
        <SubTabButton active={subTab === 'logs'} onClick={() => setSubTab('logs')} label="Workouts" />
        <SubTabButton active={subTab === 'exercises'} onClick={() => setSubTab('exercises')} label="By exercise" />
      </div>

      {subTab === 'logs' && (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <button key={log.id} onClick={() => setSelectedLogId(log.id!)} className="text-left">
              <Card className="flex items-center justify-between py-3">
                <span className="text-slate-100">{formatDisplayDate(log.date)}</span>
                <span className="text-sm text-slate-500">
                  {log.entries.length} exercise{log.entries.length === 1 ? '' : 's'}
                </span>
              </Card>
            </button>
          ))}
          {logs.length === 0 && <p className="text-sm text-slate-500">No workouts logged yet.</p>}
        </div>
      )}

      {subTab === 'exercises' && (
        <div className="flex flex-col gap-2">
          {exercises.map((ex) => (
            <button key={ex.id} onClick={() => setSelectedExerciseId(ex.id!)} className="text-left">
              <Card className="py-3">
                <span className="text-slate-100">{ex.name}</span>
              </Card>
            </button>
          ))}
          {exercises.length === 0 && <p className="text-sm text-slate-500">No exercises yet — add one from Today or Plan.</p>}
        </div>
      )}

      <BackupSection />
    </div>
  );
}

function SubTabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-medium ${active ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}
    >
      {label}
    </button>
  );
}
