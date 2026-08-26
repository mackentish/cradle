import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors, fonts, radius, shadow, spacing } from '@/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'quiet';

/**
 * The five colors a button needs, in the shape `programColors` publishes. Kept
 * structural so this component knows nothing about programs — a screen with a
 * program in scope passes `programColors[program.colorKey]` straight through.
 */
export type ButtonTone = Readonly<{
  ring: string;
  pressed: string;
  tint: string;
  softBorder: string;
  ink: string;
}>;

/** The app's own tone. Every button that isn't acting on one program uses it. */
const appTone: ButtonTone = {
  ring: colors.primary,
  pressed: colors.primaryPressed,
  tint: colors.primarySoft,
  softBorder: colors.primarySoftBorder,
  ink: colors.primaryPressed,
};

type ButtonProps = Readonly<{
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  /** Off for repeated taps inside the player, where buzzing gets tiresome. */
  haptic?: boolean;
  /**
   * Overrides the dusty rose. Pass it wherever the button acts on a single
   * program, so the control matches the card it sits in rather than fighting it.
   */
  tone?: ButtonTone;
}>;

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
  haptic = true,
  tone = appTone,
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
        variant === 'quiet' ? styles.quiet : fillStyle(variant, tone),
        pressed && !disabled ? pressedStyle(variant, tone) : null,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, { color: labelColor(variant, tone) }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Resolved per render rather than held in a frozen record, since `tone` is a
 * prop now. `quiet` carries no color of its own, so it stays in the stylesheet.
 */
function fillStyle(variant: Exclude<Variant, 'quiet'>, tone: ButtonTone): ViewStyle {
  if (variant === 'primary') return { backgroundColor: tone.ring, ...shadow.card };
  return { backgroundColor: tone.tint, borderWidth: 1, borderColor: tone.softBorder };
}

function pressedStyle(variant: Variant, tone: ButtonTone): ViewStyle {
  if (variant === 'primary') return { backgroundColor: tone.pressed };
  if (variant === 'secondary') return { backgroundColor: tone.softBorder };
  return { opacity: 0.6 };
}

/** White on a filled button whatever the tone; the tone's ink on a soft one. */
function labelColor(variant: Variant, tone: ButtonTone): string {
  if (variant === 'primary') return colors.onPrimary;
  if (variant === 'secondary') return tone.ink;
  return colors.textSoft;
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  quiet: {
    backgroundColor: 'transparent',
    minHeight: 44,
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
