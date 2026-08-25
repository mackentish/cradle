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
import type { Profile, Progress, SessionLog } from '@/domain/types';
import { toDayKey } from '@/lib/date';
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

  const logSession = useCallback(
    (log: Omit<SessionLog, 'day' | 'completedAt'>) => {
      const now = new Date();
      const entry: SessionLog = { ...log, day: toDayKey(now), completedAt: now.toISOString() };
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

  const value = useMemo<AppStateValue>(() => {
    const progress = getProgress(profile);
    return {
      ready,
      profile,
      logs,
      progress,
      stats: summarise(logs),
      onboarded: Boolean(progress) && Boolean(profile.acknowledgedDisclaimerAt),
      updateProfile,
      logSession,
      removeLog,
      replaceAll,
      reset,
    };
  }, [ready, profile, logs, updateProfile, logSession, removeLog, replaceAll, reset]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
