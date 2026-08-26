import { now } from '@/lib/clock';
import { daysBetween, fromDayKey, startOfDay } from '@/lib/date';

import { stagesForWeek } from './program';
import type { Phase, Profile, Progress } from './types';

/** A full-term pregnancy is dated as 280 days from LMP, i.e. 40 weeks. */
export const GESTATION_DAYS = 280;
export const MAX_TRACKED_WEEK = 42;

/**
 * Turns a due date (and an optional birth date) into everything the program
 * needs to know. This is the only place gestational age is computed.
 */
export function getProgress(profile: Profile, today: Date = now()): Progress | null {
  const { dueDate, birthDate } = profile;

  if (birthDate) {
    const daysSinceBirth = Math.max(0, daysBetween(fromDayKey(birthDate), today));
    const week = Math.floor(daysSinceBirth / 7);
    const stages = stagesForWeek('postpartum', week);
    return {
      phase: 'postpartum',
      week,
      dayOfWeek: daysSinceBirth % 7,
      daysUntilDue: dueDate ? daysBetween(today, fromDayKey(dueDate)) : 0,
      trimester: null,
      stages,
      stage: stages['pelvic-floor'],
    };
  }

  if (!dueDate) return null;

  const daysUntilDue = daysBetween(today, fromDayKey(dueDate));
  const gestationalDays = GESTATION_DAYS - daysUntilDue;
  const clamped = Math.min(Math.max(gestationalDays, 0), MAX_TRACKED_WEEK * 7 + 6);
  const week = Math.floor(clamped / 7);
  const stages = stagesForWeek('pregnancy', week);

  return {
    phase: 'pregnancy',
    week,
    dayOfWeek: clamped % 7,
    daysUntilDue,
    trimester: trimesterFor(week),
    stages,
    stage: stages['pelvic-floor'],
  };
}

export function trimesterFor(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

/** "Week 22 · 4 days" style summary for headers. */
export function describeProgress(progress: Progress): string {
  if (progress.phase === 'postpartum') {
    if (progress.week === 0) {
      const days = progress.dayOfWeek;
      return days === 0 ? 'Day one' : `${days + 1} days postpartum`;
    }
    return `${progress.week} ${progress.week === 1 ? 'week' : 'weeks'} postpartum`;
  }
  const dayPart =
    progress.dayOfWeek === 0
      ? ''
      : ` · ${progress.dayOfWeek} ${progress.dayOfWeek === 1 ? 'day' : 'days'}`;
  return `Week ${progress.week}${dayPart}`;
}

export function describeCountdown(progress: Progress): string | null {
  if (progress.phase === 'postpartum') return null;
  const { daysUntilDue } = progress;
  if (daysUntilDue > 1) return `${daysUntilDue} days to go`;
  if (daysUntilDue === 1) return 'One day to go';
  if (daysUntilDue === 0) return 'Due today';
  return `${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'day' : 'days'} past due`;
}

/** Validates a candidate due date. Returns an error message, or null if it's fine. */
export function validateDueDate(dueDate: Date, today: Date = now()): string | null {
  const days = daysBetween(startOfDay(today), startOfDay(dueDate));
  if (Number.isNaN(days)) return 'That date does not look right.';
  if (days > GESTATION_DAYS) {
    return 'That is more than 40 weeks away — check the year?';
  }
  if (days < -60) {
    return 'That is a while ago. If baby has arrived, add a birth date instead.';
  }
  return null;
}

/** Due date implied by a stated current gestational week, for the alternate entry path. */
export function dueDateFromWeek(week: number, days = 0, today: Date = now()): Date {
  const remaining = GESTATION_DAYS - (week * 7 + days);
  const due = startOfDay(today);
  due.setDate(due.getDate() + remaining);
  return due;
}

/** Phase label for headings. */
export function phaseLabel(phase: Phase): string {
  return phase === 'pregnancy' ? 'Pregnancy' : 'Postpartum';
}
