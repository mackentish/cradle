import React from 'react';
import { StyleSheet, View } from 'react-native';

import { PROGRAM_IDS, programsById } from '@/domain/program';
import type { ProgramId } from '@/domain/types';
import { fromDayKey } from '@/lib/date';
import type { DayMark } from '@/lib/streak';
import { colors, programColors, radius } from '@/theme';

import { Text } from './Text';

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Outer ring first, so the display order reads from the outside in. */
const RING_SIZE: Record<ProgramId, number> = {
  'pelvic-floor': 34,
  core: 24,
  'birth-prep': 14,
};

const RING_WIDTH = 3;

/**
 * The last N days as a column each, drawn as concentric rings — one per program,
 * outermost first. A ring is filled in its program's color when that program was
 * completed and left as a faint outline when it wasn't, so a glance tells you not
 * just whether you showed up but which of the three you actually did.
 *
 * Nested `View`s with a border rather than SVG: three rings is cheap enough that
 * the extra dependency in the render tree isn't worth it, and borders scale with
 * the theme's radius token for free.
 */
export function DayDots({ days }: { days: DayMark[] }) {
  return (
    <View style={styles.row}>
      {days.map(({ day, done }, index) => (
        <View key={day} style={styles.item}>
          <View style={styles.rings} testID={`day-rings-${day}`}>
            {PROGRAM_IDS.map((programId) => {
              const filled = done.includes(programId);
              const size = RING_SIZE[programId];
              return (
                <View
                  key={programId}
                  testID={filled ? `day-ring-done-${programId}` : undefined}
                  style={[
                    styles.ring,
                    {
                      width: size,
                      height: size,
                      borderColor: filled
                        ? programColors[programsById[programId].colorKey].ring
                        : colors.border,
                    },
                  ]}
                />
              );
            })}
          </View>
          <Text variant="label" color={colors.textFaint}>
            {WEEKDAY_INITIALS[fromDayKey(day).getDay()]}
          </Text>
          {/* Always rendered, so every column keeps the same height. */}
          <View style={[styles.todayMark, index !== days.length - 1 && styles.todayMarkHidden]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    gap: 6,
  },
  rings: {
    width: RING_SIZE['pelvic-floor'],
    height: RING_SIZE['pelvic-floor'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: radius.pill,
    borderWidth: RING_WIDTH,
  },
  todayMark: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  todayMarkHidden: {
    backgroundColor: 'transparent',
  },
});
