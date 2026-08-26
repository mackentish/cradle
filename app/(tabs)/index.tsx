import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, DayDots, Pill, Screen, Text } from '@/components';
import { getExercise, kindLabels } from '@/domain/exercises';
import { describeCountdown, describeProgress } from '@/domain/pregnancy';
import { describeStep, sessionForDay, sessionSeconds } from '@/domain/session';
import type { Progress } from '@/domain/types';
import { now } from '@/lib/clock';
import { formatDuration } from '@/lib/date';
import { recentDays } from '@/lib/streak';
import { useAppState } from '@/state/AppState';
import { colors, radius, spacing, stageColors } from '@/theme';

export default function TodayScreen() {
  const { ready, progress } = useAppState();

  // Guarded by the root layout, so a missing profile here means storage is
  // still loading rather than a user who skipped onboarding.
  if (!ready || !progress) return null;
  return <Today progress={progress} />;
}

/** Split out so the hooks below never sit behind the gate above. */
function Today({ progress }: { progress: Progress }) {
  const router = useRouter();
  const { logs, stats } = useAppState();

  const { stage } = progress;
  const stageColor = stageColors[stage.colorKey];
  const session = useMemo(() => sessionForDay(stage), [stage]);
  const duration = useMemo(() => sessionSeconds(session), [session]);
  const days = useMemo(() => recentDays(logs, 7), [logs]);
  const countdown = describeCountdown(progress);

  return (
    <Screen testID="today-screen">
      <View style={styles.header}>
        <Text variant="label">{greeting()}</Text>
        <Text variant="hero">{describeProgress(progress)}</Text>
        {countdown ? <Text variant="body">{countdown}</Text> : null}
      </View>

      <Card tint={stageColor.tint}>
        <View style={styles.stageHeader}>
          <Pill label={stage.range} tint={colors.surface} ink={stageColor.ink} />
          <Pressable onPress={() => router.push('/plan')} accessibilityRole="button">
            <Text variant="smallStrong" color={stageColor.ink}>
              Full plan ›
            </Text>
          </Pressable>
        </View>
        <Text variant="heading">{stage.title}</Text>
        <Text variant="small">{stage.focus}</Text>
      </Card>

      {stats.completedToday ? (
        <Card tint={colors.accentSoft}>
          <Text variant="subheading">Today is done ✓</Text>
          <Text variant="small">
            {stats.current > 1
              ? `${stats.current} days in a row. Rest is part of the program too.`
              : 'Nicely done. Come back tomorrow.'}
          </Text>
        </Card>
      ) : null}

      <Card>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionTitle}>
            <Text variant="label">Today's session</Text>
            <Text variant="heading">{session.title}</Text>
          </View>
          <View style={styles.durationBadge}>
            <Text variant="smallStrong" color={colors.primaryPressed}>
              {formatDuration(duration)}
            </Text>
          </View>
        </View>

        <View style={styles.steps}>
          {session.steps.map((step, index) => {
            const exercise = getExercise(step.exerciseId);
            return (
              <Pressable
                key={`${step.exerciseId}-${index}`}
                onPress={() => router.push(`/exercise/${exercise.id}`)}
                style={styles.step}
                accessibilityRole="button"
              >
                <View style={styles.stepIndex}>
                  <Text variant="smallStrong" color={colors.primaryPressed}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.stepBody}>
                  <Text variant="bodyStrong">{exercise.name}</Text>
                  <Text variant="small" color={colors.textFaint}>
                    {kindLabels[exercise.kind]} · {describeStep(step)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Button
          label={stats.completedToday ? 'Do it again' : 'Start session'}
          variant={stats.completedToday ? 'secondary' : 'primary'}
          onPress={() => router.push('/session')}
        />
      </Card>

      <Card>
        <View style={styles.weekHeader}>
          <Text variant="label">This week</Text>
          <Text variant="smallStrong">
            {stats.daysThisWeek} of 7 days
          </Text>
        </View>
        <DayDots days={days} />
      </Card>
    </Screen>
  );
}

function greeting(): string {
  const hour = now().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sessionTitle: {
    flex: 1,
    gap: 2,
  },
  durationBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  steps: {
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stepIndex: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBody: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
