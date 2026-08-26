import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  tint?: string;
  padded?: boolean;
  testID?: string;
};

export function Card({ children, style, onPress, tint, padded = true, testID }: CardProps) {
  const base = [
    styles.card,
    padded && styles.padded,
    tint ? { backgroundColor: tint, borderColor: 'transparent' } : null,
    style,
  ];

  if (!onPress) return (
    <View style={base} testID={testID}>
      {children}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [...base, pressed && styles.pressed]}
      accessibilityRole="button"
      testID={testID}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  padded: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
});
