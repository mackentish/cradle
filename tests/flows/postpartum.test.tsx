import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { seed } from '../helpers';

describe('the postpartum switch', () => {
  it('moves the whole programme to recovery once a birth date is set', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/(tabs)/you' });

    await waitFor(() => expect(screen.getByText('Baby has arrived')).toBeOnTheScreen());
    fireEvent.press(screen.getByText('Baby has arrived'));

    await waitFor(() => expect(screen.getByText('Congratulations')).toBeOnTheScreen());
    // The screen defaults to today, which is the common case.
    expect(screen.getByText('Starting in Recover')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText('Postpartum programme')).toBeOnTheScreen());

    fireEvent.press(screen.getByLabelText(/Today, tab/));

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());
    expect(screen.getByText('Day one')).toBeOnTheScreen();
    expect(screen.getByText('Recover')).toBeOnTheScreen();
    // Recovery is breath and rest, not a strength programme.
    expect(screen.getByText(/Nothing to train yet/)).toBeOnTheScreen();
  });
});
