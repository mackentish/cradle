import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors, fonts, radius, shadow, spacing } from '@/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'quiet';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  /** Off for repeated taps inside the player, where buzzing gets tiresome. */
  haptic?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
  haptic = true,
}: ButtonProps) {
  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !disabled ? pressedStyles[variant] : null,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  label: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    lineHeight: 22,
  },
  disabled: {
    opacity: 0.45,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary, ...shadow.card },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primarySoftBorder,
  },
  quiet: { backgroundColor: 'transparent', minHeight: 44 },
};

const pressedStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.primarySoftBorder },
  quiet: { opacity: 0.6 },
};

const labelStyles: Record<Variant, { color: string }> = {
  primary: { color: colors.onPrimary },
  secondary: { color: colors.primaryPressed },
  quiet: { color: colors.textSoft },
};
