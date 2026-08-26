import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  useFonts,
} from '@expo-google-fonts/quicksand';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureNotifications } from '@/lib/notifications';
import { AppStateProvider, useAppState } from '@/state/AppState';
import { colors } from '@/theme';

// How a reminder behaves if it fires while the app is open. Set once, at import.
configureNotifications();

/**
 * Anchors the stack to the tabs, so opening a nested route cold — a deep link, or
 * a reminder tap later on — lands on top of the app rather than replacing it.
 * Without this the back button has nowhere to go.
 */
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded) return <Loading />;

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

/**
 * Which routes exist depends on whether she has been through onboarding.
 *
 * This is a guard rather than a redirect from inside the screens: the anchor above
 * keeps the tabs mounted beneath whatever is on top, and a mounted Today that
 * redirects when it has no profile fights every navigation in the onboarding flow.
 * Declaring the routes out of existence has no such side effect.
 */
function RootNavigator() {
  const { ready, onboarded } = useAppState();

  // Hold the navigator back until storage has been read, so the guards below are
  // decided once rather than flipping under the user.
  if (!ready) return <Loading />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />

      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="session/[program]"
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen name="plan" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="reminders/[program]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="exercise/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="birth-date" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="restore" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>

      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
});
