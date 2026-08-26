import { Tabs } from 'expo-router';
import React from 'react';
import { type ColorValue, Platform } from 'react-native';

import { Icon, type IconName } from '@/components';
import { colors, fonts } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryPressed,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodySemibold,
          fontSize: 12,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: (props) => <TabIcon name="bloom" {...props} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: (props) => <TabIcon name="bars" {...props} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: (props) => <TabIcon name="person" {...props} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: Readonly<{
  name: IconName;
  color: ColorValue;
  focused: boolean;
}>) {
  return <Icon name={name} color={String(color)} active={focused} size={26} />;
}
