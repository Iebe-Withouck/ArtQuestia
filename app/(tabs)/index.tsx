import { useFonts } from 'expo-font';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// 👉 Pas deze aan naar jouw PNG's
import Icon1 from '../../assets/icons/route.png';
import Icon3 from '../../assets/icons/share.png';
import Icon2 from '../../assets/icons/stickers.png';

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

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
      {/* Zoekbalk */}
      <View style={styles.container}>
        <TextInput
          placeholder="Zoek naar kunstwerken"
          placeholderTextColor="#666666"
          style={[styles.input, { fontFamily: 'LeagueSpartan' }]}
        />

        <TouchableOpacity style={styles.searchButton}>
          <Image
            source={require('../../assets/icons/search.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      <ThemedText
        type="title"
        style={[styles.title, { fontFamily: 'LeagueSpartan' }]}
      >
        Begin de zoektocht!
      </ThemedText>

      <View style={styles.rowButtons}>

        {/* button 1 */}
        <TouchableOpacity style={styles.buttonContainer} onPress={() => { }}>
          <Image source={Icon1} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Kies je route</ThemedText>
          </View>
        </TouchableOpacity>

        {/* button 2 */}
        <TouchableOpacity style={styles.buttonContainer} onPress={() => { }}>
          <Image source={Icon2} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Verzamel stickers!</ThemedText>
          </View>
        </TouchableOpacity>

        {/* button 3 */}
        <TouchableOpacity style={styles.buttonContainer} onPress={() => { }}>
          <Image source={Icon3} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Deel je ervaring</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
      <ThemedText
        type="title"
        style={[styles.title, { fontFamily: 'LeagueSpartan' }]}
      >
        Dichtstbijzijnde kunstwerken
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
    backgroundColor: '#000000ff',
  },
  mainTitle: {
    fontSize: 32,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    marginTop: 8,
    color: '#fff',
  },

  rowButtons: {
    flexDirection: 'row',
    marginTop: 40,
    marginBottom: 20,
    gap: 9,
  },

  buttonContainer: {
    alignItems: 'center',
    position: 'relative',
    width: 115,
  },

  // Image boven de button
  buttonIcon: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: -25,
    zIndex: 10,
  },

  // De button
  button: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#292929',
    paddingTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'LeagueSpartan',
  },
  container: {
    flexDirection: 'row',
    width: '95%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
  },

  input: {
    flex: 1,
    paddingLeft: 15,
    fontSize: 15,
    color: '#000',
  },

  searchButton: {
    width: 50,
    backgroundColor: '#FF7700',
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
});