/**
 * Hand-transcribed from el_potrero_chico_climbing_plan.xlsx (Weekly Template / Sessions sheets).
 * The source has no day-of-week schedule, just selectable session types — some of which
 * prescribe different exercises depending on which block (week range) of the 18-week plan
 * you're in. Each block variant becomes its own template here; the day-by-day assignment
 * is left to the Plan screen, same as any other template.
 */

export interface PlanExerciseDef {
  exerciseName: string;
  targetSets?: number;
  targetReps?: number;
  /** Grade/rest/coaching detail from the source that doesn't fit a plain number. */
  prescription?: string;
}

export interface PlanTemplateDef {
  name: string;
  exercises: PlanExerciseDef[];
}

const WARM_UP_POWER_ENDURANCE: PlanExerciseDef = {
  exerciseName: 'Warm-up',
  targetSets: 1,
  prescription: '1-2 easy routes or boulders\nEasy · Rest: As needed\nPrepare for sustained efforts',
};

const WARM_UP_PERFORMANCE: PlanExerciseDef = {
  exerciseName: 'Warm-up',
  targetSets: 1,
  prescription: 'Easy to moderate routes/boulders\nProgressive · Rest: As needed\nArrive at project fresh, not fatigued',
};

export const POTRERO_CHICO_PLAN: PlanTemplateDef[] = [
  {
    name: 'Hard Climbing',
    exercises: [
      {
        exerciseName: 'Warm-up climbing',
        targetSets: 1,
        prescription: 'Progressive warm-up\nEasy to moderate · Rest: As needed\nInclude easy boulders and/or routes before hard work',
      },
      {
        exerciseName: 'Limit bouldering',
        targetSets: 4,
        prescription: '1 hard problem or hard move set each\n~V6-V8 effort · Rest: Long, near-full recovery\nHigh quality; stop if power drops substantially',
      },
      {
        exerciseName: 'Hard sport route / crux work',
        targetSets: 1,
        prescription: '1-2 routes or focused sections\n5.12a-c or hard crux sections · Rest: Full recovery\nUse as sport-specific strength transfer; not a volume session',
      },
    ],
  },
  {
    name: 'Aerobic Endurance',
    exercises: [
      {
        exerciseName: 'Warm-up route',
        targetSets: 1,
        prescription: '1 route\n5.9-5.10 · Rest: Brief\nProgress gradually',
      },
      {
        exerciseName: 'Moderate route volume',
        targetSets: 4,
        prescription: '1 route each\nMostly 5.10+/5.11- · Rest: Minimal downtime\nContinuous movement and efficiency are priorities',
      },
      {
        exerciseName: 'Optional extra moderate route',
        targetSets: 0,
        prescription: 'Weeks 11-15+ only\n1 route each\n5.10+/5.11 · Rest: Short\nAdd only if recovery is good',
      },
    ],
  },
  {
    name: 'Power Endurance (Wk 1-5)',
    exercises: [
      WARM_UP_POWER_ENDURANCE,
      {
        exerciseName: '4x4 bouldering',
        targetSets: 3,
        prescription: '4 boulders per round\n~V3-V4 · Rest: 4-6 min between rounds\nShort transitions between problems; near-high pump without failure',
      },
    ],
  },
  {
    name: 'Power Endurance (Wk 6-10)',
    exercises: [
      WARM_UP_POWER_ENDURANCE,
      {
        exerciseName: 'Route doubles',
        targetSets: 3,
        prescription: '2 routes back-to-back\n~5.11 · Rest: 3-5 min between sets\nLower/transition quickly; treat as one sustained effort',
      },
    ],
  },
  {
    name: 'Power Endurance (Wk 11-15)',
    exercises: [
      WARM_UP_POWER_ENDURANCE,
      {
        exerciseName: 'Linked route terrain',
        targetSets: 3,
        prescription: '2 linked sections or routes\n~5.11 to 5.12a · Rest: 3-5 min between sets\nBias toward route-specific sustained difficulty',
      },
    ],
  },
  {
    name: 'Performance / Redpoint (Wk 1-5)',
    exercises: [
      WARM_UP_PERFORMANCE,
      {
        exerciseName: '12a project / hard route',
        targetSets: 2,
        prescription: '2-4 attempts\n~5.12a · Rest: 15-25 min between serious burns\nLearn beta and pacing',
      },
    ],
  },
  {
    name: 'Performance / Redpoint (Wk 6-10)',
    exercises: [
      WARM_UP_PERFORMANCE,
      {
        exerciseName: '12a-b project',
        targetSets: 2,
        prescription: '2-4 attempts\n~5.12a-b · Rest: 15-25 min\nAim for increasing links and fewer rests',
      },
    ],
  },
  {
    name: 'Performance / Redpoint (Wk 11-15)',
    exercises: [
      WARM_UP_PERFORMANCE,
      {
        exerciseName: '12b-c project',
        targetSets: 2,
        prescription: '2-4 attempts\n~5.12b-c · Rest: 15-25 min\nPrioritize redpoint execution and rest positions',
      },
    ],
  },
  {
    name: 'Performance / Redpoint (Wk 16-17)',
    exercises: [
      WARM_UP_PERFORMANCE,
      {
        exerciseName: '12b-c project',
        targetSets: 2,
        prescription: '2-3 quality attempts\n~5.12b-c · Rest: 15-25 min\nHigh intensity, lower total volume',
      },
    ],
  },
  {
    name: 'Main Calisthenics (L-sit + HSPU)',
    exercises: [
      {
        exerciseName: 'Pike push-up',
        targetSets: 4,
        targetReps: 3,
        prescription: 'Leave 1-2 reps in reserve · Rest: 2-3 min\nClean form; stop short of failure',
      },
      {
        exerciseName: 'Elevated pike push-up progression',
        targetSets: 3,
        targetReps: 3,
        prescription: 'Leave 1-2 reps in reserve · Rest: 2-3 min\nChoose a progression that is challenging but controlled',
      },
      {
        exerciseName: 'Tuck L-sit progression',
        targetSets: 4,
        prescription: '10-20 sec holds\nTechnical quality · Rest: 60-90 sec\nAccumulate clean hold time',
      },
      {
        exerciseName: 'Seated compression lifts',
        targetSets: 3,
        targetReps: 8,
        prescription: 'Controlled · Rest: 60-90 sec\nPrioritize active compression',
      },
      {
        exerciseName: 'Handstand practice',
        targetSets: 1,
        prescription: 'Optional\n5-10 min total\nSkill practice · Rest: As needed\nKeep low fatigue',
      },
    ],
  },
  {
    name: 'Light Calisthenics / Skill',
    exercises: [
      {
        exerciseName: 'Handstand practice',
        targetSets: 1,
        prescription: '5-10 min total\nSkill practice · Rest: As needed\nFrequent low-fatigue attempts',
      },
      {
        exerciseName: 'Pike push-up',
        targetSets: 3,
        targetReps: 3,
        prescription: 'Leave 2 reps in reserve · Rest: 2 min\nLighter than main session',
      },
      {
        exerciseName: 'Tuck L-sit progression',
        targetSets: 3,
        prescription: '10-20 sec holds\nTechnical quality · Rest: 60-90 sec\nStop before form deteriorates',
      },
      {
        exerciseName: 'Hollow body',
        targetSets: 3,
        prescription: '20-30 sec\nControlled · Rest: 60-90 sec\nCore support',
      },
    ],
  },
];
