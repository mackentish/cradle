import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { reminderCopy } from '@/content/reminders';
import { PROGRAM_IDS } from '@/domain/program';
import type { ProgramId, ReminderSettings, Stage } from '@/domain/types';

/**
 * Reminders are local notifications scheduled on the device — no server, no push
 * token, nothing leaving the phone. A single DAILY trigger repeats forever until
 * it's canceled, so there is nothing to keep alive in the background.
 *
 * Every call is wrapped: notifications are the one part of the app that can fail
 * for reasons outside it (permissions revoked in Settings, an unsupported
 * platform), and none of those should ever take a screen down.
 */

const ANDROID_CHANNEL_ID = 'cradle-reminders';

/**
 * One stable identifier per program, so each reminder can be replaced without
 * touching the other two. Never change these strings: they are how we find a
 * reminder the *previous* install scheduled.
 */
const REMINDER_IDS: Record<ProgramId, string> = {
  'pelvic-floor': 'cradle-reminder-pelvic-floor',
  core: 'cradle-reminder-core',
  'birth-prep': 'cradle-reminder-birth-prep',
};

const KNOWN_IDS: ReadonlySet<string> = new Set(Object.values(REMINDER_IDS));

/** Called once from the root layout. Decides how a notification behaves in-app. */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export async function getPermissionState(): Promise<PermissionState> {
  try {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    // iOS only lets you ask once; after that "denied" means Settings is the only route.
    return status === 'undetermined' || canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'denied';
  }
}

/** Asks only if we haven't been refused already. Returns whether we ended up allowed. */
export async function requestPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return true;
    if (!current.canAskAgain) return false;
    const next = await Notifications.requestPermissionsAsync();
    return next.status === 'granted';
  } catch {
    return false;
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 200],
    lightColor: '#C9787F',
  });
}

async function cancelById(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Nothing to cancel, or the module is unavailable. Either way, done.
  }
}

/** Cancels all three reminders. Used on reset. */
export async function cancelReminders(): Promise<void> {
  await Promise.all(PROGRAM_IDS.map((id) => cancelById(REMINDER_IDS[id])));
}

/**
 * Before there were three programs, the single reminder was scheduled without an
 * identifier, so the OS assigned it a random one and nothing here can name it.
 * On an upgraded install it would sit alongside the new pelvic floor reminder and
 * fire twice a day, forever, with no way to switch it off from inside the app.
 *
 * So: anything scheduled that isn't one of ours is from an older build, and goes.
 */
async function cancelUnknown(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const strays = scheduled.filter((item) => !KNOWN_IDS.has(item.identifier));
    await Promise.all(strays.map((item) => cancelById(item.identifier)));
  } catch {
    // If we can't read the queue we can't clean it. Harmless either way.
  }
}

async function syncOne(
  programId: ProgramId,
  settings: ReminderSettings,
  stage: Stage | null
): Promise<boolean> {
  await cancelById(REMINDER_IDS[programId]);
  if (!settings.enabled) return false;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return false;

    await ensureAndroidChannel();
    const copy = reminderCopy(programId, stage);

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_IDS[programId],
      content: {
        title: copy.title,
        body: copy.body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: settings.hour,
        minute: settings.minute,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Makes the device match `settings` for all three programs: replaces each
 * program's reminder independently, leaving the other two alone. Idempotent, so
 * it's safe to call on every launch — which is what keeps the wording in step
 * with the stage she has moved into.
 */
export async function syncReminders(
  settings: Record<ProgramId, ReminderSettings>,
  stages: Record<ProgramId, Stage> | null
): Promise<Record<ProgramId, boolean>> {
  await cancelUnknown();

  const results = await Promise.all(
    PROGRAM_IDS.map(async (id) => {
      const scheduled = await syncOne(id, settings[id], stages?.[id] ?? null);
      return [id, scheduled] as const;
    })
  );

  return Object.fromEntries(results) as Record<ProgramId, boolean>;
}

/**
 * Used by the reminders screen to show what is actually queued on the device.
 * Counts only our own, so a stray from an older build can't inflate it.
 */
export async function countScheduled(): Promise<number> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.filter((item) => KNOWN_IDS.has(item.identifier)).length;
  } catch {
    return 0;
  }
}
