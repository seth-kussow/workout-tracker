import { useLiveQuery } from 'dexie-react-hooks';
import type { WorkoutLog } from '../../db/schema';
import { deleteWorkoutLog, getWorkoutLog, saveWorkoutLog } from '../../db/queries';
import { formatDisplayDate } from '../../lib/date';
import { Button } from '../../components/common/Button';
import { WorkoutLogEditor } from '../../components/workout/WorkoutLogEditor';

interface LogDetailProps {
  logId: number;
  onBack: () => void;
}

export function LogDetail({ logId, onBack }: LogDetailProps) {
  const log = useLiveQuery(() => getWorkoutLog(logId), [logId]);

  if (!log) return null;

  const handleSave = async (draft: WorkoutLog) => {
    await saveWorkoutLog(draft);
    onBack();
  };

  const handleDelete = async () => {
    await deleteWorkoutLog(logId);
    onBack();
  };

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="self-start text-sm text-sky-300">
        ← History
      </button>
      <h1 className="text-2xl font-semibold">{formatDisplayDate(log.date)}</h1>

      <WorkoutLogEditor date={log.date} initial={log} onSave={handleSave} saveLabel="Save changes" />

      <Button variant="danger" onClick={handleDelete}>
        Delete workout
      </Button>
    </div>
  );
}
