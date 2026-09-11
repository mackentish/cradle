import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { DueDateForm, Screen, Text } from '@/components';
import { toDayKey } from '@/lib/date';
import { useAppState } from '@/state/AppState';
import { spacing } from '@/theme';

export default function OnboardingDueDateScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAppState();

  const onContinue = async (dueDate: Date) => {
    await updateProfile({ dueDate: toDayKey(dueDate), birthDate: null });
    router.push('/onboarding/safety');
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="title">When is baby due?</Text>
        <Text variant="body">
          This is the only thing Cradle needs. Everything else — which exercises, how long, how hard
          — follows from it. You can change it later on the You tab.
        </Text>
      </View>

      <DueDateForm profile={profile} submitLabel="Continue" onSubmit={onContinue} />
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
