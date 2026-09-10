import { act, renderHook } from '@testing-library/react-native';

import type { SessionTemplate } from '@/domain/types';
import { useSessionPlayer } from '@/hooks/useSessionPlayer';

/**
 * The player's timing is the one part of a session no screen test can reach:
 * driving it needs a controlled clock, and the flow tests mount the whole
 * router, which does not survive Jest's fake timers. So pause, resume and
 * starting over are pinned here, against a hand-built template rather than
 * whatever the day rotation happens to pick.
 */
const template: SessionTemplate = {
  id: 'test-session',
  title: 'Two Exercises',
  steps: [
    // Three segments: lift 2, hold 6, release 3. No trailing rest on a last rep.
    {
      type: 'reps',
      exerciseId: 'long-hold',
      reps: 1,
      liftSec: 2,
      holdSec: 6,
      releaseSec: 3,
      restSec: 8,
    },
    { type: 'hold', exerciseId: 'full-release', durationSec: 45 },
  ],
};

/**
 * The same exercise at two reps, which is the only way to get a rest segment:
 * `buildSegments` drops the trailing rest after a last rep, so the one-rep
 * template above has none at all.
 */
const withRest: SessionTemplate = {
  id: 'test-session-rest',
  title: 'Two Reps',
  steps: [
    // Seven segments: lift 2, hold 6, release 3, rest 8, then lift 2, hold 6, release 3.
    {
      type: 'reps',
      exerciseId: 'long-hold',
      reps: 2,
      liftSec: 2,
      holdSec: 6,
      releaseSec: 3,
      restSec: 8,
    },
    { type: 'hold', exerciseId: 'full-release', durationSec: 45 },
  ],
};

const player = (session: SessionTemplate = template) =>
  renderHook(() => useSessionPlayer(session));

/**
 * Runs the clock forward the way the interval sees it. One segment boundary per
 * call: React only commits at the end of an `act`, so the interval callback
 * inside a single call keeps the `segmentIndex` it was created with and would
 * land on the same segment twice. Walking a rep takes one `tick` per phase.
 */
const tick = (ms: number) => act(() => jest.advanceTimersByTime(ms));

/** Three steps, so going back can be pressed more than once. */
const threeSteps: SessionTemplate = {
  id: 'test-session-three',
  title: 'Three Exercises',
  steps: [
    { type: 'hold', exerciseId: 'full-release', durationSec: 30 },
    { type: 'hold', exerciseId: 'connection-breath', durationSec: 45 },
    { type: 'hold', exerciseId: 'diaphragmatic-breath', durationSec: 60 },
  ],
};

/** Runs a started `withRest` rep out to the rest that follows it. */
const toRest = (result: { current: ReturnType<typeof useSessionPlayer> }) => {
  tick(2000);
  tick(6000);
  tick(3000);
  expect(result.current.segment?.label).toBe('Rest');
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('the session player', () => {
  it('counts a segment down and rolls into the next one', () => {
    const { result } = player();
    act(() => result.current.startStep());

    expect(result.current.segment?.label).toBe('Lift');
    expect(result.current.secondsLeft).toBe(2);

    tick(2000);
    expect(result.current.segment?.label).toBe('Hold');
    expect(result.current.secondsLeft).toBe(6);
  });

  it('holds the countdown where it stands while paused', () => {
    const { result } = player();
    act(() => result.current.startStep());
    tick(1000);
    expect(result.current.secondsLeft).toBe(1);

    act(() => result.current.pause());
    tick(10_000);

    // Ten seconds of a two second segment passed, and it has not budged.
    expect(result.current.status).toBe('paused');
    expect(result.current.secondsLeft).toBe(1);
    expect(result.current.segment?.label).toBe('Lift');
  });

  it('picks the countdown up from where it was paused', () => {
    const { result } = player();
    act(() => result.current.startStep());
    tick(4000); // Through the lift, two seconds into the six second hold.
    act(() => result.current.pause());
    tick(10_000);
    act(() => result.current.resume());

    expect(result.current.status).toBe('running');
    expect(result.current.secondsLeft).toBe(4);
    tick(1000);
    expect(result.current.secondsLeft).toBe(3);
  });

  it('starts the exercise over from its first segment', () => {
    const { result } = player();
    act(() => result.current.startStep());
    tick(4000);
    expect(result.current.segment?.label).toBe('Hold');

    act(() => result.current.restartStep());

    expect(result.current.segment?.label).toBe('Lift');
    expect(result.current.secondsLeft).toBe(2);
    expect(result.current.stepIndex).toBe(0);
    // The clock is running again, not waiting on another tap.
    expect(result.current.status).toBe('running');
    tick(1000);
    expect(result.current.secondsLeft).toBe(1);
  });

  it('starts over from paused, and runs', () => {
    const { result } = player();
    act(() => result.current.startStep());
    tick(4000);
    act(() => result.current.pause());

    act(() => result.current.restartStep());

    expect(result.current.status).toBe('running');
    expect(result.current.secondsLeft).toBe(2);
    tick(1000);
    expect(result.current.secondsLeft).toBe(1);
  });

  it('goes back to the previous exercise, at its intro', () => {
    const { result } = player();
    act(() => result.current.skipStep());
    expect(result.current.stepIndex).toBe(1);
    act(() => result.current.startStep());
    tick(3000);

    act(() => result.current.previousStep());

    expect(result.current.stepIndex).toBe(0);
    expect(result.current.status).toBe('intro');
    // Stopped, not counting down in the background.
    tick(10_000);
    expect(result.current.status).toBe('intro');
    expect(result.current.stepIndex).toBe(0);
  });

  it('goes back from a paused clock, and runs when she starts again', () => {
    const { result } = player();
    act(() => result.current.skipStep());
    act(() => result.current.startStep());
    tick(3000);
    act(() => result.current.pause());

    act(() => result.current.previousStep());
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.status).toBe('intro');

    // `pause` empties the deadline, so this is the path that would leave the
    // clock armed at nothing if `goToStep` and `startStep` disagreed about it.
    act(() => result.current.startStep());
    expect(result.current.status).toBe('running');
    expect(result.current.secondsLeft).toBe(2);
    tick(1000);
    expect(result.current.secondsLeft).toBe(1);
  });

  it('walks back one exercise at a time, and stops at the first', () => {
    const { result } = player(threeSteps);
    act(() => result.current.skipStep());
    act(() => result.current.skipStep());
    expect(result.current.stepIndex).toBe(2);

    act(() => result.current.previousStep());
    expect(result.current.stepIndex).toBe(1);

    act(() => result.current.previousStep());
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.canGoBack).toBe(false);

    // Nowhere left to go, and the last press is not an error.
    act(() => result.current.previousStep());
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.status).toBe('intro');
  });

  it('has nowhere to go back to from the first exercise', () => {
    const { result } = player();
    expect(result.current.canGoBack).toBe(false);

    act(() => result.current.previousStep());
    expect(result.current.stepIndex).toBe(0);

    act(() => result.current.skipStep());
    expect(result.current.canGoBack).toBe(true);
  });

  it('flags the rest between reps, and nothing else', () => {
    const { result } = player(withRest);
    act(() => result.current.startStep());
    expect(result.current.isResting).toBe(false);

    tick(2000); // Lift done.
    tick(6000); // Hold done.
    expect(result.current.segment?.label).toBe('Release');
    expect(result.current.isResting).toBe(false);

    tick(3000);
    expect(result.current.segment?.label).toBe('Rest');
    expect(result.current.isResting).toBe(true);
  });

  it('ends the rest early and starts the next rep', () => {
    const { result } = player(withRest);
    act(() => result.current.startStep());
    toRest(result); // Straight through the first rep, onto its rest.
    expect(result.current.segment?.label).toBe('Rest');
    expect(result.current.secondsLeft).toBe(8);

    tick(3000);
    act(() => result.current.skipRest());

    // Rep two, from its first segment, already counting down.
    expect(result.current.segment?.label).toBe('Lift');
    expect(result.current.segment?.repIndex).toBe(1);
    expect(result.current.secondsLeft).toBe(2);
    expect(result.current.status).toBe('running');
    tick(1000);
    expect(result.current.secondsLeft).toBe(1);
  });

  it('credits the rest she took and not the rest she skipped', () => {
    const { result } = player(withRest);
    act(() => result.current.startStep());
    toRest(result);
    expect(result.current.completedSeconds).toBe(11);

    tick(3000);
    act(() => result.current.skipRest());

    // Three of the eight seconds of rest, not eight and not none.
    expect(result.current.completedSeconds).toBe(14);
  });

  it('does nothing when the clock is not on a rest', () => {
    const { result } = player(withRest);
    act(() => result.current.startStep());
    tick(4000); // Two seconds into the hold.

    act(() => result.current.skipRest());

    expect(result.current.segment?.label).toBe('Hold');
    expect(result.current.secondsLeft).toBe(4);
  });

  /**
   * What the paced view reads instead of the segment clock: the exercise timed
   * end to end, so the arc can hold still while the circle inside it moves.
   * Step one here is one rep of lift 2, hold 6, release 3 — eleven seconds.
   */
  it('times the exercise as a whole alongside the phase', () => {
    const { result } = player();
    act(() => result.current.startStep());

    expect(result.current.stepSecondsLeft).toBe(11);
    expect(result.current.stepProgress).toBe(0);
    expect(result.current.segmentElapsed).toBe(0);

    tick(2000); // The lift is done; the hold is only starting.
    expect(result.current.secondsLeft).toBe(6);
    expect(result.current.stepSecondsLeft).toBe(9);
    expect(result.current.segmentElapsed).toBe(0);

    tick(1000); // A second into the hold, three into the exercise.
    expect(result.current.segmentElapsed).toBe(1);
    expect(result.current.stepSecondsLeft).toBe(8);
    expect(result.current.stepProgress).toBeCloseTo(3 / 11);
  });

  it('rewinds the exercise clock when she goes back to the intro', () => {
    const { result } = player();
    act(() => result.current.startStep());
    tick(2000);
    expect(result.current.stepProgress).toBeGreaterThan(0);

    act(() => result.current.restartStep());

    // The circle starts from the top of the exercise, same as the count does.
    expect(result.current.stepProgress).toBe(0);
    expect(result.current.stepSecondsLeft).toBe(11);
    expect(result.current.segmentElapsed).toBe(0);
  });

  it('counts a repeated exercise twice over, and a skipped one not at all', () => {
    const { result } = player();
    act(() => result.current.startStep());
    tick(2000); // Lift done.
    expect(result.current.completedSeconds).toBe(2);

    act(() => result.current.restartStep());
    tick(2000); // And again — she practiced those seconds either way.
    expect(result.current.completedSeconds).toBe(4);

    act(() => result.current.skipStep());
    act(() => result.current.skipStep());
    expect(result.current.status).toBe('complete');
    expect(result.current.completedSeconds).toBe(4);
  });
});
