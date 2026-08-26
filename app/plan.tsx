import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackLink, Card, Pill, Screen, SegmentedTabs, Text } from '@/components';
import { PROGRAM_SAFETY } from '@/content/safety';
import { getExercise } from '@/domain/exercises';
import { phaseLabel } from '@/domain/pregnancy';
import { isProgramId, PROGRAM_IDS, programsById, programTitle } from '@/domain/program';
import { describeStep, sessionSeconds } from '@/domain/session';
import type { ProgramId, Step } from '@/domain/types';
import { formatDuration } from '@/lib/date';
import { useAppState } from '@/state/AppState';
import { colors, programColors, spacing, stageColors } from '@/theme';

/** The whole program, so nothing about the progression feels like a black box. */
export default function PlanScreen() {
  const { progress } = useAppState();
  const { program } = useLocalSearchParams<{ program?: string }>();

  // Today's "Full plan" link passes the card she tapped, so she lands where she was.
  const [selected, setSelected] = useState<ProgramId>(
    isProgramId(program) ? program : 'pelvic-floor'
  );

  const phase = progress?.phase ?? 'pregnancy';
  const active = programsById[selected];
  const tone = programColors[active.colorKey];
  const safety = PROGRAM_SAFETY[selected];

  return (
    <Screen testID="plan-screen">
      <BackLink />

      <View style={styles.header}>
        <Text variant="title">The full plan</Text>
        <Text variant="body">
          Three programs, each with seven stages running from the first trimester through recovery.
          Cradle picks the stage that matches your week and rotates its sessions day to day.
        </Text>
      </View>

      <SegmentedTabs
        value={selected}
        onChange={setSelected}
        options={PROGRAM_IDS.map((programId) => ({
          value: programId,
          label: programTitle(programsById[programId], phase),
        }))}
      />

      <Card tint={tone.tint}>
        <Text variant="heading">{programTitle(active, phase)}</Text>
        <Text variant="small">{active.blurb}</Text>
        <Text variant="small">{safety.intro}</Text>
        <View style={styles.emphasis}>
          {safety.rules.map((rule) => (
            <Text key={rule} variant="small" color={tone.ink}>
              · {rule}
            </Text>
          ))}
        </View>
      </Card>

      {active.stages.map((stage) => {
        const stageTone = stageColors[stage.colorKey];
        const isCurrent = stage.id === progress?.stages[selected].id;
        return (
          <Card
            key={`${stage.programId}-${stage.id}`}
            tint={isCurrent ? stageTone.tint : undefined}
          >
            <View style={styles.stageHeader}>
              <View style={styles.stageTitle}>
                <Text variant="label" color={stageTone.ink}>
                  {phaseLabel(stage.phase)} · {stage.range}
                </Text>
                <Text variant="heading">{stage.title}</Text>
              </View>
              {isCurrent ? <Pill label="Now" tint={colors.surface} ink={stageTone.ink} /> : null}
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
                    <StepLink key={`${session.id}-${step.exerciseId}-${index}`} step={step} />
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

/**
 * One step in a session, linking to the exercise. Its own component so the tap
 * handler doesn't sit four maps deep inside the screen.
 */
function StepLink({ step }: Readonly<{ step: Step }>) {
  const router = useRouter();

  return (
    <Pressable
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
