import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

import { Confetti } from '@/components/Confetti';
import { accessibilityDouble } from '../doubles/accessibility';

describe('Confetti', () => {
  // The overlay is deliberately hidden from accessibility, so the queries have to
  // opt in — otherwise "no pieces found" would pass even when 120 are on screen.
  const options = { includeHiddenElements: true };

  it('renders one view per piece', async () => {
    const view = render(<Confetti count={12} />);
    await waitFor(() => expect(view.getAllByTestId('confetti-piece', options)).toHaveLength(12));
  });

  it('defaults to a full shower', async () => {
    const view = render(<Confetti />);
    await waitFor(() => expect(view.getAllByTestId('confetti-piece', options)).toHaveLength(120));
  });

  it('sits out entirely when Reduce Motion is on', async () => {
    accessibilityDouble.reduceMotion = true;

    const view = render(<Confetti count={12} />);

    // Not one frame of it, which is why the component waits to know before it
    // renders anything at all.
    await waitFor(() => expect(view.queryAllByTestId('confetti-piece', options)).toHaveLength(0));
    expect(view.queryAllByTestId('confetti-piece', options)).toHaveLength(0);
  });
});
