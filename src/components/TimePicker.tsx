import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { Stepper } from './Stepper';
import type { TimePickerProps } from './TimePicker.types';

const MINUTE_STEP = 5;

/**
 * Fallback for platforms without a native picker (web). iOS and Android resolve
 * to TimePicker.ios.tsx / TimePicker.android.tsx and get the system control.
 */
export function TimePicker({ hour, minute, onChange }: TimePickerProps) {
  const shiftHour = (delta: number) => onChange((hour + delta + 24) % 24, minute);

  const shiftMinute = (delta: number) => {
    const total = hour * 60 + minute + delta * MINUTE_STEP;
    const wrapped = (total + 24 * 60) % (24 * 60);
    onChange(Math.floor(wrapped / 60), wrapped % 60);
  };

  return (
    <View style={styles.row}>
      <Stepper
        label="Hour"
        size="compact"
        value={`${hour}`.padStart(2, '0')}
        onDecrement={() => shiftHour(-1)}
        onIncrement={() => shiftHour(1)}
        decrementLabel="An hour earlier"
        incrementLabel="An hour later"
      />
      <Stepper
        label="Minute"
        size="compact"
        value={`${minute}`.padStart(2, '0')}
        onDecrement={() => shiftMinute(-1)}
        onIncrement={() => shiftMinute(1)}
        decrementLabel="Five minutes earlier"
        incrementLabel="Five minutes later"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
});
