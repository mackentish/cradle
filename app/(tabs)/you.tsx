import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, Share, StyleSheet, View } from 'react-native';

import { Card, Pill, Screen, Text } from '@/components';
import { PT_NOTE, RED_FLAGS, SAFETY_INTRO } from '@/content/safety';
import { describeProgress } from '@/domain/pregnancy';
import { formatLongDate, fromDayKey } from '@/lib/date';
import { buildBackup } from '@/lib/storage';
import { useAppState } from '@/state/AppState';
import { colors, radius, spacing } from '@/theme';

export default function YouScreen() {
  const router = useRouter();
  const { profile, progress, logs, stats, reset } = useAppState();

  const exportData = async () => {
    try {
      await Share.share({
        title: 'Cradle backup',
        message: JSON.stringify(buildBackup(profile, logs), null, 2),
      });
    } catch {
      Alert.alert('Could not share', 'Something went wrong preparing the backup.');
    }
  };

  const confirmReset = () => {
    Alert.alert(
      'Start over?',
      'This erases your due date and every logged session from this phone. It cannot be undone.',
      [
        { text: 'Keep my data', style: 'cancel' },
        {
          text: 'Erase everything',
          style: 'destructive',
          onPress: async () => {
            await reset();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label">You</Text>
        <Text variant="hero">{progress ? describeProgress(progress) : 'Your details'}</Text>
      </View>

      <Card>
        <Text variant="label">Dates</Text>
        <Row
          label="Due date"
          value={profile.dueDate ? formatLongDate(fromDayKey(profile.dueDate)) : 'Not set'}
          onPress={() => router.push('/onboarding/due-date')}
        />
        <Row
          label={profile.birthDate ? 'Birth date' : 'Baby has arrived'}
          value={profile.birthDate ? formatLongDate(fromDayKey(profile.birthDate)) : 'Add'}
          onPress={() => router.push('/birth-date')}
        />
        {profile.birthDate ? (
          <Pill label="Postpartum programme" tint={colors.accentSoft} ink={colors.accent} />
        ) : null}
      </Card>

      <Card>
        <Text variant="label">Your data</Text>
        <Text variant="small">
          Cradle has no account and no server. Everything is stored on this phone, which also means
          deleting the app deletes your history — export a backup if you want to keep it.
        </Text>
        <Row label="Export a backup" value={`${logs.length} sessions`} onPress={exportData} />
        <Row label="Restore from a backup" value="Paste" onPress={() => router.push('/restore')} />
        <Row label="Start over" value="Erase" onPress={confirmReset} destructive />
      </Card>

      <Card tint={colors.surfaceSunken}>
        <Text variant="label">Safety</Text>
        <Text variant="small">{SAFETY_INTRO}</Text>
        <Text variant="smallStrong">Stop and check in if you notice</Text>
        <View style={styles.list}>
          {RED_FLAGS.map((flag) => (
            <Text key={flag} variant="small">
              · {flag}
            </Text>
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="label">See someone</Text>
        <Text variant="small">{PT_NOTE}</Text>
      </Card>

      <Text variant="small" color={colors.textFaint} center>
        {stats.totalSessions} sessions since you started. Cradle is a wellness app, not medical
        advice.
      </Text>
    </Screen>
  );
}

function Row({
  label,
  value,
  onPress,
  destructive,
}: {
  label: string;
  value: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityRole="button">
      <Text variant="bodyStrong" color={destructive ? colors.primaryPressed : colors.text}>
        {label}
      </Text>
      <View style={styles.rowValue}>
        <Text variant="small" color={colors.textFaint}>
          {value}
        </Text>
        <Text variant="small" color={colors.textFaint}>
          ›
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  list: {
    gap: 2,
  },
});
