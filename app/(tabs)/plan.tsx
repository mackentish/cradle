import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Chevron, Collapsible, Pill, Screen, SegmentedTabs, Text } from '@/components';
import { PROGRAM_SAFETY } from '@/content/safety';
import { SHARED_EXERCISE_NOTES } from '@/content/shared-exercises';
import { getExercise } from '@/domain/exercises';
import { phaseLabel } from '@/domain/pregnancy';
import {
  isProgramId,
  PROGRAM_IDS,
  programsById,
  programTitle,
  sharedExercises,
} from '@/domain/program';
import { describeStep, sessionSeconds } from '@/domain/session';
import type { Phase, ProgramId, Stage, Step } from '@/domain/types';
import { formatDuration } from '@/lib/date';
import { useAppState } from '@/state/AppState';
import { colors, programColors, spacing, stageColors } from '@/theme';

/** The whole program, so nothing about the progression feels like a black box. */
export default function PlanScreen() {
  const { progress } = useAppState();
  const { program } = useLocalSearchParams<{ program?: string }>();

  const [selected, setSelected] = useState<ProgramId>(
    isProgramId(program) ? program : 'pelvic-floor'
  );

  // A tab stays mounted, so the param can arrive at a screen that already has a
  // selection — a deep link, or Today's link naming the card she tapped. Initial
  // state alone would only honor whichever of the two got here first.
  useEffect(() => {
    if (isProgramId(program)) setSelected(program);
  }, [program]);

  const phase = progress?.phase ?? 'pregnancy';
  const active = programsById[selected];
  const tone = programColors[active.colorKey];
  const safety = PROGRAM_SAFETY[selected];

  return (
    <Screen testID="plan-screen">
      <View style={styles.header}>
        <Text variant="label">The plan</Text>
        <Text variant="hero">Every stage, start to finish</Text>
        <Text variant="body">
          Three programs, each with seven stages running from the first trimester through recovery.
          Cradle picks the stage that matches your week and rotates its sessions day to day. Open a
          stage to see what it asks of you.
        </Text>
      </View>

      <SegmentedTabs
        value={selected}
        onChange={setSelected}
        activeColor={tone.ink}
        wrapLabels
        options={PROGRAM_IDS.map((programId) => ({
          value: programId,
          label: programTitle(programsById[programId], phase),
        }))}
      />

      {/*
        Stays open while the stages below fold away: this card is the program's
        safety copy, and a disclaimer behind a closed chevron is a disclaimer she
        never reads.
      */}
      <Card tint={tone.tint} testID={`plan-program-${selected}`}>
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

      <SharedCard programId={selected} phase={phase} />

      {active.stages.map((stage) => (
        <StageCard
          key={`${stage.programId}-${stage.id}`}
          stage={stage}
          current={stage.id === progress?.stages[selected].id}
        />
      ))}
    </Screen>
  );
}

/**
 * Why a familiar exercise turns up in a second program. One library serves all
 * three (`src/domain/exercises.ts`), so the overlap is real rather than a
 * duplicate — and this is the only screen it is visible from, where two
 * programs' step lists sit one tab apart.
 *
 * Which exercises overlap is derived from the stage tables, so the card cannot
 * claim an overlap the sessions no longer have; *why* each one does comes from
 * `SHARED_EXERCISE_NOTES`, which is the part no amount of walking the tables can
 * work out. The overlap is deliberately small — a handful per program — and the
 * reason is what makes it read as a decision rather than as filler, so a name
 * without one is a test failure.
 *
 * The sentence is the callout and stays open; the names and reasons fold away,
 * because two lines each is a block she scrolls past rather than reads.
 */
function SharedCard({ programId, phase }: Readonly<{ programId: ProgramId; phase: Phase }>) {
  const [expanded, setExpanded] = useState(false);
  const shared = useMemo(() => sharedExercises(programId), [programId]);

  if (shared.length === 0) return null;

  return (
    <Card testID={`plan-shared-${programId}`}>
      <Text variant="bodyStrong">A few exercises appear in more than one program</Text>
      <Text variant="small">
        All three programs draw on one library of exercises, and most of what they ask for is their
        own. {shared.length === 1 ? 'One exercise in' : `${shared.length} exercises in`}{' '}
        {programTitle(programsById[programId], phase)} {shared.length === 1 ? 'is' : 'are'} asked
        for elsewhere too, each one on purpose.
      </Text>

      <Pressable
        onPress={() => setExpanded((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel="Which exercises are shared"
      >
        <View style={styles.sharedToggle}>
          <Text variant="smallStrong" color={colors.textFaint}>
            Which ones, and why
          </Text>
          <Chevron direction={expanded ? 'up' : 'down'} size={14} />
        </View>
      </Pressable>

      <Collapsible expanded={expanded} testID={`plan-shared-detail-${programId}`}>
        <View style={styles.sharedList}>
          {shared.map(({ exerciseId, programIds }) => (
            <View key={exerciseId} style={styles.sharedEntry}>
              <Text variant="smallStrong">
                {getExercise(exerciseId).name}
                <Text variant="small" color={colors.textFaint}>
                  {'  also in '}
                  {programNames(programIds, phase)}
                </Text>
              </Text>
              <Text variant="small" color={colors.textFaint}>
                {SHARED_EXERCISE_NOTES[exerciseId]}
              </Text>
            </View>
          ))}
        </View>
      </Collapsible>
    </Card>
  );
}

/** "Deep stretch", or "Core strength and Deep stretch" for one shared with both. */
function programNames(programIds: ProgramId[], phase: Phase): string {
  const titles = programIds.map((id) => programTitle(programsById[id], phase));
  return titles.length > 1
    ? `${titles.slice(0, -1).join(', ')} and ${titles[titles.length - 1]}`
    : (titles[0] ?? '');
}

/**
 * One stage, folded shut. Seven stages of two sessions of five steps ran to
 * around seventy rows per program, which is a page you scroll past rather than
 * read — so the header carries enough to choose by (when it runs, how long its
 * sessions are, whether it is the one she is in) and the detail waits for a tap.
 *
 * Its own component because each card owns its open state; one `expanded` held
 * by the screen would make opening a stage close the last one.
 */
function StageCard({ stage, current }: Readonly<{ stage: Stage; current: boolean }>) {
  const [expanded, setExpanded] = useState(false);
  const tone = stageColors[stage.colorKey];
  const summary = describeSessions(stage);

  return (
    <Card tint={current ? tone.tint : undefined} testID={`plan-stage-${stage.id}`}>
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${stage.title}, ${phaseLabel(stage.phase)} ${stage.range}, ${summary}`}
      >
        {/*
          The pill and the chevron are centered against the three-line block
          rather than pinned to its top, which lands them on the stage title —
          the line they are both about.
        */}
        <View style={styles.stageHeader}>
          <View style={styles.stageTitle}>
            <Text variant="label" color={tone.ink}>
              {phaseLabel(stage.phase)} · {stage.range}
            </Text>
            <Text variant="heading">{stage.title}</Text>
            <Text variant="small" color={colors.textFaint}>
              {summary}
            </Text>
          </View>
          {current ? <Pill label="Now" tint={colors.surface} ink={tone.ink} /> : null}
          <Chevron direction={expanded ? 'up' : 'down'} size={16} />
        </View>
      </Pressable>

      <Collapsible
        expanded={expanded}
        style={styles.detail}
        testID={`plan-stage-detail-${stage.id}`}
      >
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
      </Collapsible>
    </Card>
  );
}

/**
 * What a closed stage says about its sessions. Rounded to whole minutes rather
 * than going through `formatDuration` twice: a range needs one unit across both
 * ends, and "8 min – 11m 30s" reads as two unrelated numbers.
 */
function describeSessions(stage: Stage): string {
  const minutes = stage.sessions.map((session) =>
    Math.max(1, Math.round(sessionSeconds(session) / 60))
  );
  const count = `${stage.sessions.length} session${stage.sessions.length === 1 ? '' : 's'}`;
  const shortest = Math.min(...minutes);
  const longest = Math.max(...minutes);

  return shortest === longest
    ? `${count} · ${shortest} min`
    : `${count} · ${shortest}–${longest} min`;
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
    gap: 4,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stageTitle: {
    flex: 1,
    gap: 2,
  },
  emphasis: {
    gap: 2,
  },
  sharedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sharedList: {
    gap: spacing.md,
  },
  sharedEntry: {
    gap: 2,
  },
  detail: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  sessions: {
    gap: spacing.lg,
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
