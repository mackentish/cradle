import React from 'react';
import { StyleSheet, View } from 'react-native';

import { DueDateForm, Screen, Text } from '@/components';
import { useDismiss } from '@/hooks/useDismiss';
import { toDayKey } from '@/lib/date';
import { useAppState } from '@/state/AppState';
import { colors, spacing } from '@/theme';

/**
 * Changing the due date after onboarding. A separate route from the onboarding
 * one because that whole group stops existing once she is through it — and
 * because saving here must leave the birth date alone, where onboarding sets a
 * due date to start a pregnancy from scratch.
 */
export default function DueDateScreen() {
  const { profile, updateProfile } = useAppState();
  const dismiss = useDismiss('/(tabs)/you');

  const save = async (dueDate: Date) => {
    await updateProfile({ dueDate: toDayKey(dueDate) });
    dismiss();
  };

  return (
    <Screen contentStyle={styles.content} testID="due-date-screen">
      <View style={styles.header}>
        <Text variant="title">Your due date</Text>
        <Text variant="body">
          If the date moved at a scan, change it here — every program re-dates itself to match.
        </Text>
      </View>

      <DueDateForm profile={profile} submitLabel="Save" onSubmit={save} onCancel={dismiss} />

      {profile.birthDate ? (
        <Text variant="small" color={colors.textFaint}>
          Baby is here, so your sessions follow the birth date. Changing this won't move them.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
});
