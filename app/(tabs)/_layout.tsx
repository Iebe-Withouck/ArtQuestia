import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

import HomeIcon from '@/assets/icons/home.png';
import MapIcon from '@/assets/icons/map.png';
import ScanIcon from '@/assets/icons/scan.png';
import SettingsIcon from '@/assets/icons/settings.png';
import StickersIcon from '@/assets/icons/stickerstab.png';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const renderIcon = (icon, focused) => (
    <View
      style={{
        width: focused ? 70 : 50,
        height: focused ? 70 : 50,
        borderRadius: focused ? 35 : 25,
        backgroundColor: focused ? '#2B2B2B' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: focused ? -45 : 0,
      }}
    >
      <Image
        source={icon}
        style={{
          width: focused ? 50 : 45,
          height: focused ? 50 : 45,
          resizeMode: 'contain',
        }}
      />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#0000',
          borderTopWidth: 1,
          borderTopColor: '#4F4F4F',
          paddingTop: 15,
          paddingHorizontal: 15,
          height: 80,
        },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(SettingsIcon, focused),
        }}
      />

      <Tabs.Screen
        name="stickers"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(StickersIcon, focused),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(HomeIcon, focused),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(MapIcon, focused),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(ScanIcon, focused),
        }}
      />
    </Tabs>
  );
}