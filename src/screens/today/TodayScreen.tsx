import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import type { WorkoutLog, WorkoutLogEntry } from '../../db/schema';
import {
  getLogForDate,
  getStatusForDate,
  getTemplate,
  getWeeklyPlan,
  getRecentLogs,
  saveWorkoutLog,
  setStatusForDate,
} from '../../db/queries';
import { dayOfWeekForKey, formatDisplayDate, todayKey } from '../../lib/date';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { WorkoutLogEditor } from '../../components/workout/WorkoutLogEditor';

export function TodayScreen() {
  const date = useMemo(() => todayKey(), []);
  const dayOfWeek = dayOfWeekForKey(date);

  const log = useLiveQuery(() => getLogForDate(date), [date]);
  const status = useLiveQuery(() => getStatusForDate(date), [date]);
  const weeklyPlan = useLiveQuery(() => getWeeklyPlan(), []);
  const plannedTemplateId = weeklyPlan?.find((p) => p.dayOfWeek === dayOfWeek)?.templateId ?? null;
  const plannedTemplate = useLiveQuery(
    () => (plannedTemplateId != null ? getTemplate(plannedTemplateId) : undefined),
    [plannedTemplateId],
  );
  const recentLogs = useLiveQuery(() => getRecentLogs(5), []) ?? [];

  const [started, setStarted] = useState(false);

  // `log`/`status` legitimately resolve to undefined when nothing is logged yet today,
  // so only `weeklyPlan` (always an array once loaded) can safely gate the loading state.
  if (weeklyPlan === undefined) return null;

  const isSkipped = status?.status === 'skipped';
  const showEditor = started || log != null;

  const initialEntries: WorkoutLogEntry[] | undefined = plannedTemplate?.exercises.map((te) => ({
    exerciseId: te.exerciseId,
    sets: Array.from({ length: te.targetSets ?? 1 }, () => ({ reps: te.targetReps })),
  }));

  const exercisePrescriptions = plannedTemplate
    ? Object.fromEntries(
        plannedTemplate.exercises.filter((te) => te.prescription).map((te) => [te.exerciseId, te.prescription!]),
      )
    : undefined;

  const handleSave = async (draft: WorkoutLog) => {
    const id = await saveWorkoutLog({ ...draft, templateId: plannedTemplate?.id });
    await setStatusForDate(date, 'done', id);
  };

  const handleSkip = async () => {
    await setStatusForDate(date, 'skipped');
  };

  const otherRecentLogs = recentLogs.filter((l) => l.date !== date);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-slate-400">{formatDisplayDate(date)}</p>
        <h1 className="text-2xl font-semibold">Today</h1>
      </div>

      {!showEditor && (
        <Card>
          {plannedTemplate ? (
            <>
              <p className="text-sm text-slate-400">Planned workout</p>
              <p className="mb-3 text-lg font-medium text-slate-100">{plannedTemplate.name}</p>
            </>
          ) : (
            <p className="mb-3 text-slate-300">No workout planned today.</p>
          )}

          {isSkipped ? (
            <p className="text-sm text-amber-400">Marked as skipped today.</p>
          ) : (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setStarted(true)}>
                {plannedTemplate ? 'Start workout' : 'Log freeform workout'}
              </Button>
              {plannedTemplate && (
                <Button variant="secondary" onClick={handleSkip}>
                  Skip
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {showEditor && (
        <WorkoutLogEditor
          date={date}
          initial={log ?? (initialEntries ? { date, entries: initialEntries, exerciseIds: [] } : undefined)}
          onSave={handleSave}
          saveLabel={log ? 'Update workout' : 'Save workout'}
          exercisePrescriptions={exercisePrescriptions}
        />
      )}

      {otherRecentLogs.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-400">Recent</h2>
          <div className="flex flex-col gap-2">
            {otherRecentLogs.map((l) => (
              <Card key={l.id} className="flex items-center justify-between py-3">
                <span className="text-slate-200">{formatDisplayDate(l.date)}</span>
                <span className="text-sm text-slate-500">{l.entries.length} exercise{l.entries.length === 1 ? '' : 's'}</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
