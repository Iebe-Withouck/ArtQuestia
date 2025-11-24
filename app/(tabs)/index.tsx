import { useFonts } from 'expo-font';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import Bell from '../../assets/icons/doorbell.png';
import Icon1 from '../../assets/icons/route.png';
import Search from '../../assets/icons/search.png';
import Icon3 from '../../assets/icons/share.png';
import Icon2 from '../../assets/icons/stickers.png';

import ArtworkCard from '@/components/ArtworkCard.tsx';

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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={styles.bellButton}>
        <Image source={Bell} style={styles.bellIcon} />
      </TouchableOpacity>

      <ThemedText type="title" style={[styles.mainTitle, { fontFamily: 'Impact' }]}>
        ArtQuestia
      </ThemedText>

      <ThemedText type="title" style={[styles.subtitle, { fontFamily: 'LeagueSpartan' }]}>
        Beleef, ontdek, verbind
      </ThemedText>

      <View style={styles.container}>
        <TextInput
          placeholder="Zoek naar kunstwerken"
          placeholderTextColor="#666666"
          style={[styles.input, { fontFamily: 'LeagueSpartan' }]}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Image source={Search} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ThemedText type="title" style={[styles.title, { fontFamily: 'LeagueSpartan' }]}>
        Begin de zoektocht!
      </ThemedText>

      <View style={styles.rowButtons}>
        <TouchableOpacity style={styles.buttonContainer}>
          <Image source={Icon1} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Kies je route</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer}>
          <Image source={Icon2} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Verzamel stickers!</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer}>
          <Image source={Icon3} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Deel je ervaring</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <ThemedText type="title" style={[styles.title, { fontFamily: 'LeagueSpartan' }]}>
        Dichtstbijzijnde kunstwerken
      </ThemedText>

      <ArtworkCard/>

      </ScrollView>
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
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingTop: 70,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 60,
  },
  bellButton: {
    position: 'absolute',
    top: 60,
    right: 25,
    width: 45,
    height: 45,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  bellIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
    marginTop: 20,
    color: '#fff',
  },

  container: {
    flexDirection: 'row',
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 16,
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
  buttonIcon: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: -25,
    zIndex: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 14,
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
});