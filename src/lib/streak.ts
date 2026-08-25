import type { SessionLog } from '@/domain/types';

import { now } from './clock';
import { addDays, fromDayKey, toDayKey } from './date';

export type StreakSummary = {
  /** Consecutive days up to today (or yesterday, if today isn't done yet). */
  current: number;
  longest: number;
  totalSessions: number;
  totalSeconds: number;
  daysThisWeek: number;
  completedToday: boolean;
};

function uniqueDays(logs: SessionLog[]): string[] {
  return Array.from(new Set(logs.map((log) => log.day))).sort();
}

export function summarise(logs: SessionLog[], today: Date = now()): StreakSummary {
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

/** The last `count` days, oldest first, flagged with whether a session landed. */
export function recentDays(
  logs: SessionLog[],
  count: number,
  today: Date = now()
): Array<{ day: string; done: boolean }> {
  const daySet = new Set(logs.map((log) => log.day));
  return Array.from({ length: count }, (_, i) => {
    const day = toDayKey(addDays(today, -(count - 1 - i)));
    return { day, done: daySet.has(day) };
  });
}
