import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, DateFields, Screen, Text } from '@/components';
import { getProgress } from '@/domain/pregnancy';
import { useDismiss } from '@/hooks/useDismiss';
import { now } from '@/lib/clock';
import { daysBetween, fromDayKey, toDayKey } from '@/lib/date';
import { emptyProfile } from '@/lib/storage';
import { useAppState } from '@/state/AppState';
import { colors, spacing } from '@/theme';

/** Setting a birth date is what flips the whole program over to postpartum. */
export default function BirthDateScreen() {
  const { profile, updateProfile } = useAppState();
  const dismiss = useDismiss();

  const [date, setDate] = useState<Date | null>(
    profile.birthDate ? fromDayKey(profile.birthDate) : now()
  );
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback((next: Date | null, hasTyped: boolean) => {
    setDate(next);
    setTouched(hasTyped);
  }, []);

  const error = useMemo(() => {
    if (touched && !date) return 'That date does not exist — check the day.';
    if (!date) return null;
    const days = daysBetween(date, now());
    if (days < 0) return 'That is in the future.';
    if (days > 730) return 'That is more than two years ago.';
    return null;
  }, [date, touched]);

  const preview = useMemo(() => {
    if (!date || error) return null;
    return getProgress({ ...emptyProfile, birthDate: toDayKey(date) });
  }, [date, error]);

  const save = async () => {
    if (!date || error) return;
    await updateProfile({ birthDate: toDayKey(date) });
    dismiss();
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="title">Congratulations</Text>
        <Text variant="body">
          Tell Cradle when baby arrived and the program switches to recovery — breath and rest
          first, strength later, at the pace your body sets.
        </Text>
      </View>

      <Card>
        <Text variant="label">Birth date</Text>
        <DateFields initial={date} onChange={handleChange} />
      </Card>

      {error ? (
        <Text variant="small" color={colors.primaryPressed}>
          {error}
        </Text>
      ) : null}

      {preview ? (
        <Card tint={colors.accentSoft}>
          <Text variant="subheading">Starting in {preview.stage.title}</Text>
          <Text variant="small">{preview.stage.focus}</Text>
        </Card>
      ) : null}

      <View style={styles.footer}>
        <Button label="Save" onPress={save} disabled={!date || Boolean(error)} />
        <Button label="Not yet" variant="quiet" onPress={dismiss} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  footer: {
    gap: spacing.sm,
  },
});
