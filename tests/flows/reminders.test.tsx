import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { notificationDouble } from '../doubles/notifications';
import { dueDateForWeek, seed } from '../helpers';

describe('reminders', () => {
  beforeEach(() => notificationDouble.reset());

  it('schedules one repeating reminder when switched on, and clears it when off', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/reminders' });

    await waitFor(() => expect(screen.getByTestId('reminders-screen')).toBeOnTheScreen());
    expect(screen.getByText('Off')).toBeOnTheScreen();
    expect(notificationDouble.scheduled).toHaveLength(0);

    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
    // The contract that matters: one daily trigger at the saved time.
    expect(notificationDouble.scheduled[0]?.trigger).toMatchObject({
      type: 'daily',
      hour: 9,
      minute: 0,
    });
    await waitFor(() => expect(screen.getByText(/Every day at/)).toBeOnTheScreen());

    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', false);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(0));
    expect(screen.getByText('Off')).toBeOnTheScreen();
  });

  it('takes its wording from the current stage', async () => {
    // Week 38 is the birth-prep stage, where telling her to build strength
    // would be the wrong advice.
    await seed({ profile: { dueDate: dueDateForWeek(38) } });
    renderRouter('app', { initialUrl: '/reminders' });

    await waitFor(() => expect(screen.getByTestId('reminders-screen')).toBeOnTheScreen());
    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
    expect(notificationDouble.scheduled[0]?.content).toMatchObject({
      title: 'Practice opening',
    });
  });

  it('does not claim to be on when permission is refused', async () => {
    notificationDouble.permission = 'denied';
    await seed();
    renderRouter('app', { initialUrl: '/reminders' });

    await waitFor(() => expect(screen.getByTestId('reminders-screen')).toBeOnTheScreen());
    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    // The switch stays off rather than reading as on while the OS drops everything.
    await waitFor(() => expect(screen.getByText('Off')).toBeOnTheScreen());
    expect(notificationDouble.scheduled).toHaveLength(0);
  });
});
