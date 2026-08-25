import { db } from './schema';
import type {
  Assessment,
  AssessmentEntry,
  Exercise,
  PlanDayStatus,
  PlanStatus,
  WeeklyPlan,
  WorkoutLog,
  WorkoutTemplate,
} from './schema';
import { currentWeekKeys } from '../lib/date';

// ---------- Exercises ----------

export function listExercises(): Promise<Exercise[]> {
  return db.exercises.orderBy('name').toArray();
}

export async function addExercise(name: string, defaultUnit: Exercise['defaultUnit'] = 'lbs') {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Exercise name is required');
  return db.exercises.add({ name: trimmed, defaultUnit });
}

export async function renameExercise(id: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Exercise name is required');
  return db.exercises.update(id, { name: trimmed });
}

export function deleteExercise(id: number) {
  return db.exercises.delete(id);
}

// ---------- Workout templates ----------

export function listTemplates(): Promise<WorkoutTemplate[]> {
  return db.workoutTemplates.orderBy('name').toArray();
}

export function getTemplate(id: number): Promise<WorkoutTemplate | undefined> {
  return db.workoutTemplates.get(id);
}

export function saveTemplate(template: WorkoutTemplate) {
  if (template.id == null) {
    const { id: _id, ...rest } = template;
    void _id;
    return db.workoutTemplates.add(rest);
  }
  return db.workoutTemplates.put(template);
}

export function deleteTemplate(id: number) {
  return db.workoutTemplates.delete(id);
}

// ---------- Weekly plan ----------

/** Always returns exactly 7 entries (index = dayOfWeek), synthesizing rest days that have no row yet. */
export async function getWeeklyPlan(): Promise<WeeklyPlan[]> {
  const rows = await db.weeklyPlans.toArray();
  const byDay = new Map(rows.map((r) => [r.dayOfWeek, r]));
  return Array.from({ length: 7 }, (_, dayOfWeek) => byDay.get(dayOfWeek) ?? { dayOfWeek, templateId: null });
}

export async function setPlanForDay(dayOfWeek: number, templateId: number | null) {
  const existing = await db.weeklyPlans.where('dayOfWeek').equals(dayOfWeek).first();
  if (existing?.id != null) {
    await db.weeklyPlans.update(existing.id, { templateId });
  } else {
    await db.weeklyPlans.add({ dayOfWeek, templateId });
  }
}

// ---------- Plan status (per-date done/skipped) ----------

export function getStatusForDate(date: string): Promise<PlanStatus | undefined> {
  return db.planStatus.where('date').equals(date).first();
}

export async function getStatusesForWeek(weekKeys: string[] = currentWeekKeys()): Promise<Map<string, PlanStatus>> {
  const rows = await db.planStatus.where('date').anyOf(weekKeys).toArray();
  return new Map(rows.map((r) => [r.date, r]));
}

export async function setStatusForDate(date: string, status: PlanDayStatus, workoutLogId?: number) {
  const existing = await db.planStatus.where('date').equals(date).first();
  if (existing?.id != null) {
    await db.planStatus.update(existing.id, { status, workoutLogId });
  } else {
    await db.planStatus.add({ date, status, workoutLogId });
  }
}

// ---------- Workout logs ----------

function withExerciseIds(log: WorkoutLog): WorkoutLog {
  return { ...log, exerciseIds: [...new Set(log.entries.map((e) => e.exerciseId))] };
}

export async function saveWorkoutLog(log: WorkoutLog): Promise<number> {
  const withIds = withExerciseIds(log);
  if (withIds.id == null) {
    const { id: _id, ...rest } = withIds;
    void _id;
    return db.workoutLogs.add(rest) as Promise<number>;
  }
  const id = withIds.id;
  await db.workoutLogs.put(withIds);
  return id;
}

export function deleteWorkoutLog(id: number) {
  return db.workoutLogs.delete(id);
}

export function getWorkoutLog(id: number): Promise<WorkoutLog | undefined> {
  return db.workoutLogs.get(id);
}

export function getLogForDate(date: string): Promise<WorkoutLog | undefined> {
  return db.workoutLogs.where('date').equals(date).first();
}

export function getRecentLogs(limit = 10): Promise<WorkoutLog[]> {
  return db.workoutLogs.orderBy('date').reverse().limit(limit).toArray();
}

export function listAllLogs(): Promise<WorkoutLog[]> {
  return db.workoutLogs.orderBy('date').reverse().toArray();
}

export interface ExerciseHistoryPoint {
  date: string;
  logId: number;
  bestWeight?: number;
  totalReps: number;
}

/** One point per workout log that touched this exercise, sorted oldest -> newest. */
export async function getExerciseHistory(exerciseId: number): Promise<ExerciseHistoryPoint[]> {
  const logs = await db.workoutLogs.where('exerciseIds').equals(exerciseId).sortBy('date');
  return logs.map((log) => {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId);
    const sets = entry?.sets ?? [];
    const weights = sets.map((s) => s.weight).filter((w): w is number => w != null);
    const totalReps = sets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
    return {
      date: log.date,
      logId: log.id!,
      bestWeight: weights.length ? Math.max(...weights) : undefined,
      totalReps,
    };
  });
}

// ---------- Assessments ----------

export function listAssessments(): Promise<Assessment[]> {
  return db.assessments.orderBy('name').toArray();
}

export async function addAssessment(assessment: Omit<Assessment, 'id'>) {
  return db.assessments.add(assessment);
}

export function deleteAssessment(id: number) {
  return db.transaction('rw', db.assessments, db.assessmentEntries, async () => {
    await db.assessmentEntries.where('assessmentId').equals(id).delete();
    await db.assessments.delete(id);
  });
}

export function getAssessmentHistory(assessmentId: number): Promise<AssessmentEntry[]> {
  return db.assessmentEntries.where('assessmentId').equals(assessmentId).sortBy('date');
}

export async function getLatestAssessmentEntry(assessmentId: number): Promise<AssessmentEntry | undefined> {
  const history = await getAssessmentHistory(assessmentId);
  return history.at(-1);
}

export function addAssessmentEntry(entry: Omit<AssessmentEntry, 'id'>) {
  return db.assessmentEntries.add(entry);
}

export function deleteAssessmentEntry(id: number) {
  return db.assessmentEntries.delete(id);
}
