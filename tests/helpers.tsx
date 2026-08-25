import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Profile, SessionLog } from '@/domain/types';
import { now } from '@/lib/clock';
import { addDays, toDayKey } from '@/lib/date';
import { emptyProfile } from '@/lib/storage';

const PROFILE_KEY = 'cradle.profile.v1';
const LOGS_KEY = 'cradle.logs.v1';

/**
 * Dates are always expressed relative to "now" so the suite does not rot: a due
 * date 140 days out is week 20 whenever the tests happen to run.
 */
export const GESTATION_DAYS = 280;

export function dueDateForWeek(week: number): string {
  return toDayKey(addDays(now(), GESTATION_DAYS - week * 7));
}

export function daysAgo(days: number): string {
  return toDayKey(addDays(now(), -days));
}

export type SeedOptions = {
  profile?: Partial<Profile>;
  logs?: SessionLog[];
};

/** Puts a profile and history on disk before the app boots. */
export async function seed({ profile = {}, logs = [] }: SeedOptions = {}): Promise<void> {
  const merged: Profile = {
    ...emptyProfile,
    dueDate: dueDateForWeek(20),
    acknowledgedDisclaimerAt: now().toISOString(),
    ...profile,
  };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

/** A profile that has not been through onboarding yet. */
export async function seedNothing(): Promise<void> {
  await AsyncStorage.clear();
}

export function sessionLog(overrides: Partial<SessionLog> = {}): SessionLog {
  const day = overrides.day ?? daysAgo(1);
  return {
    day,
    completedAt: `${day}T09:00:00.000Z`,
    stageId: 'build',
    sessionId: 'build-a',
    week: 20,
    phase: 'pregnancy',
    seconds: 300,
    ...overrides,
  };
}
