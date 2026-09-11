import { fireEvent, renderRouter, screen, waitFor, within } from 'expo-router/testing-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { daysAgo, seed, sessionLog } from '../helpers';

/** Steps through the intro screens until the session finishes. */
function skipEveryStep() {
  for (let guard = 0; guard < 16; guard += 1) {
    const skip = screen.queryByText('Skip this one');
    if (!skip) return;
    fireEvent.press(skip);
  }
  throw new Error('session never completed');
}

describe('a guided session', () => {
  it('runs from Today to the celebration and logs the result', async () => {
    // Two days already logged, so finishing today makes it three in a row.
    await seed({
      logs: [sessionLog({ day: daysAgo(1) }), sessionLog({ day: daysAgo(2) })],
    });
    renderRouter('app', { initialUrl: '/' });

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());
    // Three cards each have a Start button now, so scope the press to one.
    const card = screen.getByTestId('program-card-pelvic-floor');
    fireEvent.press(within(card).getByText('Start session'));

    // Every session opens on its first exercise's intro. How many steps it has
    // depends on which one the rotation served, so match the count loosely.
    await waitFor(() => expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen());
    expect(screen.getByText('Get into position')).toBeOnTheScreen();
    expect(screen.getByText('How to')).toBeOnTheScreen();

    // Starting a step swaps the intro for the timer.
    fireEvent.press(screen.getByText("I'm ready"));
    await waitFor(() => expect(screen.getByText('Pause')).toBeOnTheScreen());
    expect(screen.queryByText("I'm ready")).not.toBeOnTheScreen();

    fireEvent.press(screen.getByText('Skip step'));
    await waitFor(() => expect(screen.getByText(/Step 2 of \d+/)).toBeOnTheScreen());

    skipEveryStep();

    await waitFor(() => expect(screen.getByTestId('session-complete')).toBeOnTheScreen());
    expect(screen.getByText('3 days in a row')).toBeOnTheScreen();

    // Nothing is written until she chooses to keep it.
    expect(JSON.parse((await AsyncStorage.getItem('cradle.logs.v1')) ?? '[]')).toHaveLength(2);

    fireEvent.press(screen.getByText('Save and finish'));

    await waitFor(() => expect(screen.getByText('1 of 3 done today ✓')).toBeOnTheScreen());
    const logs = JSON.parse((await AsyncStorage.getItem('cradle.logs.v1')) ?? '[]');
    expect(logs).toHaveLength(3);
    expect(logs[2]).toMatchObject({
      programId: 'pelvic-floor',
      stageId: 'build',
      phase: 'pregnancy',
      week: 20,
    });
  });

  it('discards a session she chooses not to keep', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/session/pelvic-floor' });

    await waitFor(() => expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen());
    skipEveryStep();

    await waitFor(() => expect(screen.getByTestId('session-complete')).toBeOnTheScreen());
    fireEvent.press(screen.getByText('Discard this one'));

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());
    expect(JSON.parse((await AsyncStorage.getItem('cradle.logs.v1')) ?? '[]')).toHaveLength(0);
    expect(screen.queryByText(/done today/)).not.toBeOnTheScreen();
  });

  it('celebrates a first-ever session differently', async () => {
    await seed({ logs: [] });
    renderRouter('app', { initialUrl: '/session/pelvic-floor' });

    await waitFor(() => expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen());
    skipEveryStep();

    await waitFor(() => expect(screen.getByText("That's one")).toBeOnTheScreen());
    expect(screen.getByText(/Showing up was the hard part/)).toBeOnTheScreen();
  });
});

describe('moving around inside a session', () => {
  /** Opens the player and stops on the first exercise's intro. */
  const openPlayer = async () => {
    await seed();
    renderRouter('app', { initialUrl: '/session/pelvic-floor' });
    await waitFor(() => expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen());
  };

  it('offers no way back from the first exercise', async () => {
    await openPlayer();
    expect(screen.queryByLabelText('Previous exercise')).not.toBeOnTheScreen();
  });

  it('goes back to the exercise before this one, at its intro', async () => {
    await openPlayer();
    fireEvent.press(screen.getByText('Skip this one'));
    await waitFor(() => expect(screen.getByText(/Step 2 of \d+/)).toBeOnTheScreen());

    fireEvent.press(screen.getByLabelText('Previous exercise'));

    await waitFor(() => expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen());
    // The intro, not the timer: she gets to read the cues and get back into
    // position before the clock starts again.
    expect(screen.getByText('Get into position')).toBeOnTheScreen();
    expect(screen.getByText("I'm ready")).toBeOnTheScreen();
  });

  it('stops the clock when she goes back mid-exercise', async () => {
    await openPlayer();
    fireEvent.press(screen.getByText('Skip this one'));
    await waitFor(() => expect(screen.getByText(/Step 2 of \d+/)).toBeOnTheScreen());
    fireEvent.press(screen.getByText("I'm ready"));
    await waitFor(() => expect(screen.getByText('Pause')).toBeOnTheScreen());

    // Both running-view controls are there before she leaves it.
    expect(screen.getByText('Start over')).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText('Previous exercise'));

    await waitFor(() => expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen());
    expect(screen.queryByText('Pause')).not.toBeOnTheScreen();
    expect(screen.getByText("I'm ready")).toBeOnTheScreen();
  });

  /**
   * The countdown, read the instant the clock is armed. Which session the
   * rotation serves depends on the real calendar day — these tests set no
   * clock — so nothing here may hardcode a number of seconds. Comparing a
   * later reading against an earlier one is rotation-independent.
   */
  const countdown = () => screen.getByTestId('session-countdown').props.children;

  /** The exercise name over the ring, which is the running step's identity. */
  const runningExercise = () => screen.getByTestId('session-exercise').props.children;

  it('arms the previous exercise’s own clock, not the one she left', async () => {
    await openPlayer();
    fireEvent.press(screen.getByText("I'm ready"));
    await waitFor(() => expect(screen.getByText('Pause')).toBeOnTheScreen());
    const firstExercise = runningExercise();
    const firstCountdown = countdown();

    // Forward to the second exercise and start it, so there is a live clock
    // belonging to the wrong step for going back to pick up by mistake.
    fireEvent.press(screen.getByText('Skip step'));
    await waitFor(() => expect(screen.getByText(/Step 2 of \d+/)).toBeOnTheScreen());
    fireEvent.press(screen.getByText("I'm ready"));
    await waitFor(() => expect(screen.getByText('Pause')).toBeOnTheScreen());

    fireEvent.press(screen.getByLabelText('Previous exercise'));
    await waitFor(() => expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen());
    fireEvent.press(screen.getByText("I'm ready"));

    // Exercise one, from the top of its own first segment.
    expect(runningExercise()).toBe(firstExercise);
    expect(countdown()).toBe(firstCountdown);
  });

  it('starts the exercise over without leaving it', async () => {
    await openPlayer();
    fireEvent.press(screen.getByText("I'm ready"));
    await waitFor(() => expect(screen.getByText('Pause')).toBeOnTheScreen());
    const exercise = runningExercise();
    const fromTheTop = countdown();

    fireEvent.press(screen.getByText('Start over'));

    // Same exercise, same step, counting again rather than parked on the intro
    // — going back to the beginning of an exercise is not leaving it.
    expect(runningExercise()).toBe(exercise);
    expect(countdown()).toBe(fromTheTop);
    expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen();
    expect(screen.getByText('Pause')).toBeOnTheScreen();
    expect(screen.queryByText("I'm ready")).not.toBeOnTheScreen();
  });
});
