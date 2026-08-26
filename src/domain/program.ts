import type { Phase, Stage, StageId } from './types';

/**
 * The progressive program. Volume and intent shift as pregnancy goes on:
 * awareness first, real strength through the second trimester, then a deliberate
 * hand-off from squeezing to releasing as birth approaches. Postpartum starts
 * from rest and rebuilds.
 *
 * Every stage carries two or three session variants; the app rotates them by
 * calendar day so sessions vary without any server involved.
 */
export const stages: Stage[] = [
  {
    id: 'foundation',
    colorKey: 'foundation',
    phase: 'pregnancy',
    title: 'Foundation',
    range: 'Weeks 1–13',
    focus:
      'The first trimester is about finding these muscles and learning to move them with your breath. Volume stays low on purpose — nausea and exhaustion are real, and a few good minutes beats a long session you dread.',
    emphasis: [
      'Learn where your pelvic floor is',
      'Pair the lift with your exhale',
      'Short sessions, full recovery between reps',
    ],
    startWeek: 1,
    endWeek: 13,
    sessions: [
      {
        id: 'foundation-a',
        title: 'Finding the Floor',
        steps: [
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 60 },
          {
            type: 'reps',
            exerciseId: 'find-your-floor',
            reps: 5,
            liftSec: 2,
            holdSec: 3,
            releaseSec: 3,
            restSec: 6,
            note: 'Slow and curious. Finding it counts as doing it.',
          },
          { type: 'hold', exerciseId: 'connection-breath', durationSec: 60 },
          { type: 'hold', exerciseId: 'pelvic-tilt', durationSec: 45 },
        ],
      },
      {
        id: 'foundation-b',
        title: 'First Lifts',
        steps: [
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'short-hold',
            reps: 8,
            liftSec: 1,
            holdSec: 3,
            releaseSec: 3,
            restSec: 6,
          },
          {
            type: 'reps',
            exerciseId: 'quick-flicks',
            reps: 8,
            liftSec: 1,
            holdSec: 1,
            releaseSec: 1,
            restSec: 3,
          },
          { type: 'hold', exerciseId: 'full-release', durationSec: 45 },
        ],
      },
    ],
  },
  {
    id: 'build',
    colorKey: 'build',
    phase: 'pregnancy',
    title: 'Build',
    range: 'Weeks 14–27',
    focus:
      'You probably feel more human again, and this is the best window for real strength work. Holds get longer, and the pelvic floor starts working with the hips and deep core the way it does in daily life.',
    emphasis: [
      'Longer holds, more reps',
      'Connect the floor to hips and core',
      'Side-lying replaces flat-on-your-back from about 20 weeks',
    ],
    startWeek: 14,
    endWeek: 27,
    sessions: [
      {
        id: 'build-a',
        title: 'Strength',
        steps: [
          { type: 'hold', exerciseId: 'connection-breath', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'long-hold',
            reps: 8,
            liftSec: 2,
            holdSec: 6,
            releaseSec: 3,
            restSec: 8,
          },
          {
            type: 'reps',
            exerciseId: 'quick-flicks',
            reps: 10,
            liftSec: 1,
            holdSec: 1,
            releaseSec: 1,
            restSec: 3,
          },
          {
            type: 'reps',
            exerciseId: 'side-lying-clam',
            reps: 10,
            liftSec: 1,
            holdSec: 2,
            releaseSec: 2,
            restSec: 3,
            note: 'Ten each side. Pillow under the bump.',
          },
          { type: 'hold', exerciseId: 'full-release', durationSec: 45 },
        ],
      },
      {
        id: 'build-b',
        title: 'Whole Core',
        steps: [
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'elevator',
            reps: 5,
            liftSec: 4,
            holdSec: 3,
            releaseSec: 4,
            restSec: 8,
          },
          {
            type: 'reps',
            exerciseId: 'bridge',
            reps: 8,
            liftSec: 2,
            holdSec: 2,
            releaseSec: 3,
            restSec: 5,
            note: 'Prop your head and shoulders up on pillows.',
          },
          {
            type: 'reps',
            exerciseId: 'bird-dog',
            reps: 8,
            liftSec: 2,
            holdSec: 3,
            releaseSec: 2,
            restSec: 4,
            note: 'Alternate sides each rep.',
          },
          { type: 'hold', exerciseId: 'child-pose-wide', durationSec: 60 },
        ],
      },
      {
        id: 'build-c',
        title: 'Everyday Strength',
        steps: [
          { type: 'hold', exerciseId: 'posture-reset', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'sit-to-stand',
            reps: 8,
            liftSec: 2,
            holdSec: 2,
            releaseSec: 2,
            restSec: 5,
          },
          {
            type: 'reps',
            exerciseId: 'the-knack',
            reps: 6,
            liftSec: 1,
            holdSec: 2,
            releaseSec: 2,
            restSec: 6,
          },
          {
            type: 'reps',
            exerciseId: 'wall-sit-lift',
            reps: 4,
            liftSec: 2,
            holdSec: 8,
            releaseSec: 3,
            restSec: 10,
          },
          { type: 'hold', exerciseId: 'figure-four', durationSec: 60 },
        ],
      },
    ],
  },
  {
    id: 'sustain',
    colorKey: 'sustain',
    phase: 'pregnancy',
    title: 'Sustain',
    range: 'Weeks 28–34',
    focus:
      'The bump is doing real work now. We hold onto the strength you built rather than chasing more of it, and release work grows — a pelvic floor that can lengthen is what you want heading into birth.',
    emphasis: [
      'Maintain strength, stop chasing more',
      'More release and mobility work',
      'Everything from a comfortable position',
    ],
    startWeek: 28,
    endWeek: 34,
    sessions: [
      {
        id: 'sustain-a',
        title: 'Steady Strength',
        steps: [
          { type: 'hold', exerciseId: 'connection-breath', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'long-hold',
            reps: 6,
            liftSec: 2,
            holdSec: 5,
            releaseSec: 4,
            restSec: 8,
          },
          {
            type: 'reps',
            exerciseId: 'quick-flicks',
            reps: 8,
            liftSec: 1,
            holdSec: 1,
            releaseSec: 1,
            restSec: 3,
          },
          {
            type: 'reps',
            exerciseId: 'side-lying-clam',
            reps: 10,
            liftSec: 1,
            holdSec: 2,
            releaseSec: 2,
            restSec: 3,
            note: 'Ten each side.',
          },
          { type: 'hold', exerciseId: 'full-release', durationSec: 60 },
        ],
      },
      {
        id: 'sustain-b',
        title: 'Open and Mobile',
        steps: [
          { type: 'hold', exerciseId: 'cat-cow', durationSec: 60 },
          { type: 'hold', exerciseId: 'pelvic-tilt', durationSec: 60 },
          {
            type: 'reps',
            exerciseId: 'deep-squat-support',
            reps: 5,
            liftSec: 3,
            holdSec: 8,
            releaseSec: 3,
            restSec: 8,
            note: 'Hold the counter. Relax the floor completely at the bottom.',
          },
          { type: 'hold', exerciseId: 'hip-flexor-kneel', durationSec: 60 },
          { type: 'hold', exerciseId: 'full-release', durationSec: 60 },
        ],
      },
      {
        id: 'sustain-c',
        title: 'Control',
        steps: [
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'elevator',
            reps: 5,
            liftSec: 4,
            holdSec: 3,
            releaseSec: 4,
            restSec: 8,
          },
          {
            type: 'reps',
            exerciseId: 'heel-slide',
            reps: 8,
            liftSec: 2,
            holdSec: 2,
            releaseSec: 2,
            restSec: 4,
            note: 'Alternate legs.',
          },
          { type: 'hold', exerciseId: 'child-pose-wide', durationSec: 60 },
          { type: 'hold', exerciseId: 'full-release', durationSec: 45 },
        ],
      },
    ],
  },
  {
    id: 'prepare',
    colorKey: 'prepare',
    phase: 'pregnancy',
    title: 'Prepare',
    range: 'Week 35 onward',
    focus:
      'The emphasis flips. Most of what helps now is opening, softening and breathing — the skills you actually use in labor. Strength work stays in, but light, just enough to keep the connection.',
    emphasis: [
      'Release and opening take the lead',
      'Practice breathing that keeps the floor soft',
      'Keep a light strength thread, nothing maximal',
    ],
    startWeek: 35,
    endWeek: null,
    sessions: [
      {
        id: 'prepare-a',
        title: 'Opening',
        steps: [
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 60 },
          { type: 'hold', exerciseId: 'birth-breathing', durationSec: 60 },
          {
            type: 'reps',
            exerciseId: 'perineal-bulge',
            reps: 5,
            liftSec: 3,
            holdSec: 5,
            releaseSec: 3,
            restSec: 10,
            note: 'Gentle. If anything feels like straining, stop and just breathe.',
          },
          {
            type: 'reps',
            exerciseId: 'deep-squat-support',
            reps: 4,
            liftSec: 3,
            holdSec: 10,
            releaseSec: 3,
            restSec: 10,
          },
          { type: 'hold', exerciseId: 'child-pose-wide', durationSec: 60 },
        ],
      },
      {
        id: 'prepare-b',
        title: 'Light and Connected',
        steps: [
          { type: 'hold', exerciseId: 'connection-breath', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'short-hold',
            reps: 6,
            liftSec: 2,
            holdSec: 3,
            releaseSec: 4,
            restSec: 8,
          },
          {
            type: 'reps',
            exerciseId: 'quick-flicks',
            reps: 6,
            liftSec: 1,
            holdSec: 1,
            releaseSec: 1,
            restSec: 4,
          },
          { type: 'hold', exerciseId: 'happy-baby-supported', durationSec: 60 },
          { type: 'hold', exerciseId: 'full-release', durationSec: 60 },
        ],
      },
      {
        id: 'prepare-c',
        title: 'Comfort',
        steps: [
          { type: 'hold', exerciseId: 'cat-cow', durationSec: 60 },
          { type: 'hold', exerciseId: 'pelvic-tilt', durationSec: 60 },
          { type: 'hold', exerciseId: 'figure-four', durationSec: 60 },
          { type: 'hold', exerciseId: 'hip-flexor-kneel', durationSec: 60 },
          { type: 'hold', exerciseId: 'rest-and-breathe', durationSec: 90 },
        ],
      },
    ],
  },
  {
    id: 'recover',
    colorKey: 'recover',
    phase: 'postpartum',
    title: 'Recover',
    range: 'First two weeks',
    focus:
      'Nothing to train yet. Breathing gently restores the connection between your diaphragm and pelvic floor, and rest does more for healing right now than any exercise could.',
    emphasis: [
      'Breath and rest only',
      'No strengthening, no hurry',
      'Heaviness or more bleeding means lie down',
    ],
    startWeek: 0,
    endWeek: 1,
    sessions: [
      {
        id: 'recover-a',
        title: 'Rest',
        steps: [
          { type: 'hold', exerciseId: 'rest-and-breathe', durationSec: 90 },
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 90 },
          { type: 'hold', exerciseId: 'posture-reset', durationSec: 45 },
        ],
      },
      {
        id: 'recover-b',
        title: 'Soft Reconnection',
        steps: [
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 60 },
          { type: 'hold', exerciseId: 'connection-breath', durationSec: 60 },
          { type: 'hold', exerciseId: 'rest-and-breathe', durationSec: 90 },
        ],
      },
    ],
  },
  {
    id: 'reconnect',
    colorKey: 'reconnect',
    phase: 'postpartum',
    title: 'Reconnect',
    range: 'Weeks 2–5',
    focus:
      'Small, gentle work returns. Short holds, easy movement and walking. The aim is to feel the muscles respond again, not to make them tired.',
    emphasis: [
      'Short holds, generous rest',
      'Walking as real exercise',
      'Back off if anything feels heavy',
    ],
    startWeek: 2,
    endWeek: 5,
    sessions: [
      {
        id: 'reconnect-a',
        title: 'Waking Up',
        steps: [
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 60 },
          { type: 'hold', exerciseId: 'connection-breath', durationSec: 60 },
          {
            type: 'reps',
            exerciseId: 'short-hold',
            reps: 6,
            liftSec: 2,
            holdSec: 3,
            releaseSec: 3,
            restSec: 8,
          },
          { type: 'hold', exerciseId: 'posture-reset', durationSec: 45 },
        ],
      },
      {
        id: 'reconnect-b',
        title: 'Easy Movement',
        steps: [
          { type: 'hold', exerciseId: 'connection-breath', durationSec: 60 },
          {
            type: 'reps',
            exerciseId: 'heel-slide',
            reps: 8,
            liftSec: 2,
            holdSec: 2,
            releaseSec: 2,
            restSec: 5,
            note: 'Alternate legs. Stop if you feel any doming or dragging.',
          },
          { type: 'hold', exerciseId: 'pelvic-tilt', durationSec: 60 },
          { type: 'hold', exerciseId: 'gentle-walk', durationSec: 180 },
        ],
      },
    ],
  },
  {
    id: 'rebuild',
    colorKey: 'rebuild',
    phase: 'postpartum',
    title: 'Rebuild',
    range: 'Week 6 onward',
    focus:
      'Progressive strength again, layered back onto everyday movement. This is also the point to get properly checked — a pelvic floor physical therapist is worth it even when nothing feels wrong.',
    emphasis: [
      'Strength and function together',
      'Get cleared before adding running or lifting',
      'Leaking or heaviness is a reason to be seen, not to push harder',
    ],
    startWeek: 6,
    endWeek: null,
    sessions: [
      {
        id: 'rebuild-a',
        title: 'Strength',
        steps: [
          { type: 'hold', exerciseId: 'connection-breath', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'long-hold',
            reps: 8,
            liftSec: 2,
            holdSec: 6,
            releaseSec: 3,
            restSec: 8,
          },
          {
            type: 'reps',
            exerciseId: 'quick-flicks',
            reps: 10,
            liftSec: 1,
            holdSec: 1,
            releaseSec: 1,
            restSec: 3,
          },
          {
            type: 'reps',
            exerciseId: 'bridge',
            reps: 10,
            liftSec: 2,
            holdSec: 2,
            releaseSec: 3,
            restSec: 5,
          },
          {
            type: 'reps',
            exerciseId: 'side-lying-clam',
            reps: 10,
            liftSec: 1,
            holdSec: 2,
            releaseSec: 2,
            restSec: 3,
            note: 'Ten each side.',
          },
        ],
      },
      {
        id: 'rebuild-b',
        title: 'Function',
        steps: [
          { type: 'hold', exerciseId: 'posture-reset', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'sit-to-stand',
            reps: 10,
            liftSec: 2,
            holdSec: 2,
            releaseSec: 2,
            restSec: 5,
          },
          {
            type: 'reps',
            exerciseId: 'bird-dog',
            reps: 8,
            liftSec: 2,
            holdSec: 3,
            releaseSec: 2,
            restSec: 4,
            note: 'Alternate sides each rep.',
          },
          {
            type: 'reps',
            exerciseId: 'the-knack',
            reps: 6,
            liftSec: 1,
            holdSec: 2,
            releaseSec: 2,
            restSec: 6,
          },
          { type: 'hold', exerciseId: 'full-release', durationSec: 45 },
        ],
      },
      {
        id: 'rebuild-c',
        title: 'Load Ready',
        steps: [
          { type: 'hold', exerciseId: 'connection-breath', durationSec: 45 },
          {
            type: 'reps',
            exerciseId: 'wall-sit-lift',
            reps: 4,
            liftSec: 2,
            holdSec: 10,
            releaseSec: 3,
            restSec: 10,
          },
          {
            type: 'reps',
            exerciseId: 'heel-slide',
            reps: 10,
            liftSec: 2,
            holdSec: 2,
            releaseSec: 2,
            restSec: 4,
            note: 'Alternate legs.',
          },
          {
            type: 'reps',
            exerciseId: 'bridge',
            reps: 10,
            liftSec: 2,
            holdSec: 3,
            releaseSec: 3,
            restSec: 5,
          },
          { type: 'hold', exerciseId: 'figure-four', durationSec: 60 },
        ],
      },
    ],
  },
];

export const stagesById = Object.fromEntries(stages.map((s) => [s.id, s])) as Record<
  StageId,
  Stage
>;

export function isStageId(value: unknown): value is StageId {
  return typeof value === 'string' && Object.hasOwn(stagesById, value);
}

export function stagesForPhase(phase: Phase): Stage[] {
  return stages.filter((stage) => stage.phase === phase);
}

/** Picks the stage whose week range contains `week`, clamping at both ends. */
export function stageFor(phase: Phase, week: number): Stage {
  const candidates = stagesForPhase(phase);
  const first = candidates[0];
  const last = candidates[candidates.length - 1];
  // Both phases are populated in the table above, so this is a table-integrity
  // failure rather than anything a user can reach.
  if (!first || !last) throw new Error(`No stages defined for phase: ${phase}`);

  const match = candidates.find(
    (stage) => week >= stage.startWeek && (stage.endWeek === null || week <= stage.endWeek)
  );
  if (match) return match;
  // Before the first stage's range (e.g. a due date more than 40 weeks out).
  return week < first.startWeek ? first : last;
}
