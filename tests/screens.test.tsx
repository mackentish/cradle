import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { setNow } from '@/lib/clock';

import { daysAgo, seed, seedNothing, sessionLog } from './helpers';
import { visualTree } from './visual';

/**
 * Snapshots of the main screens, taken from the screen's own subtree so the
 * navigator's internals stay out of the diff.
 *
 * These are render-tree snapshots, not pixel comparisons — but the tree carries
 * resolved styles, so a colour, radius or spacing regression does show up here.
 *
 * The clock is frozen because three things on these screens move with it: the
 * greeting, which session the day-rotation picks, and every formatted date.
 */
describe('screen snapshots', () => {
  // A fixed clock rather than fake timers: freezing Date breaks waitFor, which
  // measures its own timeout with Date.now() and would then never time out.
  beforeEach(() => {
    setNow(new Date('2026-06-15T09:30:00Z'));
  });

  afterEach(() => {
    setNow(null);
  });

  it('welcome', async () => {
    await seedNothing();
    renderRouter('app', { initialUrl: '/' });

    await waitFor(() => expect(screen.getByTestId('welcome-screen')).toBeOnTheScreen());
    expect(visualTree('welcome-screen')).toMatchSnapshot();
  });

  it('today', async () => {
    await seed({ logs: [sessionLog({ day: daysAgo(1) }), sessionLog({ day: daysAgo(2) })] });
    renderRouter('app', { initialUrl: '/(tabs)' });

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());
    expect(visualTree('today-screen')).toMatchSnapshot();
  });

  it('progress', async () => {
    await seed({ logs: [sessionLog({ day: daysAgo(1) }), sessionLog({ day: daysAgo(2) })] });
    renderRouter('app', { initialUrl: '/(tabs)/progress' });

    await waitFor(() => expect(screen.getByTestId('progress-screen')).toBeOnTheScreen());
    expect(visualTree('progress-screen')).toMatchSnapshot();
  });

  it('reminders, switched on', async () => {
    await seed({ profile: { reminders: { enabled: true, hour: 19, minute: 30 } } });
    renderRouter('app', { initialUrl: '/reminders' });

    await waitFor(() => expect(screen.getByTestId('reminders-screen')).toBeOnTheScreen());
    expect(visualTree('reminders-screen')).toMatchSnapshot();
  });

  it('session complete', async () => {
    await seed({ logs: [sessionLog({ day: daysAgo(1) })] });
    renderRouter('app', { initialUrl: '/session' });

    await waitFor(() => expect(screen.getByText(/Step 1 of/)).toBeOnTheScreen());
    for (let guard = 0; guard < 12; guard += 1) {
      const skip = screen.queryByText('Skip this one');
      if (!skip) break;
      fireEvent.press(skip);
    }

    // The confetti is a sibling of this subtree, so 120 animated views stay out
    // of the snapshot while the celebration itself is captured.
    await waitFor(() => expect(screen.getByTestId('session-complete')).toBeOnTheScreen());
    expect(visualTree('session-complete')).toMatchSnapshot();
  });
});
