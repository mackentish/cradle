import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors } from '@/theme';

import { Icon } from './Icon';

export type ChevronDirection = 'right' | 'down' | 'left' | 'up';

/**
 * Degrees clockwise from the drawn path, which points right.
 *
 * `up` is 270 rather than -90 on purpose: a disclosure chevron goes down → up,
 * and rotating the long way round (90 → 270) turns it clockwise through the
 * closed position instead of unwinding back the way it came.
 */
const ANGLES: Record<ChevronDirection, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
};

const DURATION = 220;

type ChevronProps = Readonly<{
  direction?: ChevronDirection;
  size?: number;
  color?: string;
}>;

/**
 * The app's disclosure arrow: one SVG chevron, rotated to point where it needs
 * to, easing between directions when the direction changes.
 *
 * Decorative — it is always inside a pressable that carries the label, so it is
 * hidden from the screen reader rather than announced as an unnamed image.
 */
export function Chevron({ direction = 'right', size = 16, color = colors.textFaint }: ChevronProps) {
  const reduceMotion = useReduceMotion();
  const angle = ANGLES[direction];
  const rotation = useRef(new Animated.Value(angle)).current;

  useEffect(() => {
    // Unknown counts as on: snapping to the right angle before the setting is
    // known is invisible, whereas a spin would already have played.
    if (reduceMotion !== false) {
      rotation.setValue(angle);
      return;
    }
    const animation = Animated.timing(rotation, {
      toValue: angle,
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
      // A transform, so this one can run off the JS thread.
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [angle, reduceMotion, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, transform: [{ rotate }] }}
    >
      <Icon name="chevron" size={size} color={color} />
    </Animated.View>
  );
}
