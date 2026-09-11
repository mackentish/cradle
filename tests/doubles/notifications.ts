import type { ProgramId } from '@/domain/types';

/**
 * A stateful stand-in for expo-notifications. It keeps a real list so tests can
 * assert that enabling a reminder schedules exactly one, with the right trigger
 * and — now that there are three programs — under the right identifier.
 */
export type ScheduledNotification = {
  identifier: string;
  content: { title?: string; body?: string; sound?: boolean; data?: Record<string, unknown> };
  trigger: { type?: string; hour?: number; minute?: number; channelId?: string };
};

/** The shape expo-notifications hands back for an interaction. */
export type NotificationResponse = {
  actionIdentifier: string;
  notification: {
    date: number;
    request: { identifier: string; content: ScheduledNotification['content'] };
  };
};

export const DEFAULT_ACTION_IDENTIFIER = 'expo.modules.notifications.actions.DEFAULT';

let deliveries = 0;

export const notificationDouble = {
  permission: 'granted' as 'granted' | 'denied' | 'undetermined',
  scheduled: [] as ScheduledNotification[],

  /** What the OS is holding, the way `getLastNotificationResponse` reports it. */
  lastResponse: null as NotificationResponse | null,
  listeners: [] as ((response: NotificationResponse) => void)[],

  /** The one reminder for a program, if it's scheduled. */
  forProgram(programId: ProgramId): ScheduledNotification | undefined {
    return this.scheduled.find((item) => item.identifier === `cradle-reminder-${programId}`);
  },

  /**
   * One delivery of a program's reminder, as the OS would describe it. Takes the
   * content from what is actually scheduled, so a test can't tap a notification
   * the app never sent.
   */
  delivery(programId: ProgramId): NotificationResponse {
    const scheduled = this.forProgram(programId);
    deliveries += 1;
    return {
      actionIdentifier: DEFAULT_ACTION_IDENTIFIER,
      notification: {
        // Distinct per delivery, which is what tells today's tap from tomorrow's.
        date: deliveries,
        request: {
          identifier: `cradle-reminder-${programId}`,
          content: scheduled?.content ?? { data: { programId } },
        },
      },
    };
  },

  /** The app was already running, or backgrounded: only the listeners hear it. */
  tap(programId: ProgramId): NotificationResponse {
    const response = this.delivery(programId);
    this.lastResponse = response;
    this.listeners.forEach((listener) => listener(response));
    return response;
  },

  /**
   * The tap that launched the app. Native holds the response before any listener
   * exists, so this only sets what a synchronous read will find.
   */
  launchedBy(programId: ProgramId): NotificationResponse {
    this.lastResponse = this.delivery(programId);
    return this.lastResponse;
  },

  reset() {
    this.permission = 'granted';
    this.scheduled = [];
    this.lastResponse = null;
    this.listeners = [];
    deliveries = 0;
  },
};
