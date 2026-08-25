import Dexie, { type EntityTable } from 'dexie';

export type WeightUnit = 'lbs' | 'kg';

export interface Exercise {
  id?: number;
  name: string;
  defaultUnit: WeightUnit;
}

export interface TemplateExercise {
  exerciseId: number;
  targetSets?: number;
}

export interface WorkoutTemplate {
  id?: number;
  name: string;
  exercises: TemplateExercise[];
}

/** dayOfWeek: 0 = Sunday .. 6 = Saturday. templateId null means a planned rest day. */
export interface WeeklyPlan {
  id?: number;
  dayOfWeek: number;
  templateId: number | null;
}

export type PlanDayStatus = 'done' | 'skipped';

/** Per-calendar-date completion outcome, distinct from the recurring WeeklyPlan assignment. */
export interface PlanStatus {
  id?: number;
  date: string; // YYYY-MM-DD
  status: PlanDayStatus;
  workoutLogId?: number;
}

export interface SetEntry {
  reps?: number;
  weight?: number;
  notes?: string;
}

export interface WorkoutLogEntry {
  exerciseId: number;
  sets: SetEntry[];
}

export interface WorkoutLog {
  id?: number;
  date: string; // YYYY-MM-DD
  templateId?: number;
  notes?: string;
  entries: WorkoutLogEntry[];
  /** Derived from entries[].exerciseId, kept in sync on write, indexed for exercise-history queries. */
  exerciseIds: number[];
}

export type AssessmentDirection = 'higher-is-better' | 'lower-is-better';

export interface Assessment {
  id?: number;
  name: string;
  unit: string;
  direction: AssessmentDirection;
}

export interface AssessmentEntry {
  id?: number;
  assessmentId: number;
  date: string; // YYYY-MM-DD
  value: number;
  notes?: string;
}

class WorkoutTrackerDB extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>;
  workoutTemplates!: EntityTable<WorkoutTemplate, 'id'>;
  weeklyPlans!: EntityTable<WeeklyPlan, 'id'>;
  planStatus!: EntityTable<PlanStatus, 'id'>;
  workoutLogs!: EntityTable<WorkoutLog, 'id'>;
  assessments!: EntityTable<Assessment, 'id'>;
  assessmentEntries!: EntityTable<AssessmentEntry, 'id'>;

  constructor() {
    super('WorkoutTrackerDB');
    this.version(1).stores({
      exercises: '++id, &name',
      workoutTemplates: '++id, name',
      weeklyPlans: '++id, &dayOfWeek',
      planStatus: '++id, &date',
      workoutLogs: '++id, date, *exerciseIds',
      assessments: '++id, &name',
      assessmentEntries: '++id, assessmentId, [assessmentId+date]',
    });
  }
}

export const db = new WorkoutTrackerDB();

export const ALL_TABLE_NAMES = [
  'exercises',
  'workoutTemplates',
  'weeklyPlans',
  'planStatus',
  'workoutLogs',
  'assessments',
  'assessmentEntries',
] as const;
