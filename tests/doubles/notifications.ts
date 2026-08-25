/**
 * A stateful stand-in for expo-notifications. It keeps a real list so tests can
 * assert that enabling a reminder schedules exactly one, with the right trigger.
 */
export type ScheduledNotification = {
  identifier: string;
  content: { title?: string; body?: string; sound?: boolean };
  trigger: { type?: string; hour?: number; minute?: number };
};

export const notificationDouble = {
  permission: 'granted' as 'granted' | 'denied' | 'undetermined',
  scheduled: [] as ScheduledNotification[],

  reset() {
    this.permission = 'granted';
    this.scheduled = [];
  },
};
