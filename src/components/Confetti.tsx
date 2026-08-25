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
const CONFETTI_COLORS = [
  palette.blush300,
  palette.blush400,
  palette.blush200,
  palette.sage300,
  palette.sage500,
  palette.lavender300,
  palette.lavender500,
];

type ConfettiProps = {
  count?: number;
  /** How long one piece takes to cross the screen, ms. Controls the speed. */
  fallDuration?: number;
  /** Spread of start times across the pieces, ms. Controls how long it showers. */
  stagger?: number;
};

type Piece = {
  key: string;
  /** Horizontal start position as a fraction of screen width. */
  left: number;
  size: number;
  color: string;
  /** How far it drifts sideways on the way down, in px. */
  sway: number;
  rotations: number;
  /** Absolute ms offset before this piece starts falling. */
  delayMs: number;
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
  count = 180,
  fallDuration = 6000,
  stagger = 2200,
}: ConfettiProps) {
  const { width, height } = useWindowDimensions();
  // The driver runs long enough for the last-starting piece to finish its fall.
  const total = fallDuration + stagger;
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        key: `piece-${index}`,
        left: Math.random(),
        size: 7 + Math.random() * 7,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        sway: (Math.random() * 2 - 1) * 46,
        rotations: 1 + Math.random() * 2,
        delayMs: Math.random() * stagger,
        round: index % 3 === 0,
      })),
    [count, stagger]
  );

  useEffect(() => {
    if (reduceMotion) return;
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

  // Motion is the whole point of this component, so honour the system setting by
  // sitting it out entirely rather than showing a static scatter.
  if (reduceMotion) return null;

  return (
    <View style={styles.overlay} pointerEvents="none" accessibilityElementsHidden>
      {pieces.map((piece) => {
        // Each piece's own 0 → 1 clock. The window is its start *and* its end, so
        // every piece takes the same fallDuration to cross — mapping [delay, 1]
        // instead would give delayed pieces less time for the same distance, so
        // they would fall faster and the whole shower would land at once.
        const local = progress.interpolate({
          inputRange: [piece.delayMs / total, (piece.delayMs + fallDuration) / total],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={piece.key}
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
                      outputRange: [-60, height + 60],
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
