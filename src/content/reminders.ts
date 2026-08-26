import type { ProgramId, Stage, StageId } from '@/domain/types';

export type ReminderCopy = {
  title: string;
  body: string;
};

/**
 * Reminder wording per program, per stage. A daily trigger carries fixed text, so
 * the app reschedules on launch — which means the copy follows the program as she
 * moves through it, and a third-trimester reminder never says "build strength".
 *
 * Two axes and twenty-one entries is a lot of hand-written copy, but the nested
 * `Record` makes a missing one a compile error, which is exactly the tripwire you
 * want when a new program or stage is added.
 */
const COPY: Record<ProgramId, Record<StageId, ReminderCopy>> = {
  'pelvic-floor': {
    foundation: {
      title: 'A few quiet minutes',
      body: 'Find your breath, find your pelvic floor. Four minutes is a whole session.',
    },
    build: {
      title: 'Time to build',
      body: 'This is the best window for real strength work. Your session is ready.',
    },
    sustain: {
      title: 'Keep the connection',
      body: 'Maintain what you built, and give the release work its time.',
    },
    prepare: {
      title: 'Practice opening',
      body: 'Softening and breathing are the skills you will actually use. A few minutes today.',
    },
    recover: {
      title: 'Rest and breathe',
      body: 'Nothing to train yet. Lie down, breathe, let everything be heavy.',
    },
    reconnect: {
      title: 'Gently does it',
      body: 'Short holds, easy movement. Stop before you are tired.',
    },
    rebuild: {
      title: 'Ready when you are',
      body: 'Strength and everyday movement, back together. Your session is ready.',
    },
  },
  core: {
    foundation: {
      title: 'Find the deep core',
      body: 'Breath first, load later. A few slow exhales is the whole job today.',
    },
    build: {
      title: 'Best window for core',
      body: 'Planks, side work and anti-rotation, while the bump is still out of the way.',
    },
    sustain: {
      title: 'Hold what you built',
      body: 'Upright and side-lying today. Keep the midline quiet and call it done.',
    },
    prepare: {
      title: 'Light and practical',
      body: 'Getting off the sofa without straining is the goal now. Short and useful.',
    },
    recover: {
      title: 'No core work today',
      body: 'Your abdominal wall has earned this. Breathe well and let it be.',
    },
    reconnect: {
      title: 'Waking the core up',
      body: 'Breath, then a gentle draw-in. Any doming means you are ahead of yourself.',
    },
    rebuild: {
      title: 'Add a little load',
      body: 'Planks and holds are back. Both sides, midline quiet.',
    },
  },
  'birth-prep': {
    foundation: {
      title: 'Five easy minutes',
      body: 'Move the spine and hips. Nothing about birth yet — just the habit.',
    },
    build: {
      title: 'Keep your range',
      body: 'Hips, hamstrings and chest, while it is all still easy to reach.',
    },
    sustain: {
      title: 'Start opening',
      body: 'Squats and leaning forward. Comfortable now, useful in labor.',
    },
    prepare: {
      title: 'Rehearse for labor',
      body: 'These positions and this breath are what you will lean on. Practice them.',
    },
    recover: {
      title: 'Neck and shoulders',
      body: 'Nothing for the pelvis. Just easing the hours of looking down.',
    },
    reconnect: {
      title: 'Undo the feeding slump',
      body: 'Open the chest, drop the shoulders, let the hips move again.',
    },
    rebuild: {
      title: 'Full range again',
      body: 'A proper stretch is useful now. Still not forced, though.',
    },
  },
};

/** Shown when there's no due date yet, so no stage to speak of. */
const FALLBACK: Record<ProgramId, ReminderCopy> = {
  'pelvic-floor': {
    title: 'Your daily session',
    body: 'A few minutes for your pelvic floor.',
  },
  core: {
    title: 'Your daily session',
    body: 'A few minutes of deep core work.',
  },
  'birth-prep': {
    title: 'Your daily session',
    body: 'A few minutes of stretching.',
  },
};

export function reminderCopy(programId: ProgramId, stage: Stage | null): ReminderCopy {
  if (!stage) return FALLBACK[programId];
  return COPY[programId][stage.id];
}
