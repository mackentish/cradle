import { useKeepAwake } from "expo-keep-awake";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import {
  Button,
  Card,
  Confetti,
  CradleMark,
  Pill,
  ProgressRing,
  Screen,
  Text,
} from "@/components";
import { celebrationFor } from "@/content/celebration";
import { kindLabels } from "@/domain/exercises";
import { describeStep, sessionForDay, sessionSeconds } from "@/domain/session";
import type { Progress, SegmentKind } from "@/domain/types";
import { useDismiss } from "@/hooks/useDismiss";
import { useSessionPlayer } from "@/hooks/useSessionPlayer";
import { formatDuration } from "@/lib/date";
import { useAppState } from "@/state/AppState";
import { colors, radius, spacing } from "@/theme";

const PHASE_COLORS: Record<SegmentKind, string> = {
  lift: colors.phaseLift,
  hold: colors.phaseHold,
  release: colors.phaseRelease,
  rest: colors.phaseRest,
  duration: colors.phaseHold,
};

export default function SessionScreen() {
  const { ready, progress } = useAppState();
  if (!ready || !progress) return null;
  return <Player progress={progress} />;
}

function Player({ progress }: Readonly<{ progress: Progress }>) {
  const { logSession, stats } = useAppState();
  const leave = useDismiss();
  useKeepAwake();

  const session = useMemo(
    () => sessionForDay(progress.stage),
    [progress.stage],
  );
  const player = useSessionPlayer(session);
  const [saved, setSaved] = useState(false);

  const isComplete = player.status === "complete";
  // Frozen at the moment the session completes. Saving the log moves the streak
  // and the session count, and recomputing would swap the message out from under
  // her — "That's one" becoming "Beautifully done" mid-read.
  const celebration = useMemo(
    () =>
      celebrationFor({
        totalSessions: stats.totalSessions,
        streak: stats.completedToday ? stats.current : stats.current + 1,
        phase: progress.phase,
        stageId: progress.stage.id,
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
        stageId: progress.stage.id,
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
              label={`${formatDuration(Math.round(player.completedSeconds))} · ${session.title}`}
              tint={colors.accentSoft}
              ink={colors.accent}
              center
            />
          </View>
          <View style={styles.completeActions}>
            <Button label="Save and finish" onPress={finish} />
            <Button label="Discard this one" variant="quiet" onPress={leave} />
          </View>
        </Screen>
        <Confetti />
      </View>
    );
  }

  const { exercise, step, segment } = player;
  const phaseColor = PHASE_COLORS[segment?.kind ?? "hold"];

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
        <Text variant="label">
          Step {player.stepIndex + 1} of {player.stepCount}
        </Text>
        <Text variant="smallStrong" color={colors.textFaint}>
          {formatDuration(sessionSeconds(session))}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.trackFill,
            { width: `${player.overallProgress * 100}%` },
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
                  <Text variant="smallStrong" color={colors.primaryPressed}>
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
            <Button label="I'm ready" onPress={player.startStep} />
            <Button
              label="Skip this one"
              variant="quiet"
              onPress={player.skipStep}
            />
          </View>
        </>
      ) : (
        <View style={styles.runningBody}>
          <Text variant="label">{exercise.name}</Text>

          <ProgressRing
            progress={player.segmentProgress}
            color={phaseColor}
            trackColor={colors.surfaceSunken}
            size={280}
            strokeWidth={14}
          >
            <Text variant="heading" color={phaseColor}>
              {segment?.label}
            </Text>
            <Text variant="timer">{player.secondsLeft}</Text>
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
            <Button
              label={player.status === "paused" ? "Resume" : "Pause"}
              variant="secondary"
              haptic={false}
              onPress={
                player.status === "paused" ? player.resume : player.pause
              }
            />
            <Button
              label="Skip step"
              variant="quiet"
              haptic={false}
              onPress={player.skipStep}
            />
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
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    overflow: "hidden",
  },
  trackFill: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
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
