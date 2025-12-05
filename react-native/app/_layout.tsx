import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

const CustomTheme = {
  dark: true,
  colors: {
    primary: '#FF7700',
    background: '#000000',
    card: '#000000',
    text: '#FFFFFF',
    border: '#292929',
    notification: '#FF7700',
  },
  fonts: {
    regular: {
      fontFamily: 'LeagueSpartan',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'LeagueSpartan',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'Impact',
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily: 'Impact',
      fontWeight: '900' as const,
    },
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={CustomTheme}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
