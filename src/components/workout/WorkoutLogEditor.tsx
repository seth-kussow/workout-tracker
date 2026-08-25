import { useState } from 'react';
import type { Exercise, SetEntry, WorkoutLog, WorkoutLogEntry } from '../../db/schema';
import { addExercise, listExercises } from '../../db/queries';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberStepper } from '../common/NumberStepper';
import { ExerciseAutocomplete } from '../common/ExerciseAutocomplete';
import { useLiveQuery } from 'dexie-react-hooks';

interface WorkoutLogEditorProps {
  date: string;
  initial?: WorkoutLog;
  onSave: (log: WorkoutLog) => Promise<void>;
  onCancel?: () => void;
  saveLabel?: string;
}

export function WorkoutLogEditor({ date, initial, onSave, onCancel, saveLabel = 'Save workout' }: WorkoutLogEditorProps) {
  const exercises = useLiveQuery(() => listExercises(), []) ?? [];
  const exerciseById = new Map(exercises.map((e) => [e.id!, e]));

  const [entries, setEntries] = useState<WorkoutLogEntry[]>(initial?.entries ?? []);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const addExerciseEntry = (exercise: Exercise) => {
    if (entries.some((e) => e.exerciseId === exercise.id)) return;
    setEntries((prev) => [...prev, { exerciseId: exercise.id!, sets: [{}] }]);
  };

  const removeExerciseEntry = (exerciseId: number) => {
    setEntries((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
  };

  const addSet = (exerciseId: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.exerciseId === exerciseId ? { ...e, sets: [...e.sets, lastSetAsDefault(e.sets)] } : e)),
    );
  };

  const removeSet = (exerciseId: number, index: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.exerciseId === exerciseId ? { ...e, sets: e.sets.filter((_, i) => i !== index) } : e)),
    );
  };

  const updateSet = (exerciseId: number, index: number, patch: Partial<SetEntry>) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.exerciseId === exerciseId
          ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, ...patch } : s)) }
          : e,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        id: initial?.id,
        date,
        templateId: initial?.templateId,
        notes: notes.trim() || undefined,
        entries,
        exerciseIds: entries.map((e) => e.exerciseId),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => {
        const exercise = exerciseById.get(entry.exerciseId);
        return (
          <Card key={entry.exerciseId}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium text-slate-100">{exercise?.name ?? 'Unknown exercise'}</h3>
              <button
                onClick={() => removeExerciseEntry(entry.exerciseId)}
                className="text-sm text-red-400 active:opacity-70"
              >
                Remove
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {entry.sets.map((set, i) => (
                <div key={i} className="flex items-end gap-3">
                  <span className="pb-2.5 w-5 text-sm text-slate-500">{i + 1}</span>
                  <NumberStepper
                    label="Reps"
                    value={set.reps}
                    onChange={(reps) => updateSet(entry.exerciseId, i, { reps })}
                  />
                  <NumberStepper
                    label={`Weight (${exercise?.defaultUnit ?? 'lbs'})`}
                    value={set.weight}
                    step={5}
                    onChange={(weight) => updateSet(entry.exerciseId, i, { weight })}
                  />
                  <button
                    onClick={() => removeSet(entry.exerciseId, i)}
                    aria-label="Remove set"
                    className="pb-2.5 text-slate-500 active:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <Button variant="secondary" onClick={() => addSet(entry.exerciseId)}>
                + Add set
              </Button>
            </div>
          </Card>
        );
      })}

      <ExerciseAutocomplete
        exercises={exercises}
        onSelect={addExerciseEntry}
        onCreate={async (name) => {
          const id = await addExercise(name);
          return { id: id as number, name, defaultUnit: 'lbs' };
        }}
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="rounded-xl bg-slate-800 px-3 py-3 text-base text-slate-100 placeholder:text-slate-500"
      />

      <div className="flex gap-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving || entries.length === 0} className="flex-1">
          {saving ? 'Saving…' : saveLabel}
        </Button>
      </div>
    </div>
  );
}

function lastSetAsDefault(sets: SetEntry[]): SetEntry {
  const last = sets.at(-1);
  return last ? { reps: last.reps, weight: last.weight } : {};
}
