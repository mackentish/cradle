import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, CradleMark, Screen, Text } from '@/components';
import { colors, spacing } from '@/theme';

const POINTS = [
  {
    title: 'Built around your week',
    body: 'Tell Cradle your due date once. The programme moves with you, week by week, and shifts toward birth prep as you get closer.',
  },
  {
    title: 'Squeeze and release',
    body: 'A pelvic floor that can let go matters as much as one that can lift. Both are trained here — and the balance changes over time.',
  },
  {
    title: 'Yours alone',
    body: 'No account, no sign-up, nothing leaves your phone. Cradle works offline because everything lives on your device.',
  },
];

export default function Welcome() {
  const router = useRouter();

  return (
    <Screen contentStyle={styles.content} topInset={spacing.xl}>
      <View style={styles.hero}>
        <CradleMark size={92} />
        <Text variant="hero" center>
          Cradle
        </Text>
        <Text variant="body" center>
          Pelvic floor care that keeps pace with your pregnancy.
        </Text>
      </View>

      <View style={styles.points}>
        {POINTS.map((point) => (
          <View key={point.title} style={styles.point}>
            <View style={styles.bullet} />
            <View style={styles.pointText}>
              <Text variant="subheading">{point.title}</Text>
              <Text variant="small">{point.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button label="Let's begin" onPress={() => router.push('/onboarding/due-date')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  points: {
    gap: spacing.xl,
  },
  point: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primarySoftBorder,
    marginTop: 7,
  },
  pointText: {
    flex: 1,
    gap: 4,
  },
});
