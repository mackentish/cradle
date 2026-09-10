import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getExercise } from '@/domain/exercises';
import { buildSegments, sessionSeconds, stepSeconds } from '@/domain/session';
import type { SessionTemplate, Step } from '@/domain/types';

const TICK_MS = 100;

export type PlayerStatus = 'intro' | 'running' | 'paused' | 'complete';

/**
 * Drives one guided session. Each step gets an intro screen first — changing
 * into side-lying with a bump takes longer than a three second countdown.
 *
 * Timing is anchored to wall-clock deadlines rather than accumulated ticks, so
 * a dropped frame or a moment in the background doesn't drift the count.
 */
export function useSessionPlayer(session: SessionTemplate) {
  const [stepIndex, setStepIndex] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [status, setStatus] = useState<PlayerStatus>('intro');
  const [remainingMs, setRemainingMs] = useState(0);
  const [completedSeconds, setCompletedSeconds] = useState(0);

  const deadlineRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // `stepIndex` never runs past the last step — advancing off the end sets
  // 'complete' instead. The fallback is what tells the type checker that.
  const step: Step = session.steps[stepIndex] ?? session.steps[0];
  const exercise = getExercise(step.exerciseId);
  const segments = useMemo(() => buildSegments(step), [step]);
  const segment = segments[Math.min(segmentIndex, segments.length - 1)];

  const totalSeconds = useMemo(() => sessionSeconds(session), [session]);
  const secondsBeforeStep = useMemo(
    () =>
      session.steps.slice(0, stepIndex).reduce((total, s) => total + stepSeconds(s), 0),
    [session, stepIndex]
  );

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const beginSegment = useCallback(
    (index: number) => {
      const next = segments[index];
      if (!next) return;
      setSegmentIndex(index);
      setRemainingMs(next.seconds * 1000);
      deadlineRef.current = Date.now() + next.seconds * 1000;
      setStatus('running');
    },
    [segments]
  );

  /** Stops the clock and parks on a step's intro, whichever direction we came from. */
  const goToStep = useCallback(
    (index: number) => {
      clearTimer();
      deadlineRef.current = null;
      setStepIndex(index);
      setSegmentIndex(0);
      setRemainingMs(0);
      setStatus('intro');
    },
    [clearTimer]
  );

  /**
   * Moves to the next step's intro, or ends the session if that was the last
   * one. Reached both by finishing a step and by skipping it.
   */
  const leaveStep = useCallback(() => {
    if (stepIndex + 1 < session.steps.length) {
      goToStep(stepIndex + 1);
      return;
    }
    clearTimer();
    deadlineRef.current = null;
    setStatus('complete');
  }, [clearTimer, goToStep, session.steps.length, stepIndex]);

  /**
   * Back to the exercise before this one, at its intro rather than mid-count —
   * she gets to re-read the cues and get back into position before the clock
   * starts, exactly as she did arriving there the first time.
   */
  const previousStep = useCallback(() => {
    if (stepIndex === 0) return;
    goToStep(stepIndex - 1);
  }, [goToStep, stepIndex]);

  /**
   * Moves on from the current segment. `creditedSeconds` is what gets added to
   * `completedSeconds`; it defaults to the whole segment, which is right when
   * the clock ran out, and is passed explicitly when she cut a segment short.
   */
  const advance = useCallback(
    (creditedSeconds?: number) => {
      const finished = segments[segmentIndex];
      setCompletedSeconds(
        (current) => current + (creditedSeconds ?? finished?.seconds ?? 0)
      );

      const nextIndex = segmentIndex + 1;
      if (nextIndex < segments.length) {
        Haptics.selectionAsync().catch(() => {});
        beginSegment(nextIndex);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      leaveStep();
    },
    [beginSegment, leaveStep, segmentIndex, segments]
  );

  // One interval for the whole session; it reads the current deadline each tick.
  useEffect(() => {
    if (status !== 'running') {
      clearTimer();
      return;
    }
    intervalRef.current = setInterval(() => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const left = deadline - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        advance();
      } else {
        setRemainingMs(left);
      }
    }, TICK_MS);
    return clearTimer;
  }, [status, advance, clearTimer]);

  /**
   * Starts the current exercise at rep one. Leaving the intro and restarting
   * mid-exercise are the same move, so they share it — the second is what she
   * reaches for after losing the thread halfway through, instead of giving up
   * the whole session.
   *
   * Deliberately no `clearTimer`, which only matters on the restart path: when
   * the running segment is already the first one, neither `status` nor `advance`
   * changes, so the interval effect would not re-run to replace a cleared
   * interval and the count would sit frozen at full. `beginSegment` moves the
   * deadline instead, and the live interval picks it up on the next tick.
   */
  const startStep = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    beginSegment(0);
  }, [beginSegment]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    const deadline = deadlineRef.current;
    setRemainingMs(deadline ? Math.max(0, deadline - Date.now()) : 0);
    deadlineRef.current = null;
    setStatus('paused');
  }, [status]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    deadlineRef.current = Date.now() + remainingMs;
    setStatus('running');
  }, [remainingMs, status]);

  /**
   * Ends the rest between reps early and starts the next one. The recovery
   * built into the program is a ceiling, not a requirement: on the low-load
   * early work especially, sitting through a countdown she doesn't need is the
   * thing that makes a five minute session feel long.
   *
   * Only the rest she actually took is credited — `completedSeconds` is time
   * practiced, so the seconds she skipped never happened. Reading the deadline
   * rather than `remainingMs` keeps that exact to the tap instead of to the
   * last tick, and falling back to `remainingMs` covers a rest she paused.
   */
  const skipRest = useCallback(() => {
    if (segment?.kind !== 'rest') return;
    const deadline = deadlineRef.current;
    const leftMs = deadline === null ? remainingMs : Math.max(0, deadline - Date.now());
    advance(Math.max(0, segment.seconds - leftMs / 1000));
  }, [advance, remainingMs, segment]);

  const finishNow = useCallback(() => {
    clearTimer();
    deadlineRef.current = null;
    setStatus('complete');
  }, [clearTimer]);

  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));
  const segmentProgress = segment?.seconds
    ? 1 - remainingMs / (segment.seconds * 1000)
    : 0;

  const secondsWithinStep = useMemo(
    () => segments.slice(0, segmentIndex).reduce((total, s) => total + s.seconds, 0),
    [segments, segmentIndex]
  );
  const elapsedInSegment = segment ? segment.seconds - remainingMs / 1000 : 0;
  const overallProgress =
    totalSeconds > 0
      ? Math.min(1, (secondsBeforeStep + secondsWithinStep + elapsedInSegment) / totalSeconds)
      : 0;

  // This exercise on its own, for the paced view: its circle carries the phase,
  // so the arc around it is free to time the exercise end to end.
  const stepTotalSeconds = useMemo(() => stepSeconds(step), [step]);
  const elapsedInStep = secondsWithinStep + elapsedInSegment;

  return {
    status,
    step,
    stepIndex,
    stepCount: session.steps.length,
    exercise,
    segment,
    segmentIndex,
    segmentCount: segments.length,
    secondsLeft,
    segmentProgress: Math.min(Math.max(segmentProgress, 0), 1),
    overallProgress,
    /** Seconds spent inside the current segment — what the paced circle reads. */
    segmentElapsed: Math.max(0, elapsedInSegment),
    /** 0–1 through the current exercise, and the whole seconds it has left. */
    stepProgress:
      stepTotalSeconds > 0 ? Math.min(1, Math.max(0, elapsedInStep / stepTotalSeconds)) : 0,
    stepSecondsLeft: Math.max(0, Math.ceil(stepTotalSeconds - elapsedInStep)),
    /**
     * Guided seconds actually completed, for the session log. A skipped
     * exercise contributes nothing and a repeated one counts twice, because
     * this is the time she practiced rather than how far through the template
     * she got — `overallProgress` is the one that tracks position.
     */
    completedSeconds,
    totalSeconds,
    /** True once there is an earlier exercise to go back to. */
    canGoBack: stepIndex > 0,
    /** True while the clock is on a rest between reps, running or paused. */
    isResting: segment?.kind === 'rest',
    startStep,
    pause,
    resume,
    skipRest,
    restartStep: startStep,
    previousStep,
    skipStep: leaveStep,
    finishNow,
  };
}
