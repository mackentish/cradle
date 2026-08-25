import type { Phase, StageId } from '@/domain/types';

export type Celebration = {
  title: string;
  body: string;
};

type CelebrationInput = {
  /** Sessions logged before this one. */
  totalSessions: number;
  /** Consecutive days, already counting today. */
  streak: number;
  phase: Phase;
  stageId: StageId;
};

/**
 * What she sees when a session finishes. Worth varying: "Session complete" on the
 * fiftieth day reads like a receipt, and the same cheer for a first-trimester
 * strength set and a two-day-postpartum breathing session would be tone deaf.
 */
export function celebrationFor({
  totalSessions,
  streak,
  phase,
  stageId,
}: CelebrationInput): Celebration {
  if (totalSessions === 0) {
    return {
      title: "That's one",
      body: 'Your first session is behind you. Showing up was the hard part — the rest is just repetition.',
    };
  }

  if (phase === 'postpartum' && stageId === 'recover') {
    return {
      title: 'Rest counts',
      body: 'Breathing and lying still is the work right now. You did it.',
    };
  }

  if (stageId === 'prepare') {
    return {
      title: 'Well done',
      body: 'Every one of these teaches your body to open and let go. That is what you will lean on.',
    };
  }

  if (streak >= 7) {
    return {
      title: `${streak} days running`,
      body: 'More than a week without a gap. This is a habit now, not an effort.',
    };
  }

  if (streak >= 3) {
    return {
      title: `${streak} days in a row`,
      body: 'Consistency is doing more for you here than any single hard session could.',
    };
  }

  return {
    title: 'Beautifully done',
    body: 'Take a slow breath before you get up.',
  };
}
