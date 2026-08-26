import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, DayDots, Pill, ProgramLegend, Screen, Text } from '@/components';
import { getExercise, kindLabels } from '@/domain/exercises';
import { describeCountdown, describeProgress } from '@/domain/pregnancy';
import { PROGRAM_IDS, programsById, programTitle } from '@/domain/program';
import { describeStep, sessionForDay, sessionSeconds } from '@/domain/session';
import type { Program, Progress } from '@/domain/types';
import { now } from '@/lib/clock';
import { formatDuration } from '@/lib/date';
import { recentDays } from '@/lib/streak';
import { useAppState } from '@/state/AppState';
import { colors, programColors, radius, spacing, stageColors } from '@/theme';

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
  const days = useMemo(() => recentDays(logs, 7), [logs]);
  const countdown = describeCountdown(progress);

  return (
    <Screen testID="today-screen">
      <View style={styles.header}>
        <Text variant="label">{greeting()}</Text>
        <Text variant="hero">{describeProgress(progress)}</Text>
        {countdown ? <Text variant="body">{countdown}</Text> : null}
      </View>

      {/*
        Program-neutral on purpose: each stage's `focus` is its own program's copy,
        so the banner carries only what all three agree on — the week band.
      */}
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
      </Card>

      {stats.programsToday > 0 ? (
        <Card tint={colors.accentSoft}>
          <Text variant="subheading">
            {stats.programsToday} of {PROGRAM_IDS.length} done today ✓
          </Text>
          <Text variant="small">
            {stats.programsToday === PROGRAM_IDS.length
              ? 'Everything, today. Rest is part of the program too.'
              : stats.current > 1
                ? `${stats.current} days in a row. One is enough to keep it going.`
                : 'Nicely done. The others are there if you want them.'}
          </Text>
        </Card>
      ) : null}

      {PROGRAM_IDS.map((programId) => (
        <ProgramCard
          key={programId}
          program={programsById[programId]}
          progress={progress}
          done={stats.byProgram[programId].completedToday}
        />
      ))}

      <Card>
        <View style={styles.weekHeader}>
          <Text variant="label">This week</Text>
          <Text variant="smallStrong">{stats.daysThisWeek} of 7 days</Text>
        </View>
        <DayDots days={days} />
        <ProgramLegend phase={progress.phase} />
      </Card>
    </Screen>
  );
}

/**
 * One program's session for today. Collapsed by default — three full step lists
 * would run to fifteen rows and bury the third program below the fold — and
 * expandable for when she wants to see what she's in for or read a how-to.
 */
function ProgramCard({
  program,
  progress,
  done,
}: {
  program: Program;
  progress: Progress;
  done: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const stage = progress.stages[program.id];
  const tone = programColors[program.colorKey];
  const session = useMemo(() => sessionForDay(stage), [stage]);
  const duration = useMemo(() => sessionSeconds(session), [session]);
  const title = programTitle(program, progress.phase);

  return (
    <Card tint={done ? undefined : tone.tint} testID={`program-card-${program.id}`}>
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${session.title}, ${formatDuration(duration)}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <View style={styles.programName}>
              <View style={[styles.swatch, { borderColor: tone.ring }]} />
              <Text variant="label" color={tone.ink}>
                {title}
              </Text>
            </View>
            <Text variant="heading">{session.title}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.durationBadge, { backgroundColor: tone.tint }]}>
              <Text variant="smallStrong" color={tone.ink}>
                {done ? 'Done ✓' : formatDuration(duration)}
              </Text>
            </View>
            <Text variant="small" color={colors.textFaint}>
              {expanded ? '⌃' : '⌄'}
            </Text>
          </View>
        </View>
        <Text variant="small">{program.blurb}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.steps} testID={`program-steps-${program.id}`}>
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
                  <Text variant="smallStrong" color={tone.ink}>
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
      ) : null}

      <Button
        label={done ? 'Do it again' : 'Start session'}
        variant={done ? 'secondary' : 'primary'}
        onPress={() => router.push(`/session/${program.id}` as never)}
      />
    </Card>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitle: {
    flex: 1,
    gap: 2,
  },
  programName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    borderWidth: 3,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  durationBadge: {
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
