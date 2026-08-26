import type { ProgramId } from '@/domain/types';

/**
 * A stateful stand-in for expo-notifications. It keeps a real list so tests can
 * assert that enabling a reminder schedules exactly one, with the right trigger
 * and — now that there are three programs — under the right identifier.
 */
export type ScheduledNotification = {
  identifier: string;
  content: { title?: string; body?: string; sound?: boolean };
  trigger: { type?: string; hour?: number; minute?: number; channelId?: string };
};

export const notificationDouble = {
  permission: 'granted' as 'granted' | 'denied' | 'undetermined',
  scheduled: [] as ScheduledNotification[],

  /** The one reminder for a program, if it's scheduled. */
  forProgram(programId: ProgramId): ScheduledNotification | undefined {
    return this.scheduled.find((item) => item.identifier === `cradle-reminder-${programId}`);
  },

  reset() {
    this.permission = 'granted';
    this.scheduled = [];
  },
};
