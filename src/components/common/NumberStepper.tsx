interface NumberStepperProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  step?: number;
  min?: number;
}

export function NumberStepper({ label, value, onChange, step = 1, min = 0 }: NumberStepperProps) {
  const current = value ?? 0;

  const adjust = (delta: number) => {
    const next = Math.max(min, roundToStep(current + delta, step));
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjust(-step)}
          className="h-9 w-9 shrink-0 rounded-lg bg-slate-800 text-lg text-slate-100 active:bg-slate-700"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className="w-16 rounded-lg bg-slate-800 px-2 py-2 text-center text-base text-slate-100"
        />
        <button
          type="button"
          onClick={() => adjust(step)}
          className="h-9 w-9 shrink-0 rounded-lg bg-slate-800 text-lg text-slate-100 active:bg-slate-700"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}
