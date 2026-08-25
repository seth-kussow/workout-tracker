import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { addAssessmentEntry, deleteAssessment, deleteAssessmentEntry, getAssessmentHistory } from '../../db/queries';
import { db } from '../../db/schema';
import { formatDisplayDate, todayKey } from '../../lib/date';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TrendChart } from '../../components/charts/TrendChart';

interface AssessmentDetailProps {
  assessmentId: number;
  onBack: () => void;
}

export function AssessmentDetail({ assessmentId, onBack }: AssessmentDetailProps) {
  const assessment = useLiveQuery(() => db.assessments.get(assessmentId), [assessmentId]);
  const history = useLiveQuery(() => getAssessmentHistory(assessmentId), [assessmentId]) ?? [];

  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayKey());

  if (!assessment) return null;

  const handleAdd = async () => {
    const numeric = Number(value);
    if (!value.trim() || Number.isNaN(numeric)) return;
    await addAssessmentEntry({ assessmentId, date, value: numeric });
    setValue('');
  };

  const handleDeleteAssessment = async () => {
    await deleteAssessment(assessmentId);
    onBack();
  };

  const chartData = history.map((h) => ({ date: h.date, value: h.value }));

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="self-start text-sm text-sky-300">
        ← Assessments
      </button>

      <div>
        <h1 className="text-2xl font-semibold">{assessment.name}</h1>
        <p className="text-sm text-slate-400">
          {assessment.unit} · {assessment.direction === 'higher-is-better' ? 'higher is better' : 'lower is better'}
        </p>
      </div>

      <Card>
        <TrendChart data={chartData} unit={assessment.unit} />
      </Card>

      <Card>
        <p className="mb-2 text-sm font-medium text-slate-400">Add entry</p>
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl bg-slate-800 px-3 py-2.5 text-slate-100"
          />
          <input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={assessment.unit}
            className="w-24 rounded-xl bg-slate-800 px-3 py-2.5 text-slate-100 placeholder:text-slate-500"
          />
          <Button onClick={handleAdd} disabled={!value.trim()} className="flex-1">
            Add
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-medium text-slate-400">History</h2>
        <div className="flex flex-col gap-2">
          {[...history].reverse().map((entry) => (
            <Card key={entry.id} className="flex items-center justify-between py-2.5">
              <span className="text-slate-300">{formatDisplayDate(entry.date)}</span>
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-100">
                  {entry.value} {assessment.unit}
                </span>
                <button
                  onClick={() => deleteAssessmentEntry(entry.id!)}
                  aria-label="Delete entry"
                  className="text-slate-500 active:text-red-400"
                >
                  ✕
                </button>
              </div>
            </Card>
          ))}
          {history.length === 0 && <p className="text-sm text-slate-500">No entries yet.</p>}
        </div>
      </div>

      <Button variant="danger" onClick={handleDeleteAssessment}>
        Delete assessment
      </Button>
    </div>
  );
}
