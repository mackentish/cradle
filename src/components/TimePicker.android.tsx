import { DateTimePicker, Host } from '@expo/ui/jetpack-compose';
import React, { useRef } from 'react';

import { dateAtTime, prefers24Hour } from '@/lib/date';
import { colors } from '@/theme';

import type { TimePickerProps } from './TimePicker.types';

/** Material 3 clock dial, with the keyboard-entry toggle Android users expect. */
export function TimePicker({ hour, minute, onChange }: TimePickerProps) {
  // Uncontrolled for the same reason as iOS — the dial owns the interaction.
  const initial = useRef(dateAtTime(hour, minute).toISOString()).current;

  return (
    <Host matchContents={{ vertical: true }} style={styles.host}>
      <DateTimePicker
        initialDate={initial}
        displayedComponents="hourAndMinute"
        variant="picker"
        is24Hour={prefers24Hour()}
        color={colors.primary}
        onDateSelected={(date) => onChange(date.getHours(), date.getMinutes())}
      />
    </Host>
  );
}

const styles = {
  host: { width: '100%' as const },
};
