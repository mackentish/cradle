import type { NonEmpty, Program, Stage } from '../types';

/**
 * Birth prep: mobility and stretching aimed squarely at labor and delivery —
 * opening the pelvis, lengthening what pulls on it, and rehearsing the softening
 * she will actually use. Postpartum the program keeps its slot but retitles to
 * "Recovery stretches", because the content is genuinely useful and "birth prep"
 * would read as a bug once the baby is here.
 *
 * The bearing-down and deep-opening work is held back until `prepare` on
 * purpose: the exercises that carry a preterm-labor caution should not turn up in
 * the rotation at twenty weeks.
 */
const stages: NonEmpty<Stage> = [
  {
    id: 'foundation',
    programId: 'birth-prep',
    colorKey: 'foundation',
    phase: 'pregnancy',
    title: 'Foundation',
    range: 'Weeks 1–13',
    focus:
      'Nothing about birth yet. This early it is a habit you are building, not a skill — five easy minutes of moving the spine and hips, which also happens to be one of the better things you can do about first-trimester stiffness.',
    emphasis: [
      'Move the spine and hips every day',
      'Comfortable range only',
      'Long, slow out-breaths',
    ],
    startWeek: 1,
    endWeek: 13,
    sessions: [
      {
        id: 'birth-prep-foundation-a',
        title: 'Easy Mobility',
        steps: [
          { type: 'hold', exerciseId: 'cat-cow', durationSec: 60 },
          { type: 'hold', exerciseId: 'pelvic-circles-ball', durationSec: 90 },
          { type: 'hold', exerciseId: 'neck-shoulder-release', durationSec: 60 },
          { type: 'hold', exerciseId: 'chest-opener-doorway', durationSec: 60 },
        ],
      },
      {
        id: 'birth-prep-foundation-b',
        title: 'Open and Settle',
        steps: [
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 60 },
          { type: 'hold', exerciseId: 'butterfly-stretch', durationSec: 90 },
          { type: 'hold', exerciseId: 'figure-four', durationSec: 60 },
          { type: 'hold', exerciseId: 'child-pose-wide', durationSec: 60 },
        ],
      },
    ],
  },
  {
    id: 'build',
    programId: 'birth-prep',
    colorKey: 'build',
    phase: 'pregnancy',
    title: 'Build',
    range: 'Weeks 14–27',
    focus:
      'Range, while you still have it easily. Hip flexors and hamstrings tighten as your posture changes, and both pull the pelvis into positions that make the end of pregnancy harder than it needs to be.',
    emphasis: [
      'Hips, hamstrings and the front of the chest',
      'Both sides, every session',
      'Comfortable, never maximum',
    ],
    startWeek: 14,
    endWeek: 27,
    sessions: [
      {
        id: 'birth-prep-build-a',
        title: 'Hips and Breath',
        steps: [
          { type: 'hold', exerciseId: 'pelvic-circles-ball', durationSec: 90 },
          { type: 'hold', exerciseId: 'butterfly-stretch', durationSec: 90 },
          { type: 'hold', exerciseId: 'hip-flexor-kneel', durationSec: 60 },
          { type: 'hold', exerciseId: 'cat-cow', durationSec: 60 },
        ],
      },
      {
        id: 'birth-prep-build-b',
        title: 'Long Lines',
        steps: [
          { type: 'hold', exerciseId: 'standing-hamstring-support', durationSec: 90 },
          { type: 'hold', exerciseId: 'supported-lunge-stretch', durationSec: 90 },
          { type: 'hold', exerciseId: 'chest-opener-doorway', durationSec: 60 },
          { type: 'hold', exerciseId: 'child-pose-wide', durationSec: 60 },
        ],
      },
      {
        id: 'birth-prep-build-c',
        title: 'Upper and Lower',
        steps: [
          { type: 'hold', exerciseId: 'neck-shoulder-release', durationSec: 60 },
          { type: 'hold', exerciseId: 'chest-opener-doorway', durationSec: 60 },
          { type: 'hold', exerciseId: 'figure-four', durationSec: 90 },
          { type: 'hold', exerciseId: 'birth-ball-lean', durationSec: 90 },
        ],
      },
    ],
  },
  {
    id: 'sustain',
    programId: 'birth-prep',
    colorKey: 'sustain',
    phase: 'pregnancy',
    title: 'Sustain',
    range: 'Weeks 28–34',
    focus:
      'The emphasis tips toward opening. Squats and forward-leaning positions come in, and they do double duty — they make the last weeks more comfortable and they are the positions you may well want during labor.',
    emphasis: [
      'Open the outlet, not just the hips',
      'Get comfortable leaning forward',
      'Let the pelvic floor go soft at the bottom of everything',
    ],
    startWeek: 28,
    endWeek: 34,
    sessions: [
      {
        id: 'birth-prep-sustain-a',
        title: 'Opening Up',
        steps: [
          { type: 'hold', exerciseId: 'pelvic-circles-ball', durationSec: 120 },
          { type: 'hold', exerciseId: 'butterfly-stretch', durationSec: 90 },
          { type: 'hold', exerciseId: 'deep-squat-support', durationSec: 45 },
          { type: 'hold', exerciseId: 'birth-ball-lean', durationSec: 90 },
        ],
      },
      {
        id: 'birth-prep-sustain-b',
        title: 'Space to Breathe',
        steps: [
          { type: 'hold', exerciseId: 'birth-ball-lean', durationSec: 120 },
          { type: 'hold', exerciseId: 'cat-cow', durationSec: 60 },
          { type: 'hold', exerciseId: 'chest-opener-doorway', durationSec: 60 },
          { type: 'hold', exerciseId: 'child-pose-wide', durationSec: 90 },
        ],
      },
      {
        id: 'birth-prep-sustain-c',
        title: 'Hips Wide',
        steps: [
          { type: 'hold', exerciseId: 'supported-lunge-stretch', durationSec: 90 },
          { type: 'hold', exerciseId: 'figure-four', durationSec: 90 },
          { type: 'hold', exerciseId: 'butterfly-stretch', durationSec: 90 },
          { type: 'hold', exerciseId: 'standing-hamstring-support', durationSec: 60 },
        ],
      },
    ],
  },
  {
    id: 'prepare',
    programId: 'birth-prep',
    colorKey: 'prepare',
    phase: 'pregnancy',
    title: 'Prepare',
    range: 'Week 35 onward',
    focus:
      'This is what the program was named for. Deep squats, forward leaning and open-throat breathing are rehearsals — the more familiar these positions and this breath are now, the less you have to work them out for the first time in labor.',
    emphasis: [
      'Rehearse the positions, not just the stretch',
      'Breathe low and open, jaw loose',
      'Softening is the skill',
    ],
    startWeek: 35,
    endWeek: null,
    sessions: [
      {
        id: 'birth-prep-prepare-a',
        title: 'Practicing Opening',
        steps: [
          { type: 'hold', exerciseId: 'pelvic-circles-ball', durationSec: 90 },
          { type: 'hold', exerciseId: 'deep-squat-support', durationSec: 60 },
          { type: 'hold', exerciseId: 'birth-breathing', durationSec: 90 },
          { type: 'hold', exerciseId: 'birth-ball-lean', durationSec: 120 },
        ],
      },
      {
        id: 'birth-prep-prepare-b',
        title: 'Positions for Labor',
        steps: [
          { type: 'hold', exerciseId: 'birth-ball-lean', durationSec: 120 },
          { type: 'hold', exerciseId: 'deep-squat-support', durationSec: 60 },
          { type: 'hold', exerciseId: 'happy-baby-supported', durationSec: 60 },
          { type: 'hold', exerciseId: 'child-pose-wide', durationSec: 90 },
        ],
      },
      {
        id: 'birth-prep-prepare-c',
        title: 'Ease and Comfort',
        steps: [
          { type: 'hold', exerciseId: 'neck-shoulder-release', durationSec: 60 },
          { type: 'hold', exerciseId: 'chest-opener-doorway', durationSec: 60 },
          { type: 'hold', exerciseId: 'birth-ball-lean', durationSec: 120 },
          { type: 'hold', exerciseId: 'rest-and-breathe', durationSec: 120 },
        ],
      },
    ],
  },
  {
    id: 'recover',
    programId: 'birth-prep',
    colorKey: 'recover',
    phase: 'postpartum',
    title: 'Recover',
    range: 'First two weeks',
    focus:
      'Nothing that opens the pelvis, and nothing held long. What actually hurts in the first fortnight is your neck, shoulders and upper back, from hours of looking down at someone — so that is what this eases.',
    emphasis: [
      'Neck and shoulders, gently',
      'Nothing for the pelvis yet',
      'Lying down counts',
    ],
    startWeek: 0,
    endWeek: 1,
    sessions: [
      {
        id: 'birth-prep-recover-a',
        title: 'Rest and Release',
        steps: [
          { type: 'hold', exerciseId: 'rest-and-breathe', durationSec: 180 },
          { type: 'hold', exerciseId: 'neck-shoulder-release', durationSec: 60 },
          { type: 'hold', exerciseId: 'chest-opener-doorway', durationSec: 60 },
        ],
      },
      {
        id: 'birth-prep-recover-b',
        title: 'Soft Reset',
        steps: [
          { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 90 },
          { type: 'hold', exerciseId: 'neck-shoulder-release', durationSec: 90 },
          { type: 'hold', exerciseId: 'rest-and-breathe', durationSec: 120 },
        ],
      },
    ],
  },
  {
    id: 'reconnect',
    programId: 'birth-prep',
    colorKey: 'reconnect',
    phase: 'postpartum',
    title: 'Reconnect',
    range: 'Weeks 2–5',
    focus:
      'Feeding posture is the whole story of these few weeks — rounded forward, shoulders up, chest closed, for hours a day. This undoes some of it, and starts letting the hips move again.',
    emphasis: [
      'Open the chest, drop the shoulders',
      'Get the hips moving again',
      'Little and often beats one long session',
    ],
    startWeek: 2,
    endWeek: 5,
    sessions: [
      {
        id: 'birth-prep-reconnect-a',
        title: 'Feeding Posture',
        steps: [
          { type: 'hold', exerciseId: 'neck-shoulder-release', durationSec: 90 },
          { type: 'hold', exerciseId: 'chest-opener-doorway', durationSec: 90 },
          { type: 'hold', exerciseId: 'posture-reset', durationSec: 45 },
          { type: 'hold', exerciseId: 'cat-cow', durationSec: 60 },
        ],
      },
      {
        id: 'birth-prep-reconnect-b',
        title: 'Hips Again',
        steps: [
          { type: 'hold', exerciseId: 'figure-four', durationSec: 90 },
          { type: 'hold', exerciseId: 'hip-flexor-kneel', durationSec: 60 },
          { type: 'hold', exerciseId: 'cat-cow', durationSec: 60 },
          { type: 'hold', exerciseId: 'child-pose-wide', durationSec: 60 },
        ],
      },
    ],
  },
  {
    id: 'rebuild',
    programId: 'birth-prep',
    colorKey: 'rebuild',
    phase: 'postpartum',
    title: 'Rebuild',
    range: 'Week 6 onward',
    focus:
      'Full range again, in every direction. Relaxin takes months to clear, so end range still deserves respect — but this is the point where a proper stretch stops being something to be careful about and goes back to being useful.',
    emphasis: [
      'Full range, still not forced',
      'Hips, hamstrings, chest and neck',
      'Keep it as long as it keeps helping',
    ],
    startWeek: 6,
    endWeek: null,
    sessions: [
      {
        id: 'birth-prep-rebuild-a',
        title: 'Full Range',
        steps: [
          { type: 'hold', exerciseId: 'standing-hamstring-support', durationSec: 90 },
          { type: 'hold', exerciseId: 'supported-lunge-stretch', durationSec: 90 },
          { type: 'hold', exerciseId: 'figure-four', durationSec: 90 },
          { type: 'hold', exerciseId: 'chest-opener-doorway', durationSec: 60 },
        ],
      },
      {
        id: 'birth-prep-rebuild-b',
        title: 'Upper Body',
        steps: [
          { type: 'hold', exerciseId: 'neck-shoulder-release', durationSec: 90 },
          { type: 'hold', exerciseId: 'chest-opener-doorway', durationSec: 90 },
          { type: 'hold', exerciseId: 'cat-cow', durationSec: 60 },
          { type: 'hold', exerciseId: 'posture-reset', durationSec: 45 },
        ],
      },
      {
        id: 'birth-prep-rebuild-c',
        title: 'Everything Long',
        steps: [
          { type: 'hold', exerciseId: 'butterfly-stretch', durationSec: 90 },
          { type: 'hold', exerciseId: 'standing-hamstring-support', durationSec: 90 },
          { type: 'hold', exerciseId: 'hip-flexor-kneel', durationSec: 90 },
          { type: 'hold', exerciseId: 'child-pose-wide', durationSec: 90 },
        ],
      },
    ],
  },
];

export const birthPrepProgram: Program = {
  id: 'birth-prep',
  colorKey: 'birth-prep',
  title: 'Birth prep',
  postpartumTitle: 'Recovery stretches',
  blurb: 'Open the hips, lengthen what pulls on them, rehearse letting go.',
  stages,
};
