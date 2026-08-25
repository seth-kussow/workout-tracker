import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import type { TemplateExercise, WorkoutTemplate } from '../../db/schema';
import { addExercise, deleteTemplate, listExercises, saveTemplate } from '../../db/queries';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { ExerciseAutocomplete } from '../../components/common/ExerciseAutocomplete';

interface TemplateEditorProps {
  open: boolean;
  onClose: () => void;
  initial?: WorkoutTemplate;
}

export function TemplateEditor({ open, onClose, initial }: TemplateEditorProps) {
  const exercises = useLiveQuery(() => listExercises(), []) ?? [];
  const exerciseById = new Map(exercises.map((e) => [e.id!, e]));

  const [name, setName] = useState(initial?.name ?? '');
  const [items, setItems] = useState<TemplateExercise[]>(initial?.exercises ?? []);

  // reset local state whenever a different template (or a fresh "new template") is opened
  const initialKey = initial?.id ?? 'new';
  const [openedFor, setOpenedFor] = useState(initialKey);
  if (openedFor !== initialKey) {
    setOpenedFor(initialKey);
    setName(initial?.name ?? '');
    setItems(initial?.exercises ?? []);
  }

  const addItem = (exerciseId: number) => {
    if (items.some((i) => i.exerciseId === exerciseId)) return;
    setItems((prev) => [...prev, { exerciseId, targetSets: 3 }]);
  };

  const removeItem = (exerciseId: number) => {
    setItems((prev) => prev.filter((i) => i.exerciseId !== exerciseId));
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await saveTemplate({ id: initial?.id, name: trimmed, exercises: items });
    onClose();
  };

  const handleDelete = async () => {
    if (initial?.id == null) return;
    await deleteTemplate(initial.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit workout' : 'New workout'}>
      <div className="flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workout name (e.g. Push Day)"
          className="rounded-xl bg-slate-800 px-3 py-3 text-base text-slate-100 placeholder:text-slate-500"
        />

        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.exerciseId} className="flex items-center justify-between rounded-xl bg-slate-800 px-3 py-2.5">
              <span className="text-slate-100">{exerciseById.get(item.exerciseId)?.name}</span>
              <button onClick={() => removeItem(item.exerciseId)} className="text-sm text-red-400">
                Remove
              </button>
            </div>
          ))}
        </div>

        <ExerciseAutocomplete
          exercises={exercises}
          onSelect={(exercise) => addItem(exercise.id!)}
          onCreate={async (n) => {
            const id = await addExercise(n);
            return { id: id as number, name: n, defaultUnit: 'lbs' };
          }}
        />

        <div className="flex gap-2 pt-2">
          {initial && (
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={!name.trim()} className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
