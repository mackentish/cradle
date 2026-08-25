import { exercises, findExercise, getExercise } from '@/domain/exercises';
import { stages, stagesForPhase } from '@/domain/program';
import { buildSegments, sessionSeconds } from '@/domain/session';
import type { ExerciseId } from '@/domain/types';

/**
 * `ExerciseId` and `Step.exerciseId` make the programme's step data compile-time
 * checked, but the union is written by hand: TypeScript catches a step naming an
 * id that isn't in the union, and this catches a union member with no exercise
 * behind it. Together they close the loop.
 */
describe('the exercise library', () => {
  it('defines every id in the union, and no extras', () => {
    const ids: ExerciseId[] = [
      'diaphragmatic-breath',
      'find-your-floor',
      'connection-breath',
      'short-hold',
      'long-hold',
      'elevator',
      'quick-flicks',
      'the-knack',
      'full-release',
      'perineal-bulge',
      'birth-breathing',
      'happy-baby-supported',
      'child-pose-wide',
      'deep-squat-support',
      'bridge',
      'side-lying-clam',
      'bird-dog',
      'heel-slide',
      'sit-to-stand',
      'wall-sit-lift',
      'cat-cow',
      'pelvic-tilt',
      'hip-flexor-kneel',
      'figure-four',
      'posture-reset',
      'gentle-walk',
      'rest-and-breathe',
    ];

    expect(Object.keys(exercises).sort()).toEqual([...ids].sort());
    for (const id of ids) expect(getExercise(id).id).toBe(id);
  });

  it('reports nothing for an id that came from outside the type system', () => {
    // The exercise route takes its id straight from the URL.
    expect(findExercise('not-an-exercise')).toBeUndefined();
    expect(findExercise('toString')).toBeUndefined();
    expect(findExercise('diaphragmatic-breath')?.name).toBe('Diaphragmatic Breathing');
  });
});

describe('the programme', () => {
  it('covers both phases with stages that carry sessions', () => {
    expect(stagesForPhase('pregnancy').length).toBeGreaterThan(0);
    expect(stagesForPhase('postpartum').length).toBeGreaterThan(0);
    for (const stage of stages) {
      expect(stage.sessions.length).toBeGreaterThan(0);
      for (const session of stage.sessions) {
        expect(session.steps.length).toBeGreaterThan(0);
      }
    }
  });

  it('builds real timed work out of every step of every session', () => {
    for (const stage of stages) {
      for (const session of stage.sessions) {
        for (const step of session.steps) {
          // Throws on an unknown id, and returns nothing for a step of no length.
          expect(buildSegments(step).length).toBeGreaterThan(0);
        }
        expect(sessionSeconds(session)).toBeGreaterThan(0);
      }
    }
  });
});
