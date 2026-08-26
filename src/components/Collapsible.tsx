import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';

import { useReduceMotion } from '@/hooks/useReduceMotion';

const DURATION = 220;

type CollapsibleProps = Readonly<{
  expanded: boolean;
  children: React.ReactNode;
  /** Applied to the measured content, not to the clipping box. */
  style?: ViewStyle;
  testID?: string;
}>;

/**
 * Reveals its children by animating a clipping box from zero to their measured
 * height, and drops them from the tree once it has closed — a collapsed section
 * should leave nothing behind for the screen reader or a tap to find.
 *
 * The content is positioned absolutely inside the box so its own layout is never
 * constrained by the animating height: `onLayout` then reports the natural
 * height even while the box around it is still zero. The first frame after
 * mounting is clipped to nothing, which is exactly where the animation starts,
 * so there is no flash of full-height content before it plays.
 */
export function Collapsible({ expanded, children, style, testID }: CollapsibleProps) {
  const reduceMotion = useReduceMotion();
  const height = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [mounted, setMounted] = useState(expanded);

  useEffect(() => {
    if (expanded) setMounted(true);
  }, [expanded]);

  useEffect(() => {
    if (expanded && !mounted) return;
    const target = expanded ? contentHeight : 0;
    // Opening has nowhere to go until the content has been laid out once.
    // Closing always does, which is what keeps this working under Jest, where
    // `onLayout` never fires.
    if (target === null) return;

    if (reduceMotion !== false) {
      height.setValue(target);
      if (!expanded) setMounted(false);
      return;
    }

    const animation = Animated.timing(height, {
      toValue: target,
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
      // Height is a layout prop, so this one has to be driven from JS.
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished && !expanded) setMounted(false);
    });
    return () => animation.stop();
  }, [expanded, mounted, contentHeight, reduceMotion, height]);

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.clip, { height }]}>
      <View
        style={[styles.content, style]}
        testID={testID}
        onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});
