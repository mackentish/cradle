import { setNow } from '@/lib/clock';
import { exercises, findExercise, getExercise } from '@/domain/exercises';
import {
  isProgramId,
  isStageId,
  PROGRAM_IDS,
  programs,
  programsById,
  programTitle,
  stageById,
  stageFor,
  stages,
  stagesForProgram,
} from '@/domain/program';
import { buildSegments, sessionForDay, sessionSeconds } from '@/domain/session';
import type { ExerciseId, ProgramId } from '@/domain/types';

/**
 * `ExerciseId` and `Step.exerciseId` make the program's step data compile-time
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
      // Core
      'quadruped-core-breath',
      'standing-march',
      'wall-plank',
      'side-plank-knees',
      'dead-bug-heel-tap',
      'side-lying-leg-lift',
      'anti-rotation-reach',
      'tall-kneel-hold',
      // Birth prep / recovery stretches
      'butterfly-stretch',
      'pelvic-circles-ball',
      'supported-lunge-stretch',
      'chest-opener-doorway',
      'neck-shoulder-release',
      'standing-hamstring-support',
      'birth-ball-lean',
    ];

    const byName = (a: string, b: string) => a.localeCompare(b);
    expect(Object.keys(exercises).sort(byName)).toEqual([...ids].sort(byName));
    for (const id of ids) expect(getExercise(id).id).toBe(id);
  });

  it('reports nothing for an id that came from outside the type system', () => {
    // The exercise route takes its id straight from the URL.
    expect(findExercise('not-an-exercise')).toBeUndefined();
    expect(findExercise('toString')).toBeUndefined();
    expect(findExercise('diaphragmatic-breath')?.name).toBe('Diaphragmatic Breathing');
  });

  it('carries a caution on everything that can be contraindicated', () => {
    // Core work can cone and stretching can overshoot end range, so these two
    // kinds should never ship a bare exercise with no caveat attached.
    for (const exercise of Object.values(exercises)) {
      if (exercise.kind !== 'core' && exercise.kind !== 'stretch') continue;
      if (exercise.id === 'quadruped-core-breath') continue; // breath-led, no load
      if (exercise.id === 'standing-march') continue; // bodyweight, upright
      if (exercise.id === 'neck-shoulder-release') continue; // gentle by construction
      expect(exercise.caution).toBeTruthy();
    }
  });
});

describe('the program registry', () => {
  it('has one entry per id, in a stable display order', () => {
    expect(programs).toHaveLength(PROGRAM_IDS.length);
    expect(programs.map((p) => p.id)).toEqual(PROGRAM_IDS);
    for (const id of PROGRAM_IDS) expect(programsById[id].id).toBe(id);
  });

  it('rejects a program id that came from outside the type system', () => {
    // Both /session/[program] and /reminders/[program] take theirs from the URL.
    expect(isProgramId('core')).toBe(true);
    expect(isProgramId('not-a-program')).toBe(false);
    expect(isProgramId('toString')).toBe(false);
    expect(isProgramId(undefined)).toBe(false);
  });

  it('keeps the seven stage ids shared across all three programs', () => {
    // This is what lets a log written before there were three programs still
    // pass `toLogs` — its `stageId` is one every program still recognizes.
    const perProgram = PROGRAM_IDS.map((id) =>
      programsById[id].stages.map((stage) => stage.id).sort((a, b) => a.localeCompare(b))
    );
    for (const ids of perProgram) expect(ids).toEqual(perProgram[0]);
    expect(isStageId('build')).toBe(true);
    expect(isStageId('core-build')).toBe(false);
  });

  it('agrees on week boundaries across programs, so one banner speaks for all', () => {
    for (const stageId of programsById['pelvic-floor'].stages.map((s) => s.id)) {
      const reference = stageById('pelvic-floor', stageId);
      for (const id of PROGRAM_IDS) {
        const stage = stageById(id, stageId);
        expect(stage?.startWeek).toBe(reference?.startWeek);
        expect(stage?.endWeek).toBe(reference?.endWeek);
        expect(stage?.range).toBe(reference?.range);
        expect(stage?.phase).toBe(reference?.phase);
      }
    }
  });

  it('tags every stage with the program that owns it', () => {
    for (const id of PROGRAM_IDS) {
      for (const stage of programsById[id].stages) expect(stage.programId).toBe(id);
    }
  });

  it('retitles birth prep postpartum, and leaves the others alone', () => {
    expect(programTitle(programsById['birth-prep'], 'pregnancy')).toBe('Birth prep');
    expect(programTitle(programsById['birth-prep'], 'postpartum')).toBe('Recovery stretches');
    expect(programTitle(programsById.core, 'postpartum')).toBe('Core');
    expect(programTitle(programsById['pelvic-floor'], 'postpartum')).toBe('Pelvic floor');
  });

  it('covers both phases for every program, with stages that carry sessions', () => {
    for (const id of PROGRAM_IDS) {
      expect(stagesForProgram(id, 'pregnancy').length).toBeGreaterThan(0);
      expect(stagesForProgram(id, 'postpartum').length).toBeGreaterThan(0);
    }
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

  it('gives every session a globally unique id', () => {
    // `SessionLog.sessionId` is a free string, so two programs sharing one would
    // make a logged session ambiguous after the fact.
    const ids = stages.flatMap((stage) => stage.sessions.map((session) => session.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  /**
   * Two programs at the same stage sit side by side on Today, so a shared session
   * title would read as a duplicate card. Scoped per stage rather than globally,
   * because pelvic floor reuses "Strength" across two phases that never overlap.
   */
  it('gives every session in a stage band a distinguishable title', () => {
    for (const stageId of programsById['pelvic-floor'].stages.map((s) => s.id)) {
      const titles = PROGRAM_IDS.flatMap(
        (id) => stageById(id, stageId)?.sessions.map((session) => session.title) ?? []
      );
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it('clamps a week outside every stage range, per program', () => {
    for (const id of PROGRAM_IDS) {
      // A due date more than 40 weeks out lands before the first stage.
      expect(stageFor(id, 'pregnancy', 0).id).toBe('foundation');
      expect(stageFor(id, 'pregnancy', 20).id).toBe('build');
      // Past the last stage's open-ended range.
      expect(stageFor(id, 'pregnancy', 99).id).toBe('prepare');
      expect(stageFor(id, 'postpartum', 500).id).toBe('rebuild');
    }
  });
});

describe('the daily session rotation', () => {
  afterEach(() => setNow(null));

  it('gives the three programs different sessions on the same day', () => {
    // Without a per-program offset, equal variant counts rotate in lockstep and
    // she gets variant A of all three, then variant B of all three, forever.
    setNow(new Date('2026-06-15T09:30:00Z'));

    const picked = PROGRAM_IDS.map((id: ProgramId) => {
      const stage = stageFor(id, 'pregnancy', 20);
      return { id, letter: sessionForDay(stage).id.slice(-1), count: stage.sessions.length };
    });

    // All three have three variants at week 20, so nothing forces them apart.
    for (const entry of picked) expect(entry.count).toBe(3);
    expect(new Set(picked.map((p) => p.letter)).size).toBe(3);
  });

  it('is stable for a day and differs the next', () => {
    const stage = stageFor('core', 'pregnancy', 20);

    setNow(new Date('2026-06-15T09:30:00Z'));
    const morning = sessionForDay(stage).id;
    setNow(new Date('2026-06-15T21:45:00Z'));
    expect(sessionForDay(stage).id).toBe(morning);

    setNow(new Date('2026-06-16T09:30:00Z'));
    expect(sessionForDay(stage).id).not.toBe(morning);
  });
});
