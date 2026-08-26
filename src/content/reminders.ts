import type { Stage, StageId } from '@/domain/types';

export type ReminderCopy = {
  title: string;
  body: string;
};

/**
 * Reminder wording per stage. A daily trigger carries fixed text, so the app
 * reschedules on launch — which means the copy follows the program as she
 * moves through it, and a third-trimester reminder never says "build strength".
 */
const COPY: Record<StageId, ReminderCopy> = {
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
};

export function reminderCopy(stage: Stage | null): ReminderCopy {
  if (!stage) {
    return {
      title: 'Your daily session',
      body: 'A few minutes for your pelvic floor.',
    };
  }
  return COPY[stage.id];
}
