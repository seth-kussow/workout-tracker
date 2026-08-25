import type { WorkoutTemplate } from '../../db/schema';
import { Modal } from '../../components/common/Modal';
import { DAY_LABELS } from '../../lib/date';

interface DayTemplatePickerProps {
  dayOfWeek: number | null;
  templates: WorkoutTemplate[];
  onPick: (templateId: number | null) => void;
  onClose: () => void;
}

export function DayTemplatePicker({ dayOfWeek, templates, onPick, onClose }: DayTemplatePickerProps) {
  return (
    <Modal open={dayOfWeek != null} onClose={onClose} title={dayOfWeek != null ? DAY_LABELS[dayOfWeek] : ''}>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onPick(null)}
          className="rounded-xl bg-slate-800 px-3 py-3 text-left text-slate-300 active:bg-slate-700"
        >
          Rest day
        </button>
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id!)}
            className="rounded-xl bg-slate-800 px-3 py-3 text-left text-slate-100 active:bg-slate-700"
          >
            {t.name}
          </button>
        ))}
        {templates.length === 0 && (
          <p className="px-1 text-sm text-slate-500">No workouts created yet — add one below first.</p>
        )}
      </div>
    </Modal>
  );
}
