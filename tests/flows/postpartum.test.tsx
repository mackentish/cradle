import { fireEvent, renderRouter, screen, waitFor, within } from 'expo-router/testing-library';

import { seed } from '../helpers';

describe('the postpartum switch', () => {
  it('moves the whole program to recovery once a birth date is set', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/(tabs)/you' });

    await waitFor(() => expect(screen.getByText('Baby has arrived')).toBeOnTheScreen());
    fireEvent.press(screen.getByText('Baby has arrived'));

    await waitFor(() => expect(screen.getByText('Congratulations')).toBeOnTheScreen());
    // The screen defaults to today, which is the common case.
    expect(screen.getByText('Starting in Recover')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText('Postpartum program')).toBeOnTheScreen());

    fireEvent.press(screen.getByLabelText(/Today, tab/));

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());
    expect(screen.getByText('Day one')).toBeOnTheScreen();
    expect(screen.getByText('Recover')).toBeOnTheScreen();
    // Every program flips, not just the one the app started as.
    expect(screen.getByTestId('program-card-core')).toBeOnTheScreen();
    // Birth prep makes no sense now, so it retitles rather than lingering. Its
    // card and the tracker legend both use the new name, hence the scoping.
    const stretches = screen.getByTestId('program-card-birth-prep');
    expect(within(stretches).getByText('Recovery stretches')).toBeOnTheScreen();
    expect(screen.queryByText('Birth prep')).not.toBeOnTheScreen();
  });
});
