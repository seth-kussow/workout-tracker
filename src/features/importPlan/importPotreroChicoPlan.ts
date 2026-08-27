import { POTRERO_CHICO_PLAN } from '../../data/potreroChicoPlan';
import type { TemplateExercise } from '../../db/schema';
import { addExercise, getExerciseByName, getTemplateByName, saveTemplate } from '../../db/queries';

export interface ImportPlanResult {
  templatesImported: number;
  exercisesCreated: number;
}

async function resolveExerciseId(name: string, createdCounter: { count: number }): Promise<number> {
  const existing = await getExerciseByName(name);
  if (existing?.id != null) return existing.id;
  const id = await addExercise(name);
  createdCounter.count += 1;
  return id as number;
}

/** Upserts by name so re-running after editing the data file updates existing templates rather than duplicating them. */
export async function importPotreroChicoPlan(): Promise<ImportPlanResult> {
  const createdCounter = { count: 0 };
  const exerciseIdByName = new Map<string, number>();

  for (const template of POTRERO_CHICO_PLAN) {
    for (const ex of template.exercises) {
      if (!exerciseIdByName.has(ex.exerciseName)) {
        const id = await resolveExerciseId(ex.exerciseName, createdCounter);
        exerciseIdByName.set(ex.exerciseName, id);
      }
    }
  }

  for (const template of POTRERO_CHICO_PLAN) {
    const exercises: TemplateExercise[] = template.exercises.map((ex) => ({
      exerciseId: exerciseIdByName.get(ex.exerciseName)!,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      prescription: ex.prescription,
    }));

    const existing = await getTemplateByName(template.name);
    await saveTemplate({ id: existing?.id, name: template.name, exercises });
  }

  return { templatesImported: POTRERO_CHICO_PLAN.length, exercisesCreated: createdCounter.count };
}
