import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Profile, SessionLog } from '@/domain/types';

/**
 * Everything lives on the device. Keys are versioned so a future shape change
 * can migrate rather than clobber.
 */
const PROFILE_KEY = 'cradle.profile.v1';
const LOGS_KEY = 'cradle.logs.v1';

export const emptyProfile: Profile = {
  dueDate: null,
  birthDate: null,
  name: null,
  acknowledgedDisclaimerAt: null,
  reminders: { enabled: false, hour: 9, minute: 0 },
};

export async function loadProfile(): Promise<Profile> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return emptyProfile;
  try {
    return { ...emptyProfile, ...(JSON.parse(raw) as Partial<Profile>) };
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
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SessionLog[]) : [];
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
    exportedAt: new Date().toISOString(),
    profile,
    logs,
  };
}

export function parseBackup(raw: string): Backup {
  const parsed = JSON.parse(raw);
  if (parsed?.app !== 'cradle' || parsed?.version !== 1) {
    throw new Error('That does not look like a Cradle backup.');
  }
  return {
    app: 'cradle',
    version: 1,
    exportedAt: String(parsed.exportedAt ?? ''),
    profile: { ...emptyProfile, ...parsed.profile },
    logs: Array.isArray(parsed.logs) ? parsed.logs : [],
  };
}
