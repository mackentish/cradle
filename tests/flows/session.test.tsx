import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { daysAgo, seed, sessionLog } from '../helpers';

/** Steps through the intro screens until the session finishes. */
function skipEveryStep() {
  for (let guard = 0; guard < 12; guard += 1) {
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
    fireEvent.press(screen.getByText('Start session'));

    // Every stage's sessions have five steps, and each opens on an intro.
    await waitFor(() => expect(screen.getByText(/Step 1 of 5/)).toBeOnTheScreen());
    expect(screen.getByText('Get into position')).toBeOnTheScreen();
    expect(screen.getByText('How to')).toBeOnTheScreen();

    // Starting a step swaps the intro for the timer.
    fireEvent.press(screen.getByText("I'm ready"));
    await waitFor(() => expect(screen.getByText('Pause')).toBeOnTheScreen());
    expect(screen.queryByText("I'm ready")).not.toBeOnTheScreen();

    fireEvent.press(screen.getByText('Skip step'));
    await waitFor(() => expect(screen.getByText(/Step 2 of 5/)).toBeOnTheScreen());

    skipEveryStep();

    await waitFor(() => expect(screen.getByTestId('session-complete')).toBeOnTheScreen());
    expect(screen.getByText('3 days in a row')).toBeOnTheScreen();

    // Nothing is written until she chooses to keep it.
    expect(JSON.parse((await AsyncStorage.getItem('cradle.logs.v1')) ?? '[]')).toHaveLength(2);

    fireEvent.press(screen.getByText('Save and finish'));

    await waitFor(() => expect(screen.getByText('Today is done ✓')).toBeOnTheScreen());
    const logs = JSON.parse((await AsyncStorage.getItem('cradle.logs.v1')) ?? '[]');
    expect(logs).toHaveLength(3);
    expect(logs[2]).toMatchObject({ stageId: 'build', phase: 'pregnancy', week: 20 });
  });

  it('discards a session she chooses not to keep', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/session' });

    await waitFor(() => expect(screen.getByText(/Step 1 of 5/)).toBeOnTheScreen());
    skipEveryStep();

    await waitFor(() => expect(screen.getByTestId('session-complete')).toBeOnTheScreen());
    fireEvent.press(screen.getByText('Discard this one'));

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());
    expect(JSON.parse((await AsyncStorage.getItem('cradle.logs.v1')) ?? '[]')).toHaveLength(0);
    expect(screen.queryByText('Today is done ✓')).not.toBeOnTheScreen();
  });

  it('celebrates a first-ever session differently', async () => {
    await seed({ logs: [] });
    renderRouter('app', { initialUrl: '/session' });

    await waitFor(() => expect(screen.getByText(/Step 1 of 5/)).toBeOnTheScreen());
    skipEveryStep();

    await waitFor(() => expect(screen.getByText("That's one")).toBeOnTheScreen());
    expect(screen.getByText(/Showing up was the hard part/)).toBeOnTheScreen();
  });
});
