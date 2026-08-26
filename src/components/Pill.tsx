import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './Text';

export function Pill({
  label,
  tint = colors.primarySoft,
  ink = colors.primaryPressed,
  center = false,
}: Readonly<{
  label: string;
  tint?: string;
  ink?: string;
  /** Centers the pill instead of hugging the left edge of its row. */
  center?: boolean;
}>) {
  return (
    <View style={[styles.pill, center && styles.centered, { backgroundColor: tint }]}>
      <Text variant="smallStrong" color={ink}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignSelf: 'center',
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
});
