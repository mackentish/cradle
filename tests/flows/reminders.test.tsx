import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { notificationDouble } from '../doubles/notifications';
import { dueDateForWeek, seed } from '../helpers';

describe('reminders', () => {
  beforeEach(() => notificationDouble.reset());

  it('schedules one repeating reminder when switched on, and clears it when off', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/reminders/pelvic-floor' });

    await waitFor(() =>
      expect(screen.getByTestId('reminders-screen-pelvic-floor')).toBeOnTheScreen()
    );
    expect(screen.getByText('Off')).toBeOnTheScreen();
    expect(notificationDouble.scheduled).toHaveLength(0);

    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
    // The contract that matters: one daily trigger at the saved time, filed under
    // this program's own identifier so the other two can be replaced without it.
    expect(notificationDouble.forProgram('pelvic-floor')?.trigger).toMatchObject({
      type: 'daily',
      hour: 9,
      minute: 0,
    });
    await waitFor(() => expect(screen.getByText(/Every day at/)).toBeOnTheScreen());

    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', false);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(0));
    expect(screen.getByText('Off')).toBeOnTheScreen();
  });

  it('takes its wording from the program and the current stage', async () => {
    // Week 38 is the birth-prep stage, where telling her to build strength
    // would be the wrong advice.
    await seed({ profile: { dueDate: dueDateForWeek(38) } });
    renderRouter('app', { initialUrl: '/reminders/pelvic-floor' });

    await waitFor(() =>
      expect(screen.getByTestId('reminders-screen-pelvic-floor')).toBeOnTheScreen()
    );
    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
    expect(notificationDouble.forProgram('pelvic-floor')?.content).toMatchObject({
      title: 'Practice opening',
    });
  });

  it('gives each program its own wording at the same stage', async () => {
    await seed({ profile: { dueDate: dueDateForWeek(38) } });
    renderRouter('app', { initialUrl: '/reminders/core' });

    await waitFor(() => expect(screen.getByTestId('reminders-screen-core')).toBeOnTheScreen());
    expect(screen.getByText('Core')).toBeOnTheScreen();
    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
    // Same stage as the test above, deliberately different advice.
    expect(notificationDouble.forProgram('core')?.content).toMatchObject({
      title: 'Light and practical',
    });
  });

  /**
   * The whole reason reminders carry identifiers now. Switching one program on
   * must not disturb another's — the old implementation canceled everything the
   * app had ever scheduled and put back exactly one.
   */
  it('keeps three independent reminders at three different times', async () => {
    await seed({
      profile: {
        reminders: {
          'pelvic-floor': { enabled: true, hour: 9, minute: 0 },
          core: { enabled: true, hour: 17, minute: 30 },
          'birth-prep': { enabled: false, hour: 20, minute: 0 },
        },
      },
    });
    renderRouter('app', { initialUrl: '/reminders/birth-prep' });

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(2));
    expect(notificationDouble.forProgram('pelvic-floor')?.trigger).toMatchObject({ hour: 9 });
    expect(notificationDouble.forProgram('core')?.trigger).toMatchObject({
      hour: 17,
      minute: 30,
    });
    expect(notificationDouble.forProgram('birth-prep')).toBeUndefined();

    // Turning the third on leaves the other two exactly as they were.
    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(3));
    expect(notificationDouble.forProgram('pelvic-floor')?.trigger).toMatchObject({ hour: 9 });
    expect(notificationDouble.forProgram('core')?.trigger).toMatchObject({ hour: 17 });
    expect(notificationDouble.forProgram('birth-prep')?.trigger).toMatchObject({ hour: 20 });
  });

  /**
   * An install upgrading from the single-program build has a reminder scheduled
   * with an identifier the OS made up, which nothing here can name. Left alone it
   * would fire alongside the new pelvic floor one, every day, forever.
   */
  it('sweeps a reminder left behind by an older build', async () => {
    notificationDouble.scheduled = [
      {
        identifier: 'scheduled-0',
        content: { title: 'Time to build' },
        trigger: { type: 'daily', hour: 7, minute: 30 },
      },
    ];
    await seed({
      profile: {
        reminders: {
          'pelvic-floor': { enabled: true, hour: 7, minute: 30 },
          core: { enabled: false, hour: 17, minute: 0 },
          'birth-prep': { enabled: false, hour: 20, minute: 0 },
        },
      },
    });
    renderRouter('app', { initialUrl: '/reminders/pelvic-floor' });

    // One reminder, not two: the stray is gone and ours took its place.
    await waitFor(() => expect(notificationDouble.forProgram('pelvic-floor')).toBeDefined());
    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
  });

  it('does not claim to be on when permission is refused', async () => {
    notificationDouble.permission = 'denied';
    await seed();
    renderRouter('app', { initialUrl: '/reminders/pelvic-floor' });

    await waitFor(() =>
      expect(screen.getByTestId('reminders-screen-pelvic-floor')).toBeOnTheScreen()
    );
    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    // The switch stays off rather than reading as on while the OS drops everything.
    await waitFor(() => expect(screen.getByText('Off')).toBeOnTheScreen());
    expect(notificationDouble.scheduled).toHaveLength(0);
  });
});
