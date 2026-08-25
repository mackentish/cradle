import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { seed } from '../helpers';

describe('Today', () => {
  it('shows the stage and session for the current week', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/' });

    await waitFor(() => expect(screen.getByText('Week 20')).toBeOnTheScreen());
    expect(screen.getByText('Build')).toBeOnTheScreen();
  });
});
