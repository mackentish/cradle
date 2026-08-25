import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Screen, Stepper, Text } from '@/components';
import { reminderCopy } from '@/content/reminders';
import { formatTime } from '@/lib/date';
import {
  countScheduled,
  getPermissionState,
  requestPermission,
  type PermissionState,
} from '@/lib/notifications';
import { useAppState } from '@/state/AppState';
import { colors, palette, spacing } from '@/theme';

const MINUTE_STEP = 5;

/**
 * One daily reminder, scheduled locally. The switch owns the permission dance;
 * AppState owns actually scheduling it, so this screen only ever saves settings.
 */
export default function RemindersScreen() {
  const router = useRouter();
  const { profile, progress, updateReminders } = useAppState();
  const { enabled, hour, minute } = profile.reminders;

  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [scheduled, setScheduled] = useState(0);
  const [busy, setBusy] = useState(false);

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
      await updateReminders({ enabled: false });
      return;
    }
    setBusy(true);
    try {
      const granted = await requestPermission();
      setPermission(granted ? 'granted' : 'denied');
      // Saving enabled: false on refusal keeps the switch honest — it shouldn't
      // read as on while the OS is dropping every notification.
      await updateReminders({ enabled: granted });
    } finally {
      setBusy(false);
    }
  };

  const shiftHour = (delta: number) =>
    updateReminders({ hour: (hour + delta + 24) % 24 });

  const shiftMinute = (delta: number) => {
    const total = hour * 60 + minute + delta * MINUTE_STEP;
    const wrapped = (total + 24 * 60) % (24 * 60);
    return updateReminders({ hour: Math.floor(wrapped / 60), minute: wrapped % 60 });
  };

  const copy = reminderCopy(progress?.stage ?? null);
  const blocked = enabled && permission !== 'granted';

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Text variant="smallStrong" color={colors.textFaint}>
            ‹ Back
          </Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text variant="title">Reminders</Text>
        <Text variant="body">
          One nudge a day, at a time you pick. It is scheduled on this phone by iOS or Android — no
          account, no server, and it works with the phone offline.
        </Text>
      </View>

      <Card>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text variant="subheading">Daily reminder</Text>
            <Text variant="small" color={colors.textFaint}>
              {enabled ? `Every day at ${formatTime(hour, minute)}` : 'Off'}
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
            <Text variant="hero" center>
              {formatTime(hour, minute)}
            </Text>
            <View style={styles.timeRow}>
              <Stepper
                label="Hour"
                size="compact"
                value={formatTime(hour, 0).replace(/:\d\d/, '')}
                onDecrement={() => shiftHour(-1)}
                onIncrement={() => shiftHour(1)}
                decrementLabel="An hour earlier"
                incrementLabel="An hour later"
              />
              <Stepper
                label="Minute"
                size="compact"
                value={`${minute}`.padStart(2, '0')}
                onDecrement={() => shiftMinute(-1)}
                onIncrement={() => shiftMinute(1)}
                decrementLabel="Five minutes earlier"
                incrementLabel="Five minutes later"
              />
            </View>
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
        {scheduled > 0
          ? 'Scheduled on this device.'
          : 'Nothing scheduled — the reminder is off.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
  },
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
  timeRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    marginTop: spacing.xs,
  },
});
