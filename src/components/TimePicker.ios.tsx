import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';
import React, { useRef } from 'react';

import { dateAtTime } from '@/lib/date';
import { colors } from '@/theme';

import type { TimePickerProps } from './TimePicker.types';

/** The system wheel, via SwiftUI's DatePicker in hour-and-minute mode. */
export function TimePicker({ hour, minute, onChange }: TimePickerProps) {
  // Deliberately uncontrolled: feeding `selection` back down on every change
  // fights the wheel while it is still being scrolled. The wheel owns the
  // interaction, we own the saved value.
  const initial = useRef(dateAtTime(hour, minute)).current;

  return (
    <Host style={styles.host} seedColor={colors.primary}>
      <DatePicker
        selection={initial}
        displayedComponents={['hourAndMinute']}
        modifiers={[datePickerStyle('wheel')]}
        onDateChange={(date) => onChange(date.getHours(), date.getMinutes())}
      />
    </Host>
  );
}

const styles = {
  host: { height: 200 },
};
