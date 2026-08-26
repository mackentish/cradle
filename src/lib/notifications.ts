import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { reminderCopy } from '@/content/reminders';
import type { ReminderSettings, Stage } from '@/domain/types';

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

export async function cancelReminders(): Promise<void> {
  try {
    // Reminders are the only thing this app ever schedules, so this is safe.
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nothing to clean up if the module is unavailable.
  }
}

/**
 * Makes the device match `settings`: cancels the old reminder and schedules a new
 * one when enabled. Idempotent, so it's safe to call on every launch.
 */
export async function syncReminders(
  settings: ReminderSettings,
  stage: Stage | null
): Promise<boolean> {
  await cancelReminders();
  if (!settings.enabled) return false;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return false;

    await ensureAndroidChannel();
    const copy = reminderCopy(stage);

    await Notifications.scheduleNotificationAsync({
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

/** Used by the reminders screen to show what is actually queued on the device. */
export async function countScheduled(): Promise<number> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length;
  } catch {
    return 0;
  }
}
