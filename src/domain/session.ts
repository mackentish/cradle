import { now } from '@/lib/clock';
import { dayIndex } from '@/lib/date';

import { getExercise } from './exercises';
import type {
  Exercise,
  Segment,
  SegmentKind,
  SessionTemplate,
  Stage,
  Step,
} from './types';

/**
 * Release-focused exercises use opening language for the same four phases —
 * telling someone to "lift" during perineal bulging would be exactly backwards.
 */
const labels: Record<SegmentKind, Record<'default' | 'release', string>> = {
  lift: { default: 'Lift', release: 'Soften' },
  hold: { default: 'Hold', release: 'Open' },
  release: { default: 'Release', release: 'Let go' },
  rest: { default: 'Rest', release: 'Rest' },
  duration: { default: 'Breathe', release: 'Breathe' },
};

function labelFor(kind: SegmentKind, exercise: Exercise): string {
  return labels[kind][exercise.kind === 'release' ? 'release' : 'default'];
}

/** Expands a step into the ordered timer segments the player counts down. */
export function buildSegments(step: Step): Segment[] {
  const exercise = getExercise(step.exerciseId);

  if (step.type === 'hold') {
    return [
      {
        kind: 'duration',
        label: labelFor('duration', exercise),
        seconds: step.durationSec,
        repIndex: null,
        repTotal: null,
      },
    ];
  }

  const segments: Segment[] = [];
  for (let rep = 0; rep < step.reps; rep += 1) {
    const isLast = rep === step.reps - 1;
    const phases: Array<[SegmentKind, number]> = [
      ['lift', step.liftSec],
      ['hold', step.holdSec],
      ['release', step.releaseSec],
      // The trailing rest after the final rep is dead time — skip it.
      ['rest', isLast ? 0 : step.restSec],
    ];
    for (const [kind, seconds] of phases) {
      if (seconds <= 0) continue;
      segments.push({
        kind,
        label: labelFor(kind, exercise),
        seconds,
        repIndex: rep,
        repTotal: step.reps,
      });
    }
  }
  return segments;
}

export function stepSeconds(step: Step): number {
  return buildSegments(step).reduce((total, segment) => total + segment.seconds, 0);
}

export function sessionSeconds(session: SessionTemplate): number {
  return session.steps.reduce((total, step) => total + stepSeconds(step), 0);
}

export function describeStep(step: Step): string {
  if (step.type === 'hold') {
    const minutes = Math.round(step.durationSec / 60);
    return step.durationSec >= 60 && step.durationSec % 60 === 0
      ? `${minutes} min`
      : `${step.durationSec}s`;
  }
  const exercise = getExercise(step.exerciseId);
  // "8 × 1s hold" is a silly way to describe a quick flick.
  if (exercise.kind === 'quick') return `${step.reps} quick reps`;
  if (exercise.kind === 'release') return `${step.reps} × ${step.holdSec}s open`;
  return `${step.reps} × ${step.holdSec}s hold`;
}

/**
 * Rotates through a stage's session variants by calendar day, so the same day
 * always yields the same session and consecutive days differ.
 */
export function sessionForDay(stage: Stage, date: Date = now()): SessionTemplate {
  const index = Math.abs(dayIndex(date)) % stage.sessions.length;
  return stage.sessions[index] ?? stage.sessions[0];
}
