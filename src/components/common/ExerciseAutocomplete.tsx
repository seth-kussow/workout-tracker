import { useMemo, useState } from 'react';
import type { Exercise } from '../../db/schema';

interface ExerciseAutocompleteProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onCreate: (name: string) => Promise<Exercise>;
  placeholder?: string;
}

export function ExerciseAutocomplete({ exercises, onSelect, onCreate, placeholder }: ExerciseAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises.slice(0, 8);
    return exercises.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8);
  }, [exercises, query]);

  const exactMatch = exercises.some((e) => e.name.toLowerCase() === query.trim().toLowerCase());

  const choose = (exercise: Exercise) => {
    onSelect(exercise);
    setQuery('');
    setOpen(false);
  };

  const createAndChoose = async () => {
    const name = query.trim();
    if (!name) return;
    const created = await onCreate(name);
    choose(created);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? 'Add exercise...'}
        className="w-full rounded-xl bg-slate-800 px-3 py-3 text-base text-slate-100 placeholder:text-slate-500"
      />
      {open && query.trim() && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg">
          {matches.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => choose(exercise)}
              className="block w-full px-3 py-2.5 text-left text-slate-100 active:bg-slate-700"
            >
              {exercise.name}
            </button>
          ))}
          {!exactMatch && (
            <button
              type="button"
              onClick={createAndChoose}
              className="block w-full border-t border-slate-700 px-3 py-2.5 text-left text-sky-300 active:bg-slate-700"
            >
              + Add "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
