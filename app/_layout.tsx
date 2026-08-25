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
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureNotifications } from '@/lib/notifications';
import { AppStateProvider } from '@/state/AppState';
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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen
            name="session"
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
          <Stack.Screen name="plan" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="reminders" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="exercise/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
