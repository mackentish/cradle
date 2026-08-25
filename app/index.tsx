import { Redirect } from 'expo-router';
import React from 'react';

import { useAppState } from '@/state/AppState';

/**
 * Entry gate. The root layout holds the navigator back until storage has been
 * read, so by the time this renders the answer is already known.
 */
export default function Index() {
  const { onboarded } = useAppState();
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
