import { fireEvent, renderRouter, screen, waitFor, within } from 'expo-router/testing-library';

import { PROGRAM_SAFETY } from '@/content/safety';

import { seed } from '../helpers';

const STAGE_IDS = [
  'foundation',
  'build',
  'sustain',
  'prepare',
  'recover',
  'reconnect',
  'rebuild',
];

describe('Plan', () => {
  it('lives in the tabs, so it is reachable without going through Today', async () => {
    await seed();
    // The route the tab bar presses. It resolving is what the tab press does;
    // the bar itself does not render under the test renderer.
    renderRouter('app', { initialUrl: '/(tabs)/plan' });

    await waitFor(() => expect(screen.getByTestId('plan-screen')).toBeOnTheScreen());
  });

  it('is still reachable from the banner on Today', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/' });

    await waitFor(() => expect(screen.getByTestId('today-screen')).toBeOnTheScreen());

    fireEvent.press(screen.getByLabelText('Full plan'));
    await waitFor(() => expect(screen.getByTestId('plan-screen')).toBeOnTheScreen());
  });

  it('lists every stage of the selected program, closed', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/plan' });

    await waitFor(() => expect(screen.getByTestId('plan-screen')).toBeOnTheScreen());

    for (const stage of STAGE_IDS) {
      expect(screen.getByTestId(`plan-stage-${stage}`)).toBeOnTheScreen();
      expect(screen.queryByTestId(`plan-stage-detail-${stage}`)).not.toBeOnTheScreen();
    }

    // The stage matching her week is the one marked, closed or not.
    expect(screen.getByText('Now')).toBeOnTheScreen();

    // And the program's safety copy is never behind a chevron.
    const rule = PROGRAM_SAFETY['pelvic-floor'].rules[0] ?? '';
    expect(screen.getByText(`· ${rule}`)).toBeOnTheScreen();
  });

  it('opens one stage at a time and closes it again', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/plan' });

    await waitFor(() => expect(screen.getByTestId('plan-screen')).toBeOnTheScreen());

    const card = screen.getByTestId('plan-stage-build');
    const header = within(card).getByLabelText(/^Build,/);

    fireEvent.press(header);
    await waitFor(() => expect(screen.getByTestId('plan-stage-detail-build')).toBeOnTheScreen());
    // Opening one stage leaves its neighbors alone.
    expect(screen.queryByTestId('plan-stage-detail-prepare')).not.toBeOnTheScreen();

    // The reveal animates, so the detail outlives the tap that closes it — but
    // only until it finishes, or a shut stage keeps its exercise links in the
    // accessibility tree.
    fireEvent.press(header);
    await waitFor(() =>
      expect(screen.queryByTestId('plan-stage-detail-build')).not.toBeOnTheScreen()
    );
  });

  it('opens on the program named in the link', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/plan?program=core' });

    await waitFor(() => expect(screen.getByTestId('plan-program-core')).toBeOnTheScreen());
  });
});
