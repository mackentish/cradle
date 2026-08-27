import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { dueDateForWeek, seedNothing } from '../helpers';

describe('onboarding', () => {
  beforeEach(seedNothing);

  it('walks from welcome through a due date and the safety gate to Today', async () => {
    renderRouter('app', { initialUrl: '/' });

    // A first launch has no profile, so only the onboarding routes exist.
    await waitFor(() => expect(screen.getByTestId('welcome-screen')).toBeOnTheScreen());
    // Pinned on the three-program framing, not just any hero text: this copy fell behind
    // once already, and it is the first screen a store reviewer sees.
    expect(screen.getByText(/Three programs that keep pace/)).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Let's begin"));
    await waitFor(() => expect(screen.getByText('When is baby due?')).toBeOnTheScreen());

    // Twenty weeks out, expressed relative to today so the test cannot rot.
    const [year, month, day] = dueDateForWeek(20).split('-');
    fireEvent.changeText(screen.getByLabelText('MM'), month);
    fireEvent.changeText(screen.getByLabelText('DD'), day);
    fireEvent.changeText(screen.getByLabelText('YYYY'), year);

    // The stage preview is her confirmation that the date was understood.
    await waitFor(() => expect(screen.getByText(/Starting in Build/)).toBeOnTheScreen());
    expect(screen.getByText('Week 20')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Continue'));
    await waitFor(() => expect(screen.getByText('Before you start')).toBeOnTheScreen());
    expect(screen.getByText(/Vaginal bleeding, or fluid leaking/)).toBeOnTheScreen();

    fireEvent.press(screen.getByText('I understand'));

    // Accepting the disclaimer is what unlocks the app's routes.
    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());
    expect(screen.getByText('Week 20')).toBeOnTheScreen();
    expect(screen.getByText('Build')).toBeOnTheScreen();
  });

  it('offers a week count as an alternative to a due date', async () => {
    renderRouter('app', { initialUrl: '/onboarding/due-date' });
    await waitFor(() => expect(screen.getByText('When is baby due?')).toBeOnTheScreen());

    fireEvent.press(screen.getByText('I know my week'));

    // Defaults to 20 weeks, and derives the due date from it.
    await waitFor(() => expect(screen.getByText(/Starting in Build/)).toBeOnTheScreen());
    expect(screen.getByText('20')).toBeOnTheScreen();
    expect(screen.getByText(/That puts your due date around/)).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText('One week earlier'));
    expect(screen.getByText('19')).toBeOnTheScreen();
  });

  it('refuses a date that does not exist', async () => {
    renderRouter('app', { initialUrl: '/onboarding/due-date' });
    await waitFor(() => expect(screen.getByText('When is baby due?')).toBeOnTheScreen());

    fireEvent.changeText(screen.getByLabelText('MM'), '02');
    fireEvent.changeText(screen.getByLabelText('DD'), '31');
    fireEvent.changeText(screen.getByLabelText('YYYY'), String(new Date().getFullYear() + 1));

    await waitFor(() =>
      expect(screen.getByText('That date does not exist — check the day.')).toBeOnTheScreen()
    );
    expect(screen.getByText('Continue')).toBeDisabled();
  });
});
