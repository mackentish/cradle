import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './Text';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

/**
 * A segmented control. Promoted out of the due-date screen's local `ModeTab` once
 * the plan and progress screens needed the same thing to switch program.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<SegmentOption<T>>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.tab, active && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
          >
            <Text
              variant={active ? 'smallStrong' : 'small'}
              color={active ? colors.primaryPressed : colors.textFaint}
              center
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
});
