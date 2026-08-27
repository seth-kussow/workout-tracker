import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import type { WorkoutTemplate } from '../../db/schema';
import { getStatusesForWeek, getWeeklyPlan, listTemplates, setPlanForDay } from '../../db/queries';
import { currentWeekKeys, DAY_LABELS, todayKey } from '../../lib/date';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DayTemplatePicker } from './DayTemplatePicker';
import { TemplateEditor } from './TemplateEditor';
import { importPotreroChicoPlan } from '../../features/importPlan/importPotreroChicoPlan';

export function PlanScreen() {
  const weeklyPlan = useLiveQuery(() => getWeeklyPlan(), []) ?? [];
  const templates = useLiveQuery(() => listTemplates(), []) ?? [];
  const weekKeys = useMemo(() => currentWeekKeys(), []);
  const statuses = useLiveQuery(() => getStatusesForWeek(weekKeys), [weekKeys]);
  const today = todayKey();

  const templateById = new Map(templates.map((t) => [t.id!, t]));

  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | 'new' | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleImportPlan = async () => {
    const result = await importPotreroChicoPlan();
    setImportMessage(`Imported ${result.templatesImported} workouts, ${result.exercisesCreated} new exercises.`);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Plan</h1>

      <div className="flex flex-col gap-2">
        {weeklyPlan.map((plan) => {
          const template = plan.templateId != null ? templateById.get(plan.templateId) : undefined;
          const dateKey = weekKeys[plan.dayOfWeek];
          const status = statuses?.get(dateKey);
          const isToday = dateKey === today;
          return (
            <button
              key={plan.dayOfWeek}
              onClick={() => setPickerDay(plan.dayOfWeek)}
              className={`w-full text-left ${isToday ? '' : ''}`}
            >
              <Card className={`flex items-center justify-between ${isToday ? 'border-sky-500' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-10 text-sm font-medium ${isToday ? 'text-sky-300' : 'text-slate-400'}`}>
                    {DAY_LABELS[plan.dayOfWeek]}
                  </span>
                  <span className="text-slate-100">{template ? template.name : 'Rest'}</span>
                </div>
                {status && <StatusBadge status={status.status} />}
              </Card>
            </button>
          );
        })}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-400">Workouts</h2>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleImportPlan}>
              Import climbing plan
            </Button>
            <Button variant="ghost" onClick={() => setEditingTemplate('new')}>
              + New
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {templates.map((t) => (
            <button key={t.id} onClick={() => setEditingTemplate(t)} className="text-left">
              <Card className="flex items-center justify-between py-3">
                <span className="text-slate-100">{t.name}</span>
                <span className="text-sm text-slate-500">{t.exercises.length} exercises</span>
              </Card>
            </button>
          ))}
          {templates.length === 0 && <p className="text-sm text-slate-500">No workouts yet.</p>}
        </div>
        {importMessage && <p className="mt-2 text-xs text-slate-500">{importMessage}</p>}
      </div>

      <DayTemplatePicker
        dayOfWeek={pickerDay}
        templates={templates}
        onClose={() => setPickerDay(null)}
        onPick={async (templateId) => {
          if (pickerDay != null) await setPlanForDay(pickerDay, templateId);
          setPickerDay(null);
        }}
      />

      <TemplateEditor
        open={editingTemplate != null}
        onClose={() => setEditingTemplate(null)}
        initial={editingTemplate === 'new' || editingTemplate == null ? undefined : editingTemplate}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: 'done' | 'skipped' }) {
  return (
    <span className={`text-lg ${status === 'done' ? 'text-emerald-400' : 'text-slate-500'}`}>
      {status === 'done' ? '✓' : '–'}
    </span>
  );
}
