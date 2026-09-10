import { buildSegments, describePacing, isPacedStep, paceState } from '@/domain/session';
import type { Segment, Step } from '@/domain/types';

/**
 * The two ways an exercise gets paced by a circle instead of counted down, and
 * the arithmetic behind the circle itself.
 *
 * Worth pinning here rather than only through the player: `paceState` is a pure
 * function of the seconds elapsed, which is the whole reason the circle needs no
 * animation of its own, and a screen test can only ever catch it at whatever
 * moment the clock happens to be on.
 */
const breath: Step = { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 60 };
const sigh: Step = { type: 'hold', exerciseId: 'birth-breathing', durationSec: 90 };
const stretch: Step = { type: 'hold', exerciseId: 'butterfly-stretch', durationSec: 90 };
const flicks: Step = {
  type: 'reps',
  exerciseId: 'quick-flicks',
  reps: 10,
  liftSec: 1,
  holdSec: 1,
  releaseSec: 1,
  restSec: 3,
};
const knack: Step = {
  type: 'reps',
  exerciseId: 'the-knack',
  reps: 6,
  liftSec: 1,
  holdSec: 2,
  releaseSec: 2,
  restSec: 6,
};

/** One segment of a step, by position — lift, hold, release, rest. */
const segmentAt = (step: Step, index: number): Segment => {
  const segment = buildSegments(step)[index];
  if (!segment) throw new Error(`step has no segment ${index}`);
  return segment;
};

describe('which steps the player paces', () => {
  it('paces a step whose work is the breath, and leaves a stretch alone', () => {
    // The cadence on the exercise is the opt-in. A butterfly stretch is also
    // ninety seconds of breathing, but the breath is not what she is practicing.
    expect(isPacedStep(breath)).toBe(true);
    expect(isPacedStep(sigh)).toBe(true);
    expect(isPacedStep(stretch)).toBe(false);
  });

  it('paces a rep step with no phase longer than a second', () => {
    // Quick flicks are 1s up, 1s held, 1s down: an arc per phase sweeps a whole
    // turn and resets before her eye lands on it.
    expect(isPacedStep(flicks)).toBe(true);
  });

  it('leaves a rep step that holds for longer than a second counting down', () => {
    // The knack lifts in a second too, but it holds for two — and the number
    // counting that hold down is the thing she is working to.
    expect(isPacedStep(knack)).toBe(false);
  });
});

describe('where the paced circle sits', () => {
  const duration = segmentAt(breath, 0);

  it('grows through the in-breath and shrinks through the out', () => {
    expect(paceState(breath, duration, 0)).toEqual({ fill: 0, label: 'Breathe in' });
    expect(paceState(breath, duration, 2).fill).toBe(0.5);
    // Four seconds in is the turn: full, and now on the way out.
    expect(paceState(breath, duration, 4)).toEqual({ fill: 1, label: 'Breathe out' });
    expect(paceState(breath, duration, 7).fill).toBe(0.5);
  });

  it('loops the cadence for as long as the exercise runs', () => {
    // Ten seconds is one whole cycle of this one, so a minute in it is back at
    // the start of an in-breath rather than parked at either end.
    expect(paceState(breath, duration, 10)).toEqual({ fill: 0, label: 'Breathe in' });
    expect(paceState(breath, duration, 52).fill).toBe(0.5);
  });

  it('takes its words from the exercise, not the segment table', () => {
    // "Breathe out" would flatten the one thing an open-throat breath is for.
    const segment = segmentAt(sigh, 0);
    expect(segment.label).toBe('Breathe');
    expect(paceState(sigh, segment, 5).label).toBe('Sigh out');
  });

  it('follows the phases of a rep step it did not have to invent', () => {
    const lift = segmentAt(flicks, 0);
    const hold = segmentAt(flicks, 1);
    const release = segmentAt(flicks, 2);
    const rest = segmentAt(flicks, 3);

    expect(paceState(flicks, lift, 0).fill).toBe(0);
    expect(paceState(flicks, lift, 0.5).fill).toBe(0.5);
    expect(paceState(flicks, hold, 0.5).fill).toBe(1);
    expect(paceState(flicks, release, 0.5).fill).toBe(0.5);
    expect(paceState(flicks, release, 1).fill).toBe(0);
    expect(paceState(flicks, rest, 1.5)).toEqual({ fill: 0, label: 'Rest' });
  });

  it('never leaves the circle outside its own bounds', () => {
    // The clock can overshoot a segment by a tick before the player moves on.
    const lift = segmentAt(flicks, 0);
    expect(paceState(flicks, lift, 4).fill).toBe(1);
    expect(paceState(flicks, segmentAt(flicks, 2), 4).fill).toBe(0);
    expect(paceState(breath, duration, -1).fill).toBe(0);
  });
});

describe('what the intro says the timer will do', () => {
  it('spells the cadence out in seconds, before she taps', () => {
    const copy = describePacing(breath) ?? '';
    expect(copy).toContain('breathe in over 4 seconds');
    expect(copy).toContain('out over 6');
    expect(copy).toContain('counts the whole exercise down');
  });

  it('warns that a fast set is about to be fast', () => {
    const copy = describePacing(flicks) ?? '';
    expect(copy).toContain('10 reps of about 3 seconds');
    expect(copy).toContain('no one second number to chase');
  });

  it('says nothing about a step that just counts down', () => {
    // The header already reads "Stretch · 90s", and there is no more to it.
    expect(describePacing(stretch)).toBeNull();
    expect(describePacing(knack)).toBeNull();
  });
});
