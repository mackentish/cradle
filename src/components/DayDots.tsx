import React from 'react';
import { StyleSheet, View } from 'react-native';

import { fromDayKey } from '@/lib/date';
import { colors, radius } from '@/theme';

import { Text } from './Text';

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** The last N days as a row of dots — filled for a completed session. */
export function DayDots({ days }: { days: Array<{ day: string; done: boolean }> }) {
  return (
    <View style={styles.row}>
      {days.map(({ day, done }, index) => (
        <View key={day} style={styles.item}>
          <View style={[styles.dot, done && styles.dotDone]} />
          <Text variant="label" color={colors.textFaint}>
            {WEEKDAY_INITIALS[fromDayKey(day).getDay()]}
          </Text>
          {/* Always rendered, so every column keeps the same height. */}
          <View style={[styles.todayMark, index !== days.length - 1 && styles.todayMarkHidden]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  todayMark: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  todayMarkHidden: {
    backgroundColor: 'transparent',
  },
});
