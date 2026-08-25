import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components';
import { useDismiss } from '@/hooks/useDismiss';
import { parseBackup } from '@/lib/storage';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radius, spacing } from '@/theme';

/**
 * Restoring means pasting the JSON from an earlier export. It's low-tech, but it
 * is the honest way to move devices when there is no server to sync with.
 */
export default function RestoreScreen() {
  const router = useRouter();
  const { replaceAll } = useAppState();
  const dismiss = useDismiss();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);

  const restore = async () => {
    try {
      const backup = parseBackup(raw);
      await replaceAll(backup.profile, backup.logs);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That backup could not be read.');
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="title">Restore a backup</Text>
        <Text variant="body">
          Paste the text from a Cradle export below. This replaces whatever is currently on this
          phone.
        </Text>
      </View>

      <Card>
        <Text variant="label">Backup text</Text>
        <TextInput
          value={raw}
          onChangeText={(text) => {
            setRaw(text);
            setError(null);
          }}
          multiline
          placeholder='{ "app": "cradle", ... }'
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Card>

      {error ? (
        <Text variant="small" color={colors.primaryPressed}>
          {error}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Button label="Restore" onPress={restore} disabled={raw.trim().length === 0} />
        <Button label="Cancel" variant="quiet" onPress={dismiss} />
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
  input: {
    minHeight: 180,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.text,
    textAlignVertical: 'top',
  },
  footer: {
    gap: spacing.sm,
  },
});
