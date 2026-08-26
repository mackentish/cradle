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
import { PROGRAM_IDS } from '@/domain/program';
import type { Profile, Progress, ProgramId, ReminderSettings, SessionLog } from '@/domain/types';
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
import { summarize, type StreakSummary } from '@/lib/streak';

type AppStateValue = {
  ready: boolean;
  profile: Profile;
  logs: SessionLog[];
  progress: Progress | null;
  stats: StreakSummary;
  onboarded: boolean;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  updateReminders: (programId: ProgramId, patch: Partial<ReminderSettings>) => Promise<void>;
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
    let canceled = false;
    (async () => {
      const [storedProfile, storedLogs] = await Promise.all([loadProfile(), loadLogs()]);
      if (canceled) return;
      setProfile(storedProfile);
      setLogs(storedLogs);
      setReady(true);
    })();
    return () => {
      canceled = true;
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
    (programId: ProgramId, patch: Partial<ReminderSettings>) => {
      const current = profileRef.current;
      return commitProfile({
        ...current,
        reminders: {
          ...current.reminders,
          [programId]: { ...current.reminders[programId], ...patch },
        },
      });
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
  // current stage, so the reminder wording follows the program.
  //
  // These deps are string keys rather than the objects themselves: `getProgress`
  // builds a fresh `stages` record every time it runs, so depending on its
  // identity would reschedule all three notifications on any profile edit at all
  // — including one that has nothing to do with reminders, like her name.
  const reminderKey = JSON.stringify(profile.reminders);
  const stageKey = progress ? PROGRAM_IDS.map((id) => progress.stages[id].id).join('|') : '';
  const stagesRef = useRef(progress?.stages ?? null);
  stagesRef.current = progress?.stages ?? null;
  useEffect(() => {
    if (!ready) return;
    void syncReminders(profileRef.current.reminders, stagesRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by value, read by ref
  }, [ready, reminderKey, stageKey]);

  const value = useMemo<AppStateValue>(
    () => ({
      ready,
      profile,
      logs,
      progress,
      stats: summarize(logs),
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
