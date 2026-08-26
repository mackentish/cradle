import React from 'react';
import { StyleSheet, View } from 'react-native';

import { PROGRAM_IDS, programsById, programTitle } from '@/domain/program';
import type { Phase } from '@/domain/types';
import { colors, programColors, radius, spacing } from '@/theme';

import { Text } from './Text';

/**
 * Three colors on the day tracker mean nothing without this. Sits directly under
 * `DayDots` wherever it's used, in the same outside-in order as the rings.
 */
export function ProgramLegend({ phase }: { phase: Phase }) {
  return (
    <View style={styles.row}>
      {PROGRAM_IDS.map((programId) => {
        const program = programsById[programId];
        return (
          <View key={programId} style={styles.item}>
            <View
              style={[styles.swatch, { borderColor: programColors[program.colorKey].ring }]}
            />
            <Text variant="label" color={colors.textFaint}>
              {programTitle(program, phase)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    borderWidth: 3,
  },
});
