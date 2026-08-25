import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { getLatestAssessmentEntry, listAssessments } from '../../db/queries';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { NewAssessmentModal } from './NewAssessmentModal';
import { AssessmentDetail } from './AssessmentDetail';

export function AssessmentsScreen() {
  const assessments = useLiveQuery(() => listAssessments(), []) ?? [];
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (selectedId != null) {
    return <AssessmentDetail assessmentId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assessments</h1>
        <Button variant="ghost" onClick={() => setCreating(true)}>
          + New
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {assessments.map((a) => (
          <button key={a.id} onClick={() => setSelectedId(a.id!)} className="text-left">
            <AssessmentRow assessmentId={a.id!} name={a.name} unit={a.unit} />
          </button>
        ))}
        {assessments.length === 0 && (
          <p className="text-sm text-slate-500">
            Track anything measurable over time — max push-ups, plank hold, bodyweight, a mile time.
          </p>
        )}
      </div>

      <NewAssessmentModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}

function AssessmentRow({ assessmentId, name, unit }: { assessmentId: number; name: string; unit: string }) {
  const latest = useLiveQuery(() => getLatestAssessmentEntry(assessmentId), [assessmentId]);

  return (
    <Card className="flex items-center justify-between py-3">
      <span className="text-slate-100">{name}</span>
      <span className="text-sm text-slate-400">{latest ? `${latest.value} ${unit}` : 'No entries'}</span>
    </Card>
  );
}
