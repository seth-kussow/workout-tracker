import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db } from '../../db/schema';
import { getExerciseHistory } from '../../db/queries';
import { formatDisplayDate } from '../../lib/date';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TrendChart } from '../../components/charts/TrendChart';

type Metric = 'weight' | 'reps';

interface ExerciseDetailProps {
  exerciseId: number;
  onBack: () => void;
}

export function ExerciseDetail({ exerciseId, onBack }: ExerciseDetailProps) {
  const exercise = useLiveQuery(() => db.exercises.get(exerciseId), [exerciseId]);
  const history = useLiveQuery(() => getExerciseHistory(exerciseId), [exerciseId]) ?? [];
  const [metric, setMetric] = useState<Metric>('weight');

  if (!exercise) return null;

  const chartData = history
    .filter((h) => (metric === 'weight' ? h.bestWeight != null : true))
    .map((h) => ({ date: h.date, value: metric === 'weight' ? h.bestWeight! : h.totalReps }));

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="self-start text-sm text-sky-300">
        ← History
      </button>
      <h1 className="text-2xl font-semibold">{exercise.name}</h1>

      <div className="flex gap-2">
        <Button variant={metric === 'weight' ? 'primary' : 'secondary'} className="flex-1" onClick={() => setMetric('weight')}>
          Best weight
        </Button>
        <Button variant={metric === 'reps' ? 'primary' : 'secondary'} className="flex-1" onClick={() => setMetric('reps')}>
          Total reps
        </Button>
      </div>

      <Card>
        <TrendChart data={chartData} unit={metric === 'weight' ? exercise.defaultUnit : 'reps'} />
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-medium text-slate-400">Sessions</h2>
        <div className="flex flex-col gap-2">
          {[...history].reverse().map((h) => (
            <Card key={h.logId} className="flex items-center justify-between py-2.5">
              <span className="text-slate-300">{formatDisplayDate(h.date)}</span>
              <span className="text-sm text-slate-400">
                {h.bestWeight != null ? `${h.bestWeight} ${exercise.defaultUnit} · ` : ''}
                {h.totalReps} reps
              </span>
            </Card>
          ))}
          {history.length === 0 && <p className="text-sm text-slate-500">No sessions logged yet.</p>}
        </div>
      </div>
    </div>
  );
}
