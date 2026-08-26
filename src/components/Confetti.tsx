import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { palette, radius } from '@/theme';

/** Soft pastels rather than primaries — this should feel like petals, not a party popper. */
const CONFETTI_COLORS: [string, ...string[]] = [
  palette.blush300,
  palette.blush400,
  palette.blush200,
  palette.sage300,
  palette.sage500,
  palette.lavender300,
  palette.lavender500,
];

/** How far above the top a piece starts, and how far below the bottom it exits. */
const SPAWN_ABOVE = 60;
const EXIT_BELOW = 60;

type ConfettiProps = Readonly<{
  count?: number;
  /** How long one piece takes to cross the screen, ms. Controls the speed. */
  fallDuration?: number;
  /**
   * How much of the screen height the shower spans, 0–1, measured at the moment
   * the last piece leaves the top. Coverage is a function of how long pieces keep
   * emitting relative to how long they take to fall — not of how many there are.
   */
  coverage?: number;
}>;

type Piece = {
  key: string;
  /** Horizontal start position as a fraction of screen width. */
  left: number;
  size: number;
  color: string;
  /** How far it drifts sideways on the way down, in px. */
  sway: number;
  rotations: number;
  /** Where this piece sits in the stagger window, 0–1. Scaled to ms at render. */
  delayFraction: number;
  round: boolean;
};

/**
 * A one-shot fall of confetti, drawn with plain Animated views — no dependency,
 * and it works in Expo Go.
 *
 * One shared driver animates every piece; each one derives its own local clock
 * from a window of that driver — [start, start + fallDuration] — so pieces share
 * a speed but begin at staggered times. That keeps this to a single animation on
 * the native driver instead of N of them, and transforms are native-driver safe.
 */
export function Confetti({
  count = 120,
  fallDuration = 6000,
  coverage = 0.75,
}: ConfettiProps) {
  const { width, height } = useWindowDimensions();

  // Pieces spawn above the screen and travel past the bottom, so the distance
  // covered is more than the screen height — worth accounting for, otherwise the
  // requested coverage comes out a few percent high.
  const travel = height + SPAWN_ABOVE + EXIT_BELOW;
  // How long to keep emitting: long enough for the leading piece to reach
  // `coverage` of the way down the visible screen.
  const stagger = fallDuration * ((coverage * height + SPAWN_ABOVE) / travel);
  // The driver runs long enough for the last-starting piece to finish its fall.
  const total = fallDuration + stagger;
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    let canceled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!canceled) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => {
      canceled = true;
      subscription.remove();
    };
  }, []);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        key: `piece-${index}`,
        left: Math.random(),
        size: 7 + Math.random() * 7,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length] ?? CONFETTI_COLORS[0],
        sway: (Math.random() * 2 - 1) * 46,
        rotations: 1 + Math.random() * 2,
        delayFraction: Math.random(),
        round: index % 3 === 0,
      })),
    // Deliberately only `count`: a timing tweak should re-time the same pieces,
    // not scatter a fresh set of them.
    [count]
  );

  useEffect(() => {
    if (reduceMotion !== false) return;
    // Reset first: the driver is held in a ref, so without this a re-run would
    // animate from 1 to 1 and nothing would move.
    progress.setValue(0);
    // Linear: a fall that eases out looks like it is running out of gravity.
    Animated.timing(progress, {
      toValue: 1,
      duration: total,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [progress, total, reduceMotion]);

  // Nothing renders until the accessibility setting is known, and nothing renders
  // at all when it is on: motion is the whole point here, so a static scatter
  // would be a consolation prize rather than an accommodation.
  if (reduceMotion !== false) return null;

  return (
    <View style={styles.overlay} pointerEvents="none" accessibilityElementsHidden>
      {pieces.map((piece) => {
        // Each piece's own 0 → 1 clock. The window is its start *and* its end, so
        // every piece takes the same fallDuration to cross — mapping [delay, 1]
        // instead would give delayed pieces less time for the same distance, so
        // they would fall faster and the whole shower would land at once.
        const start = (piece.delayFraction * stagger) / total;
        const local = progress.interpolate({
          inputRange: [start, start + fallDuration / total],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={piece.key}
            testID="confetti-piece"
            style={[
              styles.piece,
              {
                left: piece.left * width,
                width: piece.size,
                height: piece.round ? piece.size : piece.size * 1.6,
                borderRadius: piece.round ? piece.size / 2 : radius.sm / 3,
                backgroundColor: piece.color,
                // No opacity animation: a piece is clipped by the overlay above the
                // screen, then falls right past the bottom edge. Fading it out on the
                // way down read as bunching up and vanishing rather than falling off.
                transform: [
                  {
                    translateY: local.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-SPAWN_ABOVE, height + EXIT_BELOW],
                    }),
                  },
                  {
                    translateX: local.interpolate({
                      inputRange: [0, 0.3, 0.65, 1],
                      outputRange: [0, piece.sway, -piece.sway * 0.6, piece.sway * 0.3],
                    }),
                  },
                  {
                    rotate: local.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${piece.rotations * 360}deg`],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
});
