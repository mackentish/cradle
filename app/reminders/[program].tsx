import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StyleSheet, Switch, View } from 'react-native';

import { BackLink, Button, Card, Screen, Text, TimePicker } from '@/components';
import { reminderCopy } from '@/content/reminders';
import { isProgramId, programsById, programTitle } from '@/domain/program';
import type { ProgramId } from '@/domain/types';
import { formatTime } from '@/lib/date';
import {
  countScheduled,
  getPermissionState,
  requestPermission,
  type PermissionState,
} from '@/lib/notifications';
import { useAppState } from '@/state/AppState';
import { colors, palette, spacing } from '@/theme';

/** How long the picker must be still before the new time is saved. */
const COMMIT_DELAY_MS = 350;

/**
 * One program's daily reminder, scheduled locally. The switch owns the permission
 * dance; AppState owns actually scheduling it, so this screen only ever saves
 * settings.
 *
 * One program per screen rather than all three on a list, because both native
 * `@expo/ui` pickers are uncontrolled — they read their value once on mount — so
 * keeping exactly one wheel alive at a time avoids three of them fighting.
 */
export default function RemindersScreen() {
  const { profile, progress, updateReminders } = useAppState();
  const { program } = useLocalSearchParams<{ program: string }>();

  // From outside the type system, so validated rather than asserted.
  const programId: ProgramId = isProgramId(program) ? program : 'pelvic-floor';
  const { enabled, hour, minute } = profile.reminders[programId];
  const title = programTitle(programsById[programId], progress?.phase ?? 'pregnancy');

  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [scheduled, setScheduled] = useState(0);
  const [busy, setBusy] = useState(false);
  // A spinning wheel fires continuously, and each save would otherwise mean an
  // AsyncStorage write plus a cancel-and-reschedule against the OS.
  const [draft, setDraft] = useState<{ hour: number; minute: number } | null>(null);
  const shown = draft ?? { hour, minute };

  const refresh = useCallback(async () => {
    setPermission(await getPermissionState());
    setScheduled(await countScheduled());
  }, []);

  useEffect(() => {
    void refresh();
    // AppState reschedules in its own effect, so check again once that lands —
    // otherwise the status line can read "nothing scheduled" for a frame.
    const settle = setTimeout(() => void refresh(), 500);
    return () => clearTimeout(settle);
  }, [refresh, enabled, hour, minute]);

  const toggle = async (next: boolean) => {
    if (!next) {
      await updateReminders(programId, { enabled: false });
      return;
    }
    setBusy(true);
    try {
      const granted = await requestPermission();
      setPermission(granted ? 'granted' : 'denied');
      // Saving enabled: false on refusal keeps the switch honest — it shouldn't
      // read as on while the OS is dropping every notification.
      await updateReminders(programId, { enabled: granted });
    } finally {
      setBusy(false);
    }
  };

  // Commits the draft once the picker settles, then hands control back to the store.
  useEffect(() => {
    if (!draft) return;
    if (draft.hour === hour && draft.minute === minute) {
      setDraft(null);
      return;
    }
    const commit = setTimeout(() => void updateReminders(programId, draft), COMMIT_DELAY_MS);
    return () => clearTimeout(commit);
  }, [draft, hour, minute, programId, updateReminders]);

  const copy = reminderCopy(programId, progress?.stages[programId] ?? null);
  const blocked = enabled && permission !== 'granted';

  return (
    <Screen testID={`reminders-screen-${programId}`}>
      <BackLink />

      <View style={styles.header}>
        <Text variant="label">Reminders</Text>
        <Text variant="title">{title}</Text>
        <Text variant="body">
          One nudge a day for this program, at a time you pick. It is scheduled on this phone by iOS
          or Android — no account, no server, and it works with the phone offline.
        </Text>
      </View>

      <Card>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text variant="subheading">Daily reminder</Text>
            <Text variant="small" color={colors.textFaint}>
              {enabled ? `Every day at ${formatTime(shown.hour, shown.minute)}` : 'Off'}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggle}
            disabled={busy}
            trackColor={{ false: palette.blush100, true: colors.primary }}
            thumbColor={palette.white}
            ios_backgroundColor={palette.blush100}
            accessibilityLabel="Daily reminder"
          />
        </View>
      </Card>

      {blocked ? (
        <Card tint={colors.primarySoft}>
          <Text variant="smallStrong">Notifications are turned off for Cradle</Text>
          <Text variant="small">
            The reminder is saved, but your phone will not show it until you allow notifications in
            system settings.
          </Text>
          <Button
            label="Open settings"
            variant="secondary"
            onPress={() => Linking.openSettings()}
          />
        </Card>
      ) : null}

      {enabled ? (
        <>
          <Card>
            <Text variant="label">Time</Text>
            <TimePicker
              hour={shown.hour}
              minute={shown.minute}
              onChange={(nextHour, nextMinute) =>
                setDraft({ hour: nextHour, minute: nextMinute })
              }
            />
          </Card>

          <Card tint={colors.surfaceSunken}>
            <Text variant="label">What you will see</Text>
            <Text variant="bodyStrong">{copy.title}</Text>
            <Text variant="small">{copy.body}</Text>
            <Text variant="small" color={colors.textFaint}>
              The wording follows your stage, so it changes as your pregnancy moves on.
            </Text>
          </Card>
        </>
      ) : null}

      <Text variant="small" color={colors.textFaint} center>
        {statusNote(blocked, enabled, scheduled)}
      </Text>
    </Screen>
  );
}

/**
 * The footnote. `scheduled` counts every Cradle reminder the OS is holding, not
 * just this program's, so it reads as a check on the whole set.
 */
function statusNote(blocked: boolean, enabled: boolean, scheduled: number): string {
  if (blocked) return 'Saved, but your phone will not deliver it yet.';
  if (enabled) return `${scheduled} of 3 reminders scheduled on this device.`;
  return 'Nothing scheduled for this program.';
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  switchText: {
    flex: 1,
    gap: 2,
  },
});
