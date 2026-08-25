import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAppState } from '@/state/AppState';
import { colors } from '@/theme';

/** Entry gate: straight to Today once we know who she is, otherwise onboarding. */
export default function Index() {
  const { ready, onboarded } = useAppState();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
