import type { ExerciseId } from '@/domain/types';

/**
 * Why an exercise is in more than one program.
 *
 * The overlap itself is derived from the stage tables by `sharedExercises` — this
 * is the half that can't be: an exercise sits in two programs because it earns
 * its place in both, and the reason lives in someone's head unless it's written
 * down. The plan screen shows these next to the names so a familiar exercise
 * reads as deliberate rather than as filler.
 *
 * Deliberately short, and deliberately not on the exercise itself: an exercise
 * has no program of its own (`src/domain/exercises.ts`), so program talk doesn't
 * belong in the library. A test pins this table against what the tables actually
 * share, in both directions — a new overlap with no reason written for it fails,
 * and so does a reason for an overlap that has since been designed out.
 */
export const SHARED_EXERCISE_NOTES: Partial<Record<ExerciseId, string>> = {
  'cat-cow': 'The warm-up that shows you where neutral is, which every program needs before it asks for anything.',
  'posture-reset':
    'Ribs stacked over the pelvis is what makes a lift land and what keeps pressure off the midline — the setup for pelvic floor work and for core work both.',
  'child-pose-wide':
    'The one position where the belly has room and the floor can lengthen, so all three programs use it to undo what they just did.',
  'rest-and-breathe':
    'Lying still belongs to no program. It closes a session in all three, and in the first two weeks after birth it is the whole session.',
  'birth-breathing':
    'Pelvic floor trains it as the fullest release there is; deep stretch trains it as the breath for labor. The same skill, approached from both ends.',
  'deep-squat-support':
    'A supported squat is the pelvic floor at its longest and a position worth being comfortable in during labor — both programs at once.',
  'gentle-walk':
    'Both programs ask for walking by name in the same postpartum weeks, and a walk is a walk.',
};
