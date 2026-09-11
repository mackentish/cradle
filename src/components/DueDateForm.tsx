import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  describeProgress,
  dueDateFromWeek,
  getProgress,
  validateDueDate,
} from '@/domain/pregnancy';
import type { Profile } from '@/domain/types';
import { formatLongDate, fromDayKey, toDayKey } from '@/lib/date';
import { emptyProfile } from '@/lib/storage';
import { colors, spacing } from '@/theme';

import { Button } from './Button';
import { Card } from './Card';
import { DateFields } from './DateFields';
import { Pill } from './Pill';
import { SegmentedTabs } from './SegmentedTabs';
import { Stepper } from './Stepper';
import { Text } from './Text';

type Mode = 'due-date' | 'weeks-along';

type DueDateFormProps = Readonly<{
  /** Seeds the fields and decides the copy: a profile with a due date is being edited. */
  profile: Profile;
  submitLabel: string;
  onSubmit: (dueDate: Date) => void;
  /** Omitted during onboarding, where there is nothing behind this screen. */
  onCancel?: () => void;
}>;

/**
 * The date entry itself, shared by onboarding and the edit screen so the two
 * paths validate identically. Each screen keeps its own heading — what differs
 * between them is the framing, not the form.
 */
export function DueDateForm({ profile, submitLabel, onSubmit, onCancel }: DueDateFormProps) {
  const isEditing = Boolean(profile.dueDate);

  const [mode, setMode] = useState<Mode>('due-date');
  const [typedDate, setTypedDate] = useState<Date | null>(
    profile.dueDate ? fromDayKey(profile.dueDate) : null
  );
  const [touched, setTouched] = useState(false);
  const [weeksAlong, setWeeksAlong] = useState(20);

  const handleDateChange = useCallback((date: Date | null, hasTyped: boolean) => {
    setTypedDate(date);
    setTouched(hasTyped);
  }, []);

  const dueDate = mode === 'due-date' ? typedDate : dueDateFromWeek(weeksAlong);

  const error = useMemo(() => {
    if (mode === 'due-date' && touched && !typedDate) {
      return 'That date does not exist — check the day.';
    }
    return dueDate ? validateDueDate(dueDate) : null;
  }, [mode, touched, typedDate, dueDate]);

  // Built from an empty profile on purpose: this previews what the date alone
  // means. Skipped once baby is here, since a birth date outranks a due date and
  // the preview would be naming a pregnancy stage she is no longer in.
  const preview = useMemo(() => {
    if (!dueDate || error || profile.birthDate) return null;
    return getProgress({ ...emptyProfile, dueDate: toDayKey(dueDate) });
  }, [dueDate, error, profile.birthDate]);

  return (
    <>
      <SegmentedTabs
        value={mode}
        onChange={setMode}
        options={[
          { value: 'due-date', label: 'I know my due date' },
          { value: 'weeks-along', label: 'I know my week' },
        ]}
      />

      {mode === 'due-date' ? (
        <Card>
          <Text variant="label">Due date</Text>
          <DateFields initial={typedDate} onChange={handleDateChange} />
        </Card>
      ) : (
        <Card>
          <Stepper
            label="How far along"
            value={String(weeksAlong)}
            caption="weeks"
            onDecrement={() => setWeeksAlong((w) => Math.max(1, w - 1))}
            onIncrement={() => setWeeksAlong((w) => Math.min(42, w + 1))}
            decrementLabel="One week earlier"
            incrementLabel="One week later"
          />
          {dueDate ? (
            <Text variant="small" center>
              That puts your due date around {formatLongDate(dueDate)}.
            </Text>
          ) : null}
        </Card>
      )}

      {error ? (
        <Text variant="small" color={colors.primaryPressed}>
          {error}
        </Text>
      ) : null}

      {preview ? (
        <Card tint={colors.accentSoft}>
          <Pill label={describeProgress(preview)} tint={colors.surface} ink={colors.accent} />
          <Text variant="subheading">
            {isEditing ? 'Now in' : 'Starting in'} {preview.stage.title}
          </Text>
          <Text variant="small">{preview.stage.focus}</Text>
        </Card>
      ) : null}

      <View style={styles.footer}>
        <Button
          label={submitLabel}
          onPress={() => {
            if (dueDate && !error) onSubmit(dueDate);
          }}
          disabled={!dueDate || Boolean(error)}
        />
        {onCancel ? <Button label="Cancel" variant="quiet" onPress={onCancel} /> : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.sm,
  },
});
