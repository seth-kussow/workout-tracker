import { useState } from 'react';
import type { AssessmentDirection } from '../../db/schema';
import { addAssessment } from '../../db/queries';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

interface NewAssessmentModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewAssessmentModal({ open, onClose }: NewAssessmentModalProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [direction, setDirection] = useState<AssessmentDirection>('higher-is-better');

  const reset = () => {
    setName('');
    setUnit('');
    setDirection('higher-is-better');
  };

  const handleSave = async () => {
    if (!name.trim() || !unit.trim()) return;
    await addAssessment({ name: name.trim(), unit: unit.trim(), direction });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New assessment">
      <div className="flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Max Push-ups)"
          className="rounded-xl bg-slate-800 px-3 py-3 text-base text-slate-100 placeholder:text-slate-500"
        />
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unit (e.g. reps, seconds, minutes)"
          className="rounded-xl bg-slate-800 px-3 py-3 text-base text-slate-100 placeholder:text-slate-500"
        />
        <div className="flex gap-2">
          <Button
            variant={direction === 'higher-is-better' ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => setDirection('higher-is-better')}
          >
            Higher is better
          </Button>
          <Button
            variant={direction === 'lower-is-better' ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => setDirection('lower-is-better')}
          >
            Lower is better
          </Button>
        </div>
        <Button onClick={handleSave} disabled={!name.trim() || !unit.trim()}>
          Save
        </Button>
      </div>
    </Modal>
  );
}
