import { programsById, programTitle } from '@/domain/program';
import type { Phase, ProgramId, StageId } from '@/domain/types';

export type Celebration = {
  title: string;
  body: string;
};

type CelebrationInput = {
  /** Sessions logged before this one, across every program. */
  totalSessions: number;
  /** Sessions logged before this one in the program she just finished. */
  programSessions: number;
  /** Consecutive days, already counting today. */
  streak: number;
  /** How many of the three programs are now done today, counting this one. */
  programsToday: number;
  phase: Phase;
  stageId: StageId;
  programId: ProgramId;
};

/** What she sees when a session finishes, per program. */
const FIRST_IN_PROGRAM: Record<ProgramId, Celebration> = {
  'pelvic-floor': {
    title: 'Floor work, started',
    body: 'This is the one that pays off quietly and for years. Good place to begin.',
  },
  core: {
    title: 'Core work, started',
    body: 'Deep and unglamorous, and worth more than any amount of crunching. Nicely done.',
  },
  'birth-prep': {
    title: 'Birth prep, started',
    body: 'Every one of these makes a position or a breath more familiar than it was.',
  },
};

const IN_PREPARE: Record<ProgramId, Celebration> = {
  'pelvic-floor': {
    title: 'Well done',
    body: 'Every one of these teaches your body to open and let go. That is what you will lean on.',
  },
  core: {
    title: 'Well done',
    body: 'Light and practical is exactly right this close in. Nothing to prove now.',
  },
  'birth-prep': {
    title: 'Rehearsed',
    body: 'That is one more time these positions and this breath were not new. It adds up.',
  },
};

/**
 * What she sees when a session finishes. Worth varying: "Session complete" on the
 * fiftieth day reads like a receipt, the same cheer for a first-trimester
 * strength set and a two-day-postpartum breathing session would be tone deaf, and
 * pelvic-floor phrasing after a stretching session is just wrong.
 */
export function celebrationFor({
  totalSessions,
  programSessions,
  streak,
  programsToday,
  phase,
  stageId,
  programId,
}: CelebrationInput): Celebration {
  if (totalSessions === 0) {
    return {
      title: "That's one",
      body: 'Your first session is behind you. Showing up was the hard part — the rest is just repetition.',
    };
  }

  // Not her first session, but her first in this program — worth marking, since
  // starting a second or third program is its own decision.
  if (programSessions === 0) {
    return FIRST_IN_PROGRAM[programId];
  }

  if (programsToday === 3) {
    return {
      title: 'All three, today',
      body: 'Floor, core and stretching in one day. That is a complete day by any measure.',
    };
  }

  if (phase === 'postpartum' && stageId === 'recover') {
    return {
      title: 'Rest counts',
      body: 'Breathing and lying still is the work right now. You did it.',
    };
  }

  if (stageId === 'prepare') {
    return IN_PREPARE[programId];
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
    body: `Take a slow breath before you get up. ${programTitle(programsById[programId], phase)} is done for today.`,
  };
}
