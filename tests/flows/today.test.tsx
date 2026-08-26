import { fireEvent, renderRouter, screen, waitFor, within } from 'expo-router/testing-library';

import { seed } from '../helpers';

describe('Today', () => {
  it('shows the stage and a card per program for the current week', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/' });

    await waitFor(() => expect(screen.getByText('Week 20')).toBeOnTheScreen());
    // The banner names the week band, which all three programs share.
    expect(screen.getByText('Build')).toBeOnTheScreen();

    expect(screen.getByTestId('program-card-pelvic-floor')).toBeOnTheScreen();
    expect(screen.getByTestId('program-card-core')).toBeOnTheScreen();
    expect(screen.getByTestId('program-card-birth-prep')).toBeOnTheScreen();

    // Every card offers its own session, and none is done yet.
    expect(screen.getAllByText('Start session')).toHaveLength(3);
    expect(screen.queryByText(/done today/)).not.toBeOnTheScreen();
  });

  it('gives the three programs different sessions on the same day', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/' });

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());

    // Each card's header label is "<program>, <session>, <duration>". Comparing
    // the session part catches the rotation running in lockstep, which is what
    // happens when three equal-length variant lists share one day index.
    const sessions = ['pelvic-floor', 'core', 'birth-prep'].map((id) => {
      const card = screen.getByTestId(`program-card-${id}`);
      const header = within(card).getAllByRole('button')[0];
      return String(header?.props.accessibilityLabel).split(', ')[1];
    });

    expect(sessions.every(Boolean)).toBe(true);
    expect(new Set(sessions).size).toBe(3);
  });

  it('keeps each card collapsed until it is tapped', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/' });

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());
    expect(screen.queryByTestId('program-steps-core')).not.toBeOnTheScreen();

    const card = screen.getByTestId('program-card-core');
    fireEvent.press(within(card).getByLabelText(/^Core,/));

    await waitFor(() => expect(screen.getByTestId('program-steps-core')).toBeOnTheScreen());
    // The other two stay closed — expanding is per card.
    expect(screen.queryByTestId('program-steps-pelvic-floor')).not.toBeOnTheScreen();
  });

  it('drops the steps from the tree once a card has closed again', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/' });

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());

    const card = screen.getByTestId('program-card-core');
    const header = within(card).getByLabelText(/^Core,/);

    fireEvent.press(header);
    await waitFor(() => expect(screen.getByTestId('program-steps-core')).toBeOnTheScreen());

    // The reveal animates, so the steps outlive the tap that closes them — but
    // only until it finishes. Leaving them mounted would keep five invisible
    // buttons in the accessibility tree under a collapsed card.
    fireEvent.press(header);
    await waitFor(() =>
      expect(screen.queryByTestId('program-steps-core')).not.toBeOnTheScreen()
    );
  });
});
