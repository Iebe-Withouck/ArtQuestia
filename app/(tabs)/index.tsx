import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFonts } from 'expo-font';

export default function SettingsScreen() {
    const [fontsLoaded] = useFonts({
    'Impact': require('../../assets/fonts/impact.ttf'),
    'LeagueSpartan': require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }
    return (
            <ThemedView style={styles.titleContainer}>
                <ThemedText
                    type="title"
                    style={{
                        fontFamily: 'Impact',
                        fontSize: 32,
                    }}>
                    ArtQuestia
                </ThemedText>
                <ThemedText
                    type="title"
                    style={{
                        fontFamily: 'LeagueSpartan',
                        fontSize: 16,
                    }}>
                    Beleef, ontdek, verbind
                </ThemedText>
            </ThemedView>
    )
}

const styles = StyleSheet.create({
    titleContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingTop: 50,
        paddingLeft: 20,
    },
});