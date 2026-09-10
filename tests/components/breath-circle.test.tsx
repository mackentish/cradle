import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

import { BreathCircle } from '@/components/BreathCircle';
import { colors } from '@/theme';

import { accessibilityDouble } from '../doubles/accessibility';

/**
 * The circle is a plain function of `fill` — it owns no clock and no animation,
 * which is what lets the player's own tick drive it. So all there is to check is
 * that it grows with `fill`, and that Reduce Motion stops it moving.
 */
describe('BreathCircle', () => {
  const circle = (fill: number) =>
    render(
      <BreathCircle
        testID="breath-circle"
        fill={fill}
        size={200}
        color={colors.primarySoft}
        borderColor={colors.primarySoftBorder}
      />
    );

  const scaleOf = (view: ReturnType<typeof circle>): number => {
    const style = StyleSheet.flatten(view.getByTestId('breath-circle').props.style) as {
      transform?: Array<{ scale?: number }>;
    };
    const scale = style.transform?.[0]?.scale;
    if (scale === undefined) throw new Error('the circle rendered without a scale');
    return scale;
  };

  /** Reduce Motion arrives on a promise, so an animated scale is one tick away. */
  const settled = async (fill: number) => {
    const view = circle(fill);
    await waitFor(() => expect(view.queryByTestId('breath-circle')).toBeOnTheScreen());
    return view;
  };

  it('grows as the in-breath goes on', async () => {
    const empty = scaleOf(await settled(0));
    const half = scaleOf(await settled(0.5));
    const full = scaleOf(await settled(1));

    expect(full).toBeGreaterThan(half);
    expect(half).toBeGreaterThan(empty);
  });

  it('never shrinks away to nothing', async () => {
    // An out-breath ends at empty lungs, not at an empty screen — a circle that
    // vanishes reads as the exercise having stopped.
    expect(scaleOf(await settled(0))).toBeGreaterThan(0.25);
  });

  it('holds still when Reduce Motion is on', async () => {
    accessibilityDouble.reduceMotion = true;

    const empty = await settled(0);
    const full = await settled(1);

    // The label above it still says which way the breath is going, which is more
    // than can be said for confetti.
    expect(scaleOf(full)).toBe(scaleOf(empty));
  });

  it('holds still until it knows whether motion is allowed', async () => {
    // Unknown counts as on, so it cannot pulse once before finding out.
    const view = circle(1);
    const beforeItKnows = scaleOf(view);

    await waitFor(() => expect(scaleOf(view)).toBeGreaterThan(beforeItKnows));
  });
});
