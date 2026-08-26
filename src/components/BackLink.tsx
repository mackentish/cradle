import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useDismiss } from '@/hooks/useDismiss';
import { colors } from '@/theme';

import { Text } from './Text';

/** The "‹ Back" affordance used by the screens pushed on top of the tabs. */
export function BackLink({ label = 'Back' }: Readonly<{ label?: string }>) {
  const dismiss = useDismiss();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={dismiss}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text variant="smallStrong" color={colors.textFaint}>
          ‹ {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
