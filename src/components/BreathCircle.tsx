import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { radius } from '@/theme';

type BreathCircleProps = Readonly<{
  /** 0 at its smallest, 1 at full radius — `paceState` in `domain/session`. */
  fill: number;
  /** Diameter at `fill` 1. */
  size: number;
  color: string;
  borderColor: string;
  testID?: string;
}>;

/**
 * How small it gets at `fill` 0, as a fraction of `size`. Never all the way to
 * nothing: an out-breath ends at empty lungs, not at an empty screen, and a
 * circle that vanishes reads as the exercise stopping.
 */
const SMALLEST = 0.5;

/** Where it sits when motion is off, between the two extremes. */
const STILL = 0.75;

/**
 * The circle inside the session ring, on the exercises the player paces rather
 * than counts down — it grows through the in-breath and shrinks through the out.
 * Purely a function of `fill`, which comes off the player's own clock, so it
 * freezes when she pauses and rewinds when she goes back without knowing that
 * either happened.
 *
 * Scaled rather than resized: a transform costs no layout pass, and this
 * re-renders on every tick of the session.
 *
 * With Reduce Motion on it holds still and the label above it carries the pace
 * instead. That loses the nicest part, but the words say the same thing, which
 * is more than can be said for confetti.
 */
export function BreathCircle({ fill, size, color, borderColor, testID }: BreathCircleProps) {
  const reduceMotion = useReduceMotion();
  // Unknown counts as on, so it can't pulse once before finding out.
  const clamped = reduceMotion === false ? Math.min(Math.max(fill, 0), 1) : STILL;
  const scale = SMALLEST + (1 - SMALLEST) * clamped;

  return (
    <View style={styles.center} pointerEvents="none">
      <View
        testID={testID}
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            backgroundColor: color,
            borderColor,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Absolute, so the label and the countdown lay themselves out over the top of
  // it rather than beside it.
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
