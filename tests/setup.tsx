/**
 * Test doubles for everything that reaches native code. Each one is the minimum
 * needed to let a screen render — the goal is to exercise our own code, not to
 * re-implement the platform.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Fonts: the app renders nothing until these report loaded.
jest.mock('@expo-google-fonts/quicksand', () => ({
  useFonts: () => [true, null],
  Quicksand_500Medium: 'Quicksand_500Medium',
  Quicksand_600SemiBold: 'Quicksand_600SemiBold',
  Quicksand_700Bold: 'Quicksand_700Bold',
}));

jest.mock('@expo-google-fonts/nunito', () => ({
  Nunito_400Regular: 'Nunito_400Regular',
  Nunito_500Medium: 'Nunito_500Medium',
  Nunito_600SemiBold: 'Nunito_600SemiBold',
  Nunito_700Bold: 'Nunito_700Bold',
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('expo-keep-awake', () => ({
  useKeepAwake: jest.fn(),
  activateKeepAwakeAsync: jest.fn(),
  deactivateKeepAwake: jest.fn(),
}));

jest.mock('expo-notifications', () => {
  // Required inside the factory: jest hoists this above the imports.
  const { notificationDouble } = require('./doubles/notifications');
  return {
    setNotificationHandler: jest.fn(),
    getPermissionsAsync: jest.fn(async () => ({
      status: notificationDouble.permission,
      canAskAgain: notificationDouble.permission !== 'denied',
    })),
    requestPermissionsAsync: jest.fn(async () => ({
      status: notificationDouble.permission,
      canAskAgain: notificationDouble.permission !== 'denied',
    })),
    setNotificationChannelAsync: jest.fn(async () => null),
    // Honors a passed identifier and replaces in place, the way the OS does —
    // otherwise "reschedule one program" would append a duplicate instead.
    scheduleNotificationAsync: jest.fn(async ({ identifier, content, trigger }: any) => {
      const id = identifier ?? `scheduled-${notificationDouble.scheduled.length}`;
      const existing = notificationDouble.scheduled.findIndex(
        (item: any) => item.identifier === id
      );
      const entry = { identifier: id, content, trigger };
      if (existing >= 0) notificationDouble.scheduled[existing] = entry;
      else notificationDouble.scheduled.push(entry);
      return id;
    }),
    cancelScheduledNotificationAsync: jest.fn(async (identifier: string) => {
      notificationDouble.scheduled = notificationDouble.scheduled.filter(
        (item: any) => item.identifier !== identifier
      );
    }),
    cancelAllScheduledNotificationsAsync: jest.fn(async () => {
      notificationDouble.scheduled = [];
    }),
    getAllScheduledNotificationsAsync: jest.fn(async () => notificationDouble.scheduled),
    AndroidImportance: { DEFAULT: 3 },
    SchedulableTriggerInputTypes: { DAILY: 'daily' },
  };
});

/**
 * The RN preset leaves these unimplemented, and Confetti reads both: without a
 * promise to await it throws inside its effect and renders nothing.
 */
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  // RN exports this module as a default export, so the shape matters.
  __esModule: true,
  default: {
    isReduceMotionEnabled: jest.fn(async () => {
      const { accessibilityDouble } = require('./doubles/accessibility');
      return accessibilityDouble.reduceMotion;
    }),
    isScreenReaderEnabled: jest.fn(async () => false),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    announceForAccessibility: jest.fn(),
    setAccessibilityFocus: jest.fn(),
  },
}));

// @expo/ui wraps real SwiftUI/Compose views, which do not exist under Jest.
jest.mock('@expo/ui/swift-ui', () => {
  const { View } = require('react-native');
  return { Host: View, DatePicker: View };
});

jest.mock('@expo/ui/swift-ui/modifiers', () => ({
  datePickerStyle: () => ({ type: 'datePickerStyle' }),
}));

jest.mock('@expo/ui/jetpack-compose', () => {
  const { View } = require('react-native');
  return { Host: View, DateTimePicker: View };
});

// Doubles are module state, so reset them rather than leaking across tests.
afterEach(() => {
  const { notificationDouble } = require('./doubles/notifications');
  const { accessibilityDouble } = require('./doubles/accessibility');
  notificationDouble.reset();
  accessibilityDouble.reset();
});
