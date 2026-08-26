import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './Text';

type StepperProps = Readonly<{
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  /** Small label above the control. */
  label?: string;
  /** Caption under the value, e.g. "weeks". */
  caption?: string;
  /** 'hero' for a single prominent number, 'compact' for side-by-side controls. */
  size?: 'hero' | 'compact';
  decrementLabel?: string;
  incrementLabel?: string;
}>;

/** A minus / value / plus control. Used for gestational week and reminder time. */
export function Stepper({
  value,
  onDecrement,
  onIncrement,
  label,
  caption,
  size = 'hero',
  decrementLabel = 'Decrease',
  incrementLabel = 'Increase',
}: StepperProps) {
  const compact = size === 'compact';

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View style={styles.row}>
        <StepButton
          glyph="−"
          onPress={onDecrement}
          compact={compact}
          accessibilityLabel={decrementLabel}
        />
        <View style={styles.readout}>
          <Text variant={compact ? 'title' : 'hero'} center>
            {value}
          </Text>
          {caption ? (
            <Text variant="small" center>
              {caption}
            </Text>
          ) : null}
        </View>
        <StepButton
          glyph="+"
          onPress={onIncrement}
          compact={compact}
          accessibilityLabel={incrementLabel}
        />
      </View>
    </View>
  );
}

function StepButton({
  glyph,
  onPress,
  compact,
  accessibilityLabel,
}: Readonly<{
  glyph: string;
  onPress: () => void;
  compact: boolean;
  accessibilityLabel: string;
}>) {
  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text variant={compact ? 'heading' : 'title'} color={colors.primaryPressed}>
        {glyph}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  wrapCompact: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readout: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCompact: {
    width: 42,
    height: 42,
  },
  buttonPressed: {
    backgroundColor: colors.primarySoftBorder,
  },
});
