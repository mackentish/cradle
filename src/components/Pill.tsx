import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './Text';

export function Pill({
  label,
  tint = colors.primarySoft,
  ink = colors.primaryPressed,
}: {
  label: string;
  tint?: string;
  ink?: string;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: tint }]}>
      <Text variant="smallStrong" color={ink}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
});
