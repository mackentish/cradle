import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';

import { Text } from './Text';

type DateFieldsProps = {
  initial?: Date | null;
  /** Fires on every keystroke: the parsed date (or null), plus whether the user has typed anything. */
  onChange: (date: Date | null, touched: boolean) => void;
};

/**
 * MM / DD / YYYY entry. Deliberately not a native picker — plain number fields
 * work identically in Expo Go and every build, and scrolling a wheel back nine
 * months is worse than typing six digits.
 */
export function DateFields({ initial, onChange }: DateFieldsProps) {
  const [month, setMonth] = useState(initial ? pad(initial.getMonth() + 1) : '');
  const [day, setDay] = useState(initial ? pad(initial.getDate()) : '');
  const [year, setYear] = useState(
    initial ? String(initial.getFullYear()) : String(new Date().getFullYear())
  );

  const dayRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  useEffect(() => {
    const touched = month.length > 0 || day.length > 0;
    onChange(parseParts(month, day, year), touched);
    // onChange is expected to be stable; re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, day, year]);

  return (
    <View style={styles.row}>
      <Field
        value={month}
        placeholder="MM"
        maxLength={2}
        width={72}
        onChangeText={(text) => {
          const clean = digits(text, 2);
          setMonth(clean);
          if (clean.length === 2) dayRef.current?.focus();
        }}
      />
      <Slash />
      <Field
        inputRef={dayRef}
        value={day}
        placeholder="DD"
        maxLength={2}
        width={72}
        onChangeText={(text) => {
          const clean = digits(text, 2);
          setDay(clean);
          if (clean.length === 2) yearRef.current?.focus();
        }}
      />
      <Slash />
      <Field
        inputRef={yearRef}
        value={year}
        placeholder="YYYY"
        maxLength={4}
        width={104}
        onChangeText={(text) => setYear(digits(text, 4))}
      />
    </View>
  );
}

function Slash() {
  return (
    <Text variant="heading" color={colors.textFaint}>
      /
    </Text>
  );
}

function Field({
  value,
  onChangeText,
  placeholder,
  maxLength,
  width,
  inputRef,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  maxLength: number;
  width: number;
  inputRef?: React.RefObject<TextInput | null>;
}) {
  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      keyboardType="number-pad"
      maxLength={maxLength}
      style={[styles.input, { width }]}
      accessibilityLabel={placeholder}
    />
  );
}

function digits(text: string, max: number): string {
  return text.replace(/\D/g, '').slice(0, max);
}

function pad(value: number): string {
  return `${value}`.padStart(2, '0');
}

/** Returns null for incomplete input and for dates that don't exist, like 02/31. */
export function parseParts(month: string, day: string, year: string): Date | null {
  const m = Number(month);
  const d = Number(day);
  const y = Number(year);
  if (!m || !d || !y || year.length !== 4) return null;
  const candidate = new Date(y, m - 1, d);
  const isReal =
    candidate.getFullYear() === y && candidate.getMonth() === m - 1 && candidate.getDate() === d;
  return isReal ? candidate : null;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  input: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
  },
});
