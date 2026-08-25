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

  /**
   * Stops the clock and moves to the next step's intro, or ends the session if
   * that was the last one. Reached both by finishing a step and by skipping it.
   */
  const leaveStep = useCallback(() => {
    clearTimer();
    deadlineRef.current = null;
    if (stepIndex + 1 < session.steps.length) {
      setStepIndex(stepIndex + 1);
      setSegmentIndex(0);
      setRemainingMs(0);
      setStatus('intro');
    } else {
      setStatus('complete');
    }
  }, [clearTimer, session.steps.length, stepIndex]);

  /** Called when a segment's clock runs out. */
  const advance = useCallback(() => {
    const finished = segments[segmentIndex];
    setCompletedSeconds((current) => current + (finished?.seconds ?? 0));

    const nextIndex = segmentIndex + 1;
    if (nextIndex < segments.length) {
      Haptics.selectionAsync().catch(() => {});
      beginSegment(nextIndex);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    leaveStep();
  }, [beginSegment, leaveStep, segmentIndex, segments]);

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
    /** Guided seconds actually completed, for the session log. */
    completedSeconds,
    totalSeconds,
    startStep,
    pause,
    resume,
    skipStep: leaveStep,
    finishNow,
  };
}
