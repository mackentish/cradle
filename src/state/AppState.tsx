import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getProgress } from '@/domain/pregnancy';
import type { Profile, Progress, ReminderSettings, SessionLog } from '@/domain/types';
import { now } from '@/lib/clock';
import { toDayKey } from '@/lib/date';
import { syncReminders } from '@/lib/notifications';
import {
  clearAll,
  emptyProfile,
  loadLogs,
  loadProfile,
  saveLogs,
  saveProfile,
} from '@/lib/storage';
import { summarise, type StreakSummary } from '@/lib/streak';

type AppStateValue = {
  ready: boolean;
  profile: Profile;
  logs: SessionLog[];
  progress: Progress | null;
  stats: StreakSummary;
  onboarded: boolean;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  updateReminders: (patch: Partial<ReminderSettings>) => Promise<void>;
  logSession: (log: Omit<SessionLog, 'day' | 'completedAt'>) => Promise<void>;
  removeLog: (completedAt: string) => Promise<void>;
  replaceAll: (profile: Profile, logs: SessionLog[]) => Promise<void>;
  reset: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [logs, setLogs] = useState<SessionLog[]>([]);

  // Mirrors of the state, so writers can compute the next value synchronously
  // and persist exactly what they set (state updaters run too late for that).
  const profileRef = useRef(profile);
  const logsRef = useRef(logs);
  profileRef.current = profile;
  logsRef.current = logs;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedProfile, storedLogs] = await Promise.all([loadProfile(), loadLogs()]);
      if (cancelled) return;
      setProfile(storedProfile);
      setLogs(storedLogs);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const commitProfile = useCallback(async (next: Profile) => {
    profileRef.current = next;
    setProfile(next);
    await saveProfile(next);
  }, []);

  const commitLogs = useCallback(async (next: SessionLog[]) => {
    logsRef.current = next;
    setLogs(next);
    await saveLogs(next);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => commitProfile({ ...profileRef.current, ...patch }),
    [commitProfile]
  );

  const updateReminders = useCallback(
    (patch: Partial<ReminderSettings>) => {
      const current = profileRef.current;
      return commitProfile({ ...current, reminders: { ...current.reminders, ...patch } });
    },
    [commitProfile]
  );

  const logSession = useCallback(
    (log: Omit<SessionLog, 'day' | 'completedAt'>) => {
      const at = now();
      const entry: SessionLog = { ...log, day: toDayKey(at), completedAt: at.toISOString() };
      return commitLogs([...logsRef.current, entry]);
    },
    [commitLogs]
  );

  const removeLog = useCallback(
    (completedAt: string) =>
      commitLogs(logsRef.current.filter((log) => log.completedAt !== completedAt)),
    [commitLogs]
  );

  const replaceAll = useCallback(
    async (nextProfile: Profile, nextLogs: SessionLog[]) => {
      await Promise.all([commitProfile(nextProfile), commitLogs(nextLogs)]);
    },
    [commitProfile, commitLogs]
  );

  const reset = useCallback(async () => {
    profileRef.current = emptyProfile;
    logsRef.current = [];
    setProfile(emptyProfile);
    setLogs([]);
    await clearAll();
  }, []);

  const progress = useMemo(() => getProgress(profile), [profile]);

  // Keeps what the OS has scheduled in step with the saved settings and the
  // current stage, so the reminder wording follows the programme. Stage objects
  // are singletons from the programme table, so the identity check is stable.
  const { enabled, hour, minute } = profile.reminders;
  const stage = progress?.stage ?? null;
  useEffect(() => {
    if (!ready) return;
    void syncReminders({ enabled, hour, minute }, stage);
  }, [ready, enabled, hour, minute, stage]);

  const value = useMemo<AppStateValue>(
    () => ({
      ready,
      profile,
      logs,
      progress,
      stats: summarise(logs),
      onboarded: Boolean(progress) && Boolean(profile.acknowledgedDisclaimerAt),
      updateProfile,
      updateReminders,
      logSession,
      removeLog,
      replaceAll,
      reset,
    }),
    [
      ready,
      profile,
      logs,
      progress,
      updateProfile,
      updateReminders,
      logSession,
      removeLog,
      replaceAll,
      reset,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
