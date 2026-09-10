import { useLocalSearchParams } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import {
  BreathCircle,
  Button,
  Card,
  Chevron,
  Confetti,
  CradleMark,
  Pill,
  ProgressRing,
  Screen,
  Text,
} from "@/components";
import { celebrationFor } from "@/content/celebration";
import { kindLabels } from "@/domain/exercises";
import { isProgramId, programsById, programTitle } from "@/domain/program";
import {
  describePacing,
  describeStep,
  isPacedStep,
  paceState,
  sessionForDay,
} from "@/domain/session";
import type { ProgramId, Progress, SegmentKind } from "@/domain/types";
import { useDismiss } from "@/hooks/useDismiss";
import { useSessionPlayer } from "@/hooks/useSessionPlayer";
import { formatDuration } from "@/lib/date";
import { useAppState } from "@/state/AppState";
import {
  colors,
  type ProgramColorKey,
  programColors,
  programPhaseColors,
  radius,
  spacing,
} from "@/theme";

/**
 * The ring is the running program's color, and the phase is the rung it sits on
 * within that color — see `programPhaseColors`. A `duration` step is a single
 * sustained effort with no lift/release cycle around it, so it borrows `hold`.
 */
type PhaseRamp = (typeof programPhaseColors)[ProgramColorKey];

function phaseColor(ramp: PhaseRamp, kind: SegmentKind): string {
  return kind === "duration" ? ramp.hold : ramp[kind];
}

export default function SessionScreen() {
  const { ready, progress } = useAppState();
  const { program } = useLocalSearchParams<{ program: string }>();

  // The param arrives from outside the type system, so it gets validated rather
  // than asserted — same reasoning as `findExercise` versus `getExercise`.
  const programId: ProgramId = isProgramId(program) ? program : "pelvic-floor";

  if (!ready || !progress) return null;
  return <Player progress={progress} programId={programId} />;
}

function Player({
  progress,
  programId,
}: Readonly<{ progress: Progress; programId: ProgramId }>) {
  const { logSession, stats } = useAppState();
  const leave = useDismiss();
  useKeepAwake();

  const stage = progress.stages[programId];
  // Identity for the chrome, the matching ramp for the ring. Both keyed off the
  // one `colorKey`, so a program can never end up sage outside and blush inside.
  const { colorKey } = programsById[programId];
  const tone = programColors[colorKey];
  const ramp = programPhaseColors[colorKey];
  const session = useMemo(() => sessionForDay(stage), [stage]);
  const player = useSessionPlayer(session);
  const [saved, setSaved] = useState(false);

  const isComplete = player.status === "complete";
  const elapsed = formatDuration(Math.round(player.completedSeconds));
  // Frozen at the moment the session completes. Saving the log moves the streak
  // and the session count, and recomputing would swap the message out from under
  // her — "That's one" becoming "Beautifully done" mid-read.
  const celebration = useMemo(
    () =>
      celebrationFor({
        totalSessions: stats.totalSessions,
        programSessions: stats.byProgram[programId].totalSessions,
        streak: stats.completedToday ? stats.current : stats.current + 1,
        programsToday: stats.byProgram[programId].completedToday
          ? stats.programsToday
          : stats.programsToday + 1,
        phase: progress.phase,
        stageId: stage.id,
        programId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isComplete],
  );

  const confirmLeave = () => {
    if (isComplete) {
      leave();
      return;
    }
    Alert.alert(
      "Leave the session?",
      "Your progress in this session will not be saved.",
      [
        { text: "Keep going", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: leave },
      ],
    );
  };

  const finish = async () => {
    if (!saved) {
      setSaved(true);
      await logSession({
        programId,
        stageId: stage.id,
        sessionId: session.id,
        week: progress.week,
        phase: progress.phase,
        seconds: Math.round(player.completedSeconds),
      });
    }
    leave();
  };

  if (isComplete) {
    return (
      // Confetti sits outside the Screen: inside its ScrollView an absolute
      // overlay would scroll away and get clipped.
      <View style={styles.completeRoot}>
        <Screen contentStyle={styles.centered} testID="session-complete">
          <View style={styles.completeBody}>
            <CradleMark size={84} />
            <Text variant="hero" center>
              {celebration.title}
            </Text>
            <Text variant="body" center>
              {celebration.body}
            </Text>
            <Pill
              label={`${programTitle(programsById[programId], progress.phase)} · ${elapsed}`}
              tint={tone.tint}
              ink={tone.ink}
              center
            />
          </View>
          <View style={styles.completeActions}>
            <Button label="Save and finish" tone={tone} onPress={finish} />
            <Button label="Discard this one" variant="quiet" onPress={leave} />
          </View>
        </Screen>
        <Confetti />
      </View>
    );
  }

  const { exercise, step, segment } = player;
  /*
    Breathing, and anything else moving too fast for an arc, is paced by a
    circle instead — see `isPacedStep`. The arc stays, timing the exercise from
    end to end, so it holds still on one rung while the circle carries the
    phase; a per-phase color on a one second phase would only be another thing
    flickering.
  */
  const paced = isPacedStep(step);
  const pace = paced && segment ? paceState(step, segment, player.segmentElapsed) : null;
  const ringColor = paced ? ramp.hold : phaseColor(ramp, segment?.kind ?? "hold");
  const pacing = describePacing(step);

  return (
    <Screen scroll={false} style={styles.root}>
      <View style={styles.topBar}>
        <Pressable
          onPress={confirmLeave}
          hitSlop={12}
          accessibilityRole="button"
        >
          <Text variant="smallStrong" color={colors.textFaint}>
            Close
          </Text>
        </Pressable>
        {/*
          The step counter doubles as the way back to the exercise before it,
          so one control serves both the intro and the running view instead of
          a fourth button crowding each. Plain text on step one, where there is
          nowhere to go.
        */}
        {player.canGoBack ? (
          <Pressable
            onPress={player.previousStep}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Previous exercise"
            style={styles.stepBack}
          >
            <Chevron direction="left" size={14} color={tone.ink} />
            <Text variant="label" color={tone.ink}>
              Step {player.stepIndex + 1} of {player.stepCount}
            </Text>
          </Pressable>
        ) : (
          <Text variant="label">
            Step {player.stepIndex + 1} of {player.stepCount}
          </Text>
        )}
        <Text variant="smallStrong" color={colors.textFaint}>
          {formatDuration(player.totalSeconds)}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          testID="session-track"
          style={[
            styles.trackFill,
            { width: `${player.overallProgress * 100}%`, backgroundColor: tone.ring },
          ]}
        />
      </View>

      {player.status === "intro" ? (
        <>
          <ScrollView
            style={styles.introScroll}
            contentContainerStyle={styles.introBody}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.introHeader}>
              <Text variant="label">
                {kindLabels[exercise.kind]} · {describeStep(step)}
              </Text>
              <Text variant="title">{exercise.name}</Text>
              <Text variant="body">{exercise.summary}</Text>
            </View>

            {/*
              Above the position and the how-to, because it is the answer to
              "what am I tapping into" — on a paced exercise the clock starts
              the instant she taps, and a circle she was not expecting is
              exactly as jarring as a countdown she cannot read.
            */}
            {pacing ? (
              <Card tint={colors.surfaceSunken}>
                <Text variant="label">Before you start</Text>
                <Text variant="small">{pacing}</Text>
              </Card>
            ) : null}

            <Card>
              <Text variant="label">Get into position</Text>
              {exercise.positions.map((position) => (
                <Text key={position} variant="small">
                  · {position}
                </Text>
              ))}
            </Card>

            <Card>
              <Text variant="label">How to</Text>
              {exercise.howTo.map((line, index) => (
                <View key={line} style={styles.howToRow}>
                  <Text variant="smallStrong" color={tone.ink}>
                    {index + 1}
                  </Text>
                  <Text variant="small" style={styles.howToText}>
                    {line}
                  </Text>
                </View>
              ))}
            </Card>

            {step.note ? (
              <Card tint={colors.accentSoft}>
                <Text variant="small">{step.note}</Text>
              </Card>
            ) : null}

            {exercise.caution ? (
              <Card tint={colors.primarySoft}>
                <Text variant="smallStrong">Worth knowing</Text>
                <Text variant="small">{exercise.caution}</Text>
              </Card>
            ) : null}
          </ScrollView>

          <View style={styles.introActions}>
            <Button label="I'm ready" tone={tone} onPress={player.startStep} />
            <Button
              label="Skip this one"
              variant="quiet"
              onPress={player.skipStep}
            />
          </View>
        </>
      ) : (
        <View style={styles.runningBody}>
          <Text variant="label" testID="session-exercise">
            {exercise.name}
          </Text>

          <ProgressRing
            progress={paced ? player.stepProgress : player.segmentProgress}
            color={ringColor}
            trackColor={colors.surfaceSunken}
            size={280}
            strokeWidth={14}
          >
            {pace ? (
              <BreathCircle
                testID="session-breath-circle"
                fill={pace.fill}
                size={232}
                color={tone.tint}
                borderColor={tone.softBorder}
              />
            ) : null}
            <Text variant="heading" color={ringColor} testID="session-phase">
              {pace ? pace.label : segment?.label}
            </Text>
            {/*
              Quiet on a paced exercise: the number is the one thing she should
              not be chasing there, and the ring already says how much is left.
              Everywhere else it is the count she is holding to, so it stays the
              biggest thing on the screen.
            */}
            {paced ? (
              <Text
                variant="smallStrong"
                color={colors.textSoft}
                testID="session-countdown"
              >
                {`${formatDuration(player.stepSecondsLeft)} left`}
              </Text>
            ) : (
              <Text variant="timer" testID="session-countdown">
                {player.secondsLeft}
              </Text>
            )}
            {segment?.repTotal ? (
              <Text variant="small" color={colors.textFaint}>
                Rep {(segment.repIndex ?? 0) + 1} of {segment.repTotal}
              </Text>
            ) : null}
          </ProgressRing>

          <View style={styles.cues}>
            {exercise.cues.map((cue) => (
              <View key={cue} style={styles.cue}>
                <Text variant="smallStrong" color={colors.textSoft}>
                  {cue}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.runningActions}>
            {/*
              Rest takes over the primary slot, because moving on is the only
              thing she wants from a countdown between reps — and pausing a six
              second gap has nothing to offer that the gap doesn't already. The
              next rep's own clock is a tap away from being paused if she needs
              it.

              Not on a paced exercise, though: its rest is a two second dip
              between quick flicks, so the button would swap labels roughly once
              a second and land under her thumb as the wrong one. There is
              nothing there worth skipping.
            */}
            {player.isResting && !paced ? (
              <Button
                label="Next rep"
                variant="secondary"
                tone={tone}
                haptic={false}
                onPress={player.skipRest}
              />
            ) : (
              <Button
                label={player.status === "paused" ? "Resume" : "Pause"}
                variant="secondary"
                tone={tone}
                haptic={false}
                onPress={
                  player.status === "paused" ? player.resume : player.pause
                }
              />
            )}
            {/* Both quiet, side by side: starting this exercise over is the
                gentler neighbor of skipping it, not a competing headline. */}
            <View style={styles.runningMinorActions}>
              <Button
                label="Start over"
                variant="quiet"
                haptic={false}
                style={styles.runningMinorAction}
                onPress={player.restartStep}
              />
              <Button
                label="Skip step"
                variant="quiet"
                haptic={false}
                style={styles.runningMinorAction}
                onPress={player.skipStep}
              />
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
  },
  stepBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    overflow: "hidden",
  },
  // No background here: the fill takes the program's color, set in the render.
  trackFill: {
    height: 6,
    borderRadius: radius.pill,
  },
  introScroll: {
    flex: 1,
  },
  introBody: {
    gap: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  introHeader: {
    gap: spacing.xs,
  },
  howToRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  howToText: {
    flex: 1,
  },
  introActions: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  runningBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  cues: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  cue: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  runningActions: {
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  runningMinorActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  // Even halves, so neither label's length decides how the row sits.
  runningMinorAction: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  centered: {
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing.xxl,
  },
  completeRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  completeBody: {
    gap: spacing.md,
    alignItems: "center",
  },
  completeActions: {
    gap: spacing.sm,
  },
});
