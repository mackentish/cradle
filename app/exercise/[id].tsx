import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Pill, Screen, Text } from '@/components';
import { exercises, kindLabels } from '@/domain/exercises';
import { colors, spacing } from '@/theme';

export default function ExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = id ? exercises[id] : undefined;

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Text variant="smallStrong" color={colors.textFaint}>
            ‹ Back
          </Text>
        </Pressable>
      </View>

      {!exercise ? (
        <Card>
          <Text variant="subheading">Not found</Text>
          <Text variant="small">That exercise is not in the library.</Text>
        </Card>
      ) : (
        <>
          <View style={styles.header}>
            <Pill label={kindLabels[exercise.kind]} />
            <Text variant="title">{exercise.name}</Text>
            <Text variant="body">{exercise.summary}</Text>
          </View>

          <Card>
            <Text variant="label">Positions</Text>
            {exercise.positions.map((position) => (
              <Text key={position} variant="small">
                · {position}
              </Text>
            ))}
          </Card>

          <Card>
            <Text variant="label">How to</Text>
            {exercise.howTo.map((line, index) => (
              <View key={line} style={styles.row}>
                <Text variant="smallStrong" color={colors.primaryPressed}>
                  {index + 1}
                </Text>
                <Text variant="small" style={styles.rowText}>
                  {line}
                </Text>
              </View>
            ))}
          </Card>

          <Card tint={colors.surfaceSunken}>
            <Text variant="label">Cues</Text>
            {exercise.cues.map((cue) => (
              <Text key={cue} variant="small">
                · {cue}
              </Text>
            ))}
          </Card>

          {exercise.caution ? (
            <Card tint={colors.primarySoft}>
              <Text variant="smallStrong">Worth knowing</Text>
              <Text variant="small">{exercise.caution}</Text>
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
  },
  header: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
});
