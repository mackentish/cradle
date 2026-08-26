import AsyncStorage from '@react-native-async-storage/async-storage';

import { isProgramId, isStageId } from '@/domain/program';
import type { Phase, Profile, ProgramId, ReminderSettings, SessionLog } from '@/domain/types';

import { now } from './clock';
import { isDayKey } from './date';

/**
 * Everything lives on the device. Keys are versioned so a future shape change
 * can migrate rather than clobber.
 */
const PROFILE_KEY = 'cradle.profile.v1';
const LOGS_KEY = 'cradle.logs.v1';

/** Sanity ceilings for a restored log — a decade of weeks, a day of seconds. */
const MAX_LOGGED_WEEK = 520;
const MAX_LOGGED_SECONDS = 24 * 60 * 60;

/**
 * Default reminder times, staggered on purpose: three reminders all set to 9am
 * would arrive as one buzz she learns to swipe away.
 */
const REMINDER_DEFAULTS: Record<ProgramId, ReminderSettings> = {
  'pelvic-floor': { enabled: false, hour: 9, minute: 0 },
  core: { enabled: false, hour: 17, minute: 0 },
  'birth-prep': { enabled: false, hour: 20, minute: 0 },
};

function defaultReminders(): Record<ProgramId, ReminderSettings> {
  // Fresh objects: a shallow spread of REMINDER_DEFAULTS would share the nested
  // settings with it, and with every profile built from it.
  return {
    'pelvic-floor': { ...REMINDER_DEFAULTS['pelvic-floor'] },
    core: { ...REMINDER_DEFAULTS.core },
    'birth-prep': { ...REMINDER_DEFAULTS['birth-prep'] },
  };
}

export const emptyProfile: Profile = {
  dueDate: null,
  birthDate: null,
  name: null,
  acknowledgedDisclaimerAt: null,
  reminders: defaultReminders(),
};

/**
 * Everything below coerces rather than trusts. A profile can arrive from a
 * pasted backup, so a field of the wrong shape is a thing a user can actually
 * produce — and a bad one used to be fatal twice over: the provider reads
 * `profile.reminders` on every render, and `replaceAll` writes to disk before
 * that render happens, so a single bad paste crashed the app on every launch
 * from then on, with reinstalling (and losing all history) the only way out.
 */
function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function nullableDayKey(value: unknown): string | null {
  return isDayKey(value) ? value : null;
}

function boundedInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), min), max);
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toReminders(value: unknown, fallback: ReminderSettings): ReminderSettings {
  const raw = asRecord(value);
  return {
    enabled: raw.enabled === true,
    hour: boundedInt(raw.hour, 0, 23, fallback.hour),
    minute: boundedInt(raw.minute, 0, 59, fallback.minute),
  };
}

/**
 * Reminders used to be a single flat `{ enabled, hour, minute }` — one program,
 * one reminder. Recognize that shape and keep her existing reminder on the pelvic
 * floor program rather than silently switching it off, which is what reading the
 * new keys off an old profile would do.
 *
 * The new keys can't collide with the old ones, so the sniff is unambiguous.
 */
function toReminderMap(value: unknown): Record<ProgramId, ReminderSettings> {
  const raw = asRecord(value);
  const isLegacy = 'enabled' in raw || 'hour' in raw || 'minute' in raw;
  const legacy = isLegacy ? toReminders(raw, REMINDER_DEFAULTS['pelvic-floor']) : null;

  if (legacy) return { ...defaultReminders(), 'pelvic-floor': legacy };

  return {
    'pelvic-floor': toReminders(raw['pelvic-floor'], REMINDER_DEFAULTS['pelvic-floor']),
    core: toReminders(raw.core, REMINDER_DEFAULTS.core),
    'birth-prep': toReminders(raw['birth-prep'], REMINDER_DEFAULTS['birth-prep']),
  };
}

export function toProfile(value: unknown): Profile {
  const raw = asRecord(value);
  return {
    dueDate: nullableDayKey(raw.dueDate),
    birthDate: nullableDayKey(raw.birthDate),
    name: nullableString(raw.name),
    acknowledgedDisclaimerAt: nullableString(raw.acknowledgedDisclaimerAt),
    reminders: toReminderMap(raw.reminders),
  };
}

/**
 * Drops entries that aren't usable rather than repairing them — a log with no
 * real day can't be placed on the calendar, and inventing one would misreport
 * her history back to her.
 */
export function toLogs(value: unknown): SessionLog[] {
  if (!Array.isArray(value)) return [];
  const logs: SessionLog[] = [];
  for (const entry of value) {
    const raw = asRecord(entry);
    // A log with no real day can't be placed on the calendar, and an unknown
    // stage can't be named on the history list.
    if (!isDayKey(raw.day)) continue;
    if (typeof raw.completedAt !== 'string' || !isStageId(raw.stageId)) continue;
    const phase: Phase = raw.phase === 'postpartum' ? 'postpartum' : 'pregnancy';
    logs.push({
      day: raw.day,
      completedAt: raw.completedAt,
      // Every log written before the app had more than one program was a pelvic
      // floor session, so default rather than drop — this is real history.
      programId: isProgramId(raw.programId) ? raw.programId : 'pelvic-floor',
      stageId: raw.stageId,
      sessionId: typeof raw.sessionId === 'string' ? raw.sessionId : '',
      week: boundedInt(raw.week, 0, MAX_LOGGED_WEEK, 0),
      phase,
      seconds: boundedInt(raw.seconds, 0, MAX_LOGGED_SECONDS, 0),
    });
  }
  return logs;
}

export async function loadProfile(): Promise<Profile> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return emptyProfile;
  try {
    return toProfile(JSON.parse(raw));
  } catch {
    return emptyProfile;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadLogs(): Promise<SessionLog[]> {
  const raw = await AsyncStorage.getItem(LOGS_KEY);
  if (!raw) return [];
  try {
    return toLogs(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function saveLogs(logs: SessionLog[]): Promise<void> {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([PROFILE_KEY, LOGS_KEY]);
}

export type Backup = {
  app: 'cradle';
  version: 1;
  exportedAt: string;
  profile: Profile;
  logs: SessionLog[];
};

/** There's no server, so an export is the only way to move devices. */
export function buildBackup(profile: Profile, logs: SessionLog[]): Backup {
  return {
    app: 'cradle',
    version: 1,
    exportedAt: now().toISOString(),
    profile,
    logs,
  };
}

export function parseBackup(raw: string): Backup {
  const parsed = asRecord(JSON.parse(raw));
  if (parsed.app !== 'cradle' || parsed.version !== 1) {
    throw new Error('That does not look like a Cradle backup.');
  }
  return {
    app: 'cradle',
    version: 1,
    exportedAt: nullableString(parsed.exportedAt) ?? '',
    profile: toProfile(parsed.profile),
    logs: toLogs(parsed.logs),
  };
}
