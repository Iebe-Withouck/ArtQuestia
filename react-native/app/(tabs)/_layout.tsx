import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

import HomeIcon from '@/assets/icons/home.png';
import HomeActiveIcon from '@/assets/icons/home_active.png';
import MapIcon from '@/assets/icons/map.png';
import MapActiveIcon from '@/assets/icons/map_active.png';
import ScanIcon from '@/assets/icons/scan.png';
import ScanActiveIcon from '@/assets/icons/scan_active.png';
import SettingsIcon from '@/assets/icons/settings.png';
import SettingsActiveIcon from '@/assets/icons/settings_active.png';
import StickersIcon from '@/assets/icons/stickerstab.png';
import StickersActiveIcon from '@/assets/icons/stickerstab_active.png';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const renderIcon = (icon: any, activeIcon: any, focused: boolean, label: string) => (
    <View style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      <Image
        source={focused ? activeIcon : icon}
        style={{
          width: focused ? 65 : 45,
          height: focused ? 65 : 45,
          resizeMode: 'contain',
          marginBottom: 8,
        }}
      />
      <Text
        style={{
          color: focused ? '#FFFFFF' : '#999999',
          fontSize: 8,
          fontWeight: focused ? '600' : '400',
          fontFamily: 'LeagueSpartan-semibold',
          textAlign: 'center',
          marginBottom: -20,
        }}
      >
        {label}
      </Text>
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
          height: 85,
        },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(SettingsIcon, SettingsActiveIcon, focused, 'account'),
        }}
      />

      <Tabs.Screen
        name="stickers"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(StickersIcon, StickersActiveIcon, focused, 'stickers'),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(HomeIcon, HomeActiveIcon, focused, 'home'),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(MapIcon, MapActiveIcon, focused, 'map'),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          tabBarIcon: ({ focused }) => renderIcon(ScanIcon, ScanActiveIcon, focused, 'AR'),
        }}
      />
    </Tabs>
  );
}