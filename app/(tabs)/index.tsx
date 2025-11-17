import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsScreen() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  // Show a loading indicator until fonts are ready
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ThemedView style={styles.titleContainer}>
      <ThemedText
        type="title"
        style={[styles.mainTitle, { fontFamily: 'Impact' }]}
      >
        ArtQuestia
      </ThemedText>
      <ThemedText
        type="title"
        style={[styles.subtitle, { fontFamily: 'LeagueSpartan' }]}
      >
        Beleef, ontdek, verbind
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingLeft: 20,
  },
  mainTitle: {
    fontSize: 32,
    // Optional: add color or other styles
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#555',
  },
});
