import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackLink, Card, Pill, Screen, Text } from '@/components';
import { getExercise } from '@/domain/exercises';
import { stages } from '@/domain/program';
import { describeStep, sessionSeconds } from '@/domain/session';
import { formatDuration } from '@/lib/date';
import { useAppState } from '@/state/AppState';
import { colors, spacing, stageColors } from '@/theme';

/** The whole programme, so nothing about the progression feels like a black box. */
export default function PlanScreen() {
  const router = useRouter();
  const { progress } = useAppState();

  return (
    <Screen testID="plan-screen">
      <BackLink />

      <View style={styles.header}>
        <Text variant="title">The full plan</Text>
        <Text variant="body">
          Seven stages, from the first trimester through recovery. Cradle picks the one that matches
          your week and rotates its sessions day to day.
        </Text>
      </View>

      {stages.map((stage) => {
        const tone = stageColors[stage.colorKey];
        const isCurrent = stage.id === progress?.stage.id;
        return (
          <Card key={stage.id} tint={isCurrent ? tone.tint : undefined}>
            <View style={styles.stageHeader}>
              <View style={styles.stageTitle}>
                <Text variant="label" color={tone.ink}>
                  {stage.phase === 'pregnancy' ? 'Pregnancy' : 'Postpartum'} · {stage.range}
                </Text>
                <Text variant="heading">{stage.title}</Text>
              </View>
              {isCurrent ? <Pill label="Now" tint={colors.surface} ink={tone.ink} /> : null}
            </View>

            <Text variant="small">{stage.focus}</Text>

            <View style={styles.emphasis}>
              {stage.emphasis.map((item) => (
                <Text key={item} variant="small" color={colors.textFaint}>
                  · {item}
                </Text>
              ))}
            </View>

            <View style={styles.sessions}>
              {stage.sessions.map((session) => (
                <View key={session.id} style={styles.session}>
                  <View style={styles.sessionHeader}>
                    <Text variant="bodyStrong">{session.title}</Text>
                    <Text variant="small" color={colors.textFaint}>
                      {formatDuration(sessionSeconds(session))}
                    </Text>
                  </View>
                  {session.steps.map((step, index) => (
                    <Pressable
                      key={`${session.id}-${step.exerciseId}-${index}`}
                      onPress={() => router.push(`/exercise/${step.exerciseId}`)}
                      accessibilityRole="button"
                    >
                      <Text variant="small">
                        {getExercise(step.exerciseId).name}
                        <Text variant="small" color={colors.textFaint}>
                          {'  '}
                          {describeStep(step)}
                        </Text>
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  stageTitle: {
    flex: 1,
    gap: 2,
  },
  emphasis: {
    gap: 2,
  },
  sessions: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  session: {
    gap: 4,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
