import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, DateFields, Pill, Screen, Text } from '@/components';
import {
  describeProgress,
  dueDateFromWeek,
  getProgress,
  validateDueDate,
} from '@/domain/pregnancy';
import { formatLongDate, fromDayKey, toDayKey } from '@/lib/date';
import { emptyProfile } from '@/lib/storage';
import { useAppState } from '@/state/AppState';
import { colors, radius, spacing } from '@/theme';

type Mode = 'due-date' | 'weeks-along';

export default function DueDateScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAppState();
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

  const preview = useMemo(() => {
    if (!dueDate || error) return null;
    return getProgress({ ...emptyProfile, dueDate: toDayKey(dueDate) });
  }, [dueDate, error]);

  const onContinue = async () => {
    if (!dueDate || error) return;
    await updateProfile({ dueDate: toDayKey(dueDate), birthDate: null });
    if (isEditing) router.back();
    else router.push('/onboarding/safety');
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="title">When is baby due?</Text>
        <Text variant="body">
          This is the only thing Cradle needs. Everything else — which exercises, how long, how hard
          — follows from it.
        </Text>
      </View>

      <View style={styles.switcher}>
        <ModeTab
          label="I know my due date"
          active={mode === 'due-date'}
          onPress={() => setMode('due-date')}
        />
        <ModeTab
          label="I know my week"
          active={mode === 'weeks-along'}
          onPress={() => setMode('weeks-along')}
        />
      </View>

      {mode === 'due-date' ? (
        <Card>
          <Text variant="label">Due date</Text>
          <DateFields initial={typedDate} onChange={handleDateChange} />
        </Card>
      ) : (
        <Card>
          <Text variant="label">How far along</Text>
          <View style={styles.stepper}>
            <StepperButton label="−" onPress={() => setWeeksAlong((w) => Math.max(1, w - 1))} />
            <View style={styles.weekReadout}>
              <Text variant="hero">{weeksAlong}</Text>
              <Text variant="small">weeks</Text>
            </View>
            <StepperButton label="+" onPress={() => setWeeksAlong((w) => Math.min(42, w + 1))} />
          </View>
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
          <Text variant="subheading">Starting in {preview.stage.title}</Text>
          <Text variant="small">{preview.stage.focus}</Text>
        </Card>
      ) : null}

      <View style={styles.footer}>
        <Button
          label={isEditing ? 'Save' : 'Continue'}
          onPress={onContinue}
          disabled={!dueDate || Boolean(error)}
        />
        {isEditing ? <Button label="Cancel" variant="quiet" onPress={() => router.back()} /> : null}
      </View>
    </Screen>
  );
}

function ModeTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.modeTab, active && styles.modeTabActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text variant="smallStrong" color={active ? colors.primaryPressed : colors.textFaint} center>
        {label}
      </Text>
    </Pressable>
  );
}

function StepperButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.stepperButton} accessibilityRole="button">
      <Text variant="title" color={colors.primaryPressed}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekReadout: {
    alignItems: 'center',
  },
  footer: {
    gap: spacing.sm,
  },
});
