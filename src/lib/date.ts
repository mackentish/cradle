/** Local-calendar date helpers. Everything user-facing is local, never UTC. */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD for a Date, in the device's local timezone. */
export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses YYYY-MM-DD as local midnight (not UTC, which would shift the day). */
export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Whole days from `from` to `to`, ignoring time of day. */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

/** Stable day index used to rotate session variants. */
export function dayIndex(date: Date): number {
  return Math.floor(startOfDay(date).getTime() / MS_PER_DAY);
}

export function formatDayKey(key: string): string {
  return fromDayKey(key).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "9:00 AM" — respects the device's 12/24-hour preference. */
export function formatTime(hour: number, minute: number): string {
  return dateAtTime(hour, minute).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Today at the given wall-clock time. Native pickers take a Date, not h/m. */
export function dateAtTime(hour: number, minute: number, base: Date = new Date()): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, minute, 0, 0);
}

/**
 * Whether this locale uses a 24-hour clock. Android's picker defaults to 24h
 * regardless of locale, so it has to be told.
 */
export function prefers24Hour(): boolean {
  const formatted = dateAtTime(13, 0).toLocaleTimeString(undefined, { hour: 'numeric' });
  return !/[ap]\.?\s?m\.?/i.test(formatted);
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes}m ${seconds}s`;
}
