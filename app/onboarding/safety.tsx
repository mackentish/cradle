import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components';
import { RED_FLAGS, SAFETY_INTRO, STOP_RULES } from '@/content/safety';
import { now } from '@/lib/clock';
import { useAppState } from '@/state/AppState';
import { colors, spacing } from '@/theme';

export default function SafetyScreen() {
  const router = useRouter();
  const { updateProfile } = useAppState();

  const accept = async () => {
    await updateProfile({ acknowledgedDisclaimerAt: now().toISOString() });
    router.replace('/(tabs)');
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="title">Before you start</Text>
        <Text variant="body">{SAFETY_INTRO}</Text>
      </View>

      <Card tint={colors.surfaceSunken}>
        <Text variant="subheading">Stop and check in with your provider if you notice</Text>
        <View style={styles.list}>
          {RED_FLAGS.map((flag) => (
            <View key={flag} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text variant="small" style={styles.listText}>
                {flag}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="subheading">Rules for every session</Text>
        <View style={styles.list}>
          {STOP_RULES.map((rule) => (
            <View key={rule.title} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
              <View style={styles.listText}>
                <Text variant="smallStrong">{rule.title}</Text>
                <Text variant="small">{rule.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Button label="I understand" onPress={accept} />
      <Text variant="small" color={colors.textFaint} center>
        Cradle is a wellness app, not medical advice, and it does not replace care from your midwife,
        doctor or pelvic floor physical therapist.
      </Text>
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
  list: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  listText: {
    flex: 1,
    gap: 2,
  },
});
