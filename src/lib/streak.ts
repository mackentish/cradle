import { PROGRAM_IDS } from '@/domain/program';
import type { ProgramId, SessionLog } from '@/domain/types';

import { now } from './clock';
import { addDays, fromDayKey, toDayKey } from './date';

export type ProgramSummary = {
  /** Consecutive days up to today (or yesterday, if today isn't done yet). */
  current: number;
  longest: number;
  totalSessions: number;
  totalSeconds: number;
  daysThisWeek: number;
  completedToday: boolean;
};

export type StreakSummary = ProgramSummary & {
  /** The same figures, program by program. */
  byProgram: Record<ProgramId, ProgramSummary>;
  /** How many of the three programs were completed today. */
  programsToday: number;
};

function uniqueDays(logs: SessionLog[]): string[] {
  return Array.from(new Set(logs.map((log) => log.day))).sort();
}

/**
 * The figures for one set of logs. Called once for everything and once per
 * program, so the headline streak and a program's own streak are computed by
 * exactly the same walk rather than two that can drift apart.
 */
function summarizeDays(logs: SessionLog[], today: Date): ProgramSummary {
  const days = uniqueDays(logs);
  const daySet = new Set(days);
  const todayKey = toDayKey(today);
  const completedToday = daySet.has(todayKey);

  // Walk backwards from today; a gap only breaks the streak once today itself
  // has been skipped, so an unfinished today doesn't zero out yesterday's work.
  let current = 0;
  let cursor = completedToday ? today : addDays(today, -1);
  while (daySet.has(toDayKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of days) {
    if (previous && toDayKey(addDays(fromDayKey(previous), 1)) === day) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    previous = day;
  }

  const weekStart = addDays(today, -6);
  const daysThisWeek = days.filter((day) => day >= toDayKey(weekStart) && day <= todayKey).length;

  return {
    current,
    longest,
    totalSessions: logs.length,
    totalSeconds: logs.reduce((total, log) => total + log.seconds, 0),
    daysThisWeek,
    completedToday,
  };
}

/**
 * The headline figures count a day as done if *any* program was completed — which
 * is what keeps a streak from breaking the day she only had time for one, and
 * means every streak on record before there were three programs still reads the
 * same. `byProgram` is where you look to notice you've skipped core for a month.
 */
export function summarize(logs: SessionLog[], today: Date = now()): StreakSummary {
  const byProgram = Object.fromEntries(
    PROGRAM_IDS.map((id) => [
      id,
      summarizeDays(
        logs.filter((log) => log.programId === id),
        today
      ),
    ])
  ) as Record<ProgramId, ProgramSummary>;

  return {
    ...summarizeDays(logs, today),
    byProgram,
    programsToday: PROGRAM_IDS.filter((id) => byProgram[id].completedToday).length,
  };
}

/** Which programs landed on a given day. Drives the ring tracker. */
export type DayMark = {
  day: string;
  done: ProgramId[];
};

/** The last `count` days, oldest first, with the programs completed on each. */
export function recentDays(logs: SessionLog[], count: number, today: Date = now()): DayMark[] {
  const byDay = new Map<string, Set<ProgramId>>();
  for (const log of logs) {
    const existing = byDay.get(log.day);
    if (existing) existing.add(log.programId);
    else byDay.set(log.day, new Set([log.programId]));
  }

  return Array.from({ length: count }, (_, i) => {
    const day = toDayKey(addDays(today, -(count - 1 - i)));
    const done = byDay.get(day);
    // Filtered through PROGRAM_IDS so the order is the display order, always.
    return { day, done: done ? PROGRAM_IDS.filter((id) => done.has(id)) : [] };
  });
}
