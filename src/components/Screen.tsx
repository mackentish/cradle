import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type ScreenProps = {
  children: React.ReactNode;
  /** Scrolling is the default; pass false for full-bleed screens like the player. */
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  background?: string;
  /** Extra bottom padding, e.g. to clear a fixed footer button. */
  bottomInset?: number;
  /** Extra breathing room above the content, on top of the safe-area inset. */
  topInset?: number;
};

export function Screen({
  children,
  scroll = true,
  style,
  contentStyle,
  background = colors.background,
  bottomInset = 0,
  topInset = 0,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  // Applied last, so a caller's contentStyle can never eat the safe-area inset
  // and slide a heading under the status bar. Use topInset/bottomInset instead.
  const padding = {
    paddingTop: insets.top + spacing.lg + topInset,
    paddingBottom: insets.bottom + spacing.xl + bottomInset,
  };

  if (!scroll) {
    return (
      <View style={[styles.root, { backgroundColor: background }, style, padding]}>{children}</View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: background }, style]}
      contentContainerStyle={[styles.content, contentStyle, padding]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
});
