import { now } from '@/lib/clock';
import { dayIndex } from '@/lib/date';

import { getExercise } from './exercises';
import type {
  Exercise,
  ProgramId,
  Segment,
  SegmentKind,
  SessionTemplate,
  Stage,
  Step,
} from './types';

/**
 * Release-focused exercises use opening language for the same four phases —
 * telling someone to "lift" during perineal bulging would be exactly backwards.
 * Stretches get the same treatment for the same reason.
 */
const labels: Record<SegmentKind, Record<'default' | 'release', string>> = {
  lift: { default: 'Lift', release: 'Soften' },
  hold: { default: 'Hold', release: 'Open' },
  release: { default: 'Release', release: 'Let go' },
  rest: { default: 'Rest', release: 'Rest' },
  duration: { default: 'Breathe', release: 'Breathe' },
};

function opensRatherThanLifts(exercise: Exercise): boolean {
  return exercise.kind === 'release' || exercise.kind === 'stretch';
}

function labelFor(kind: SegmentKind, exercise: Exercise): string {
  return labels[kind][opensRatherThanLifts(exercise) ? 'release' : 'default'];
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

/**
 * Whether the player paces this step with a circle that grows and shrinks,
 * instead of sweeping a fresh arc for each phase. Two kinds of step earn it:
 *
 *   - one whose work *is* the breath, which is what a `breath` cadence on the
 *     exercise declares. A minute of "Breathe" over an arc creeping around once
 *     never said when to breathe in; the circle does nothing else.
 *   - a rep step short enough that a per-phase arc is a strobe. Quick flicks run
 *     1s up, 1s held, 1s down: the ring sweeps a full turn and resets before her
 *     eye lands on it, and the number under it only ever reads 1.
 *
 * The arc still turns either way — it just times the exercise as a whole, so
 * nothing on the screen is flickering at the phase.
 *
 * Deliberately strict about which rep steps qualify: the knack and short holds
 * lift in a second too, but they *hold* for two or three, and the number
 * counting that hold down is the thing she is working to. Only a step with no
 * phase longer than a second has nothing to lose.
 */
export function isPacedStep(step: Step): boolean {
  if (step.type === 'hold') return getExercise(step.exerciseId).breath !== undefined;
  return step.liftSec <= 1 && step.holdSec <= 1 && step.releaseSec <= 1;
}

export type PaceState = {
  /** 0 where the circle is smallest, 1 at full radius. */
  fill: number;
  /** What she should be doing right now, shown inside the circle. */
  label: string;
};

/**
 * Where the paced circle sits and what it says, from the seconds spent so far
 * in the current segment.
 *
 * Derived from the clock the arc and the countdown already run on rather than
 * animated on a timer of its own, which is what makes pausing freeze it, going
 * back rewind it and a screen test able to read it. A breathing step has one
 * long segment and loops the cadence inside it; a rep step already has its
 * phases, so the circle just follows them — out on the lift, back in on the
 * release, and small through the rest.
 */
export function paceState(step: Step, segment: Segment, elapsedSec: number): PaceState {
  const elapsed = Math.max(0, elapsedSec);
  const { breath } = getExercise(step.exerciseId);

  if (segment.kind === 'duration' && breath) {
    const cycle = breath.inSec + breath.outSec;
    const atCycle = elapsed % cycle;
    return atCycle < breath.inSec
      ? { fill: atCycle / breath.inSec, label: breath.inLabel }
      : { fill: 1 - (atCycle - breath.inSec) / breath.outSec, label: breath.outLabel };
  }

  const progress = segment.seconds > 0 ? Math.min(1, elapsed / segment.seconds) : 0;
  const fill = { lift: progress, release: 1 - progress, rest: 0, hold: 1, duration: 1 }[
    segment.kind
  ];
  return { fill, label: segment.label };
}

/**
 * What the timer is about to do, for the intro card — the answer to "what am I
 * tapping into", written before she taps rather than discovered a second after.
 * Only paced steps have anything surprising to explain; everything else counts
 * one phase down at a time, which the header already spells out.
 */
export function describePacing(step: Step): string | null {
  if (!isPacedStep(step)) return null;

  if (step.type === 'reps') {
    const perRep = step.liftSec + step.holdSec + step.releaseSec;
    return (
      `This one moves fast: ${step.reps} reps of about ${perRep} seconds. The circle jumps out ` +
      'as you lift and drops as you let go, and the ring around it counts the whole set down — ' +
      'so there is no one second number to chase.'
    );
  }

  // A paced hold step is by definition one with a cadence, so this is present.
  const { breath } = getExercise(step.exerciseId);
  if (!breath) return null;
  return (
    `A circle sets the pace rather than a countdown: breathe in over ${breath.inSec} seconds ` +
    `as it grows, out over ${breath.outSec} as it shrinks, and let it keep looping. ` +
    'The ring around it counts the whole exercise down, not each breath.'
  );
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
  if (opensRatherThanLifts(exercise)) return `${step.reps} × ${step.holdSec}s open`;
  return `${step.reps} × ${step.holdSec}s hold`;
}

/**
 * A stable per-program offset. Without it, three programs with the same number of
 * session variants pick the same letter every single day — she would get variant
 * A of all three, then variant B of all three, forever. Pelvic floor's offset is
 * zero so its rotation is exactly what it has always been.
 */
const PROGRAM_OFFSET: Record<ProgramId, number> = {
  'pelvic-floor': 0,
  core: 1,
  'birth-prep': 2,
};

/**
 * Rotates through a stage's session variants by calendar day, so the same day
 * always yields the same session and consecutive days differ.
 */
export function sessionForDay(stage: Stage, date: Date = now()): SessionTemplate {
  const offset = dayIndex(date) + PROGRAM_OFFSET[stage.programId];
  const index = Math.abs(offset) % stage.sessions.length;
  return stage.sessions[index] ?? stage.sessions[0];
}
