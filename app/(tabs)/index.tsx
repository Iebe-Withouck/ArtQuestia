import { useFonts } from 'expo-font';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import Bell from '../../assets/icons/doorbell.png';
import Location from '../../assets/icons/location.png';
import Icon1 from '../../assets/icons/route.png';
import Search from '../../assets/icons/search.png';
import Icon3 from '../../assets/icons/share.png';
import Icon2 from '../../assets/icons/stickers.png';
import Ballerina from '../../assets/images/ballerina.png';
import MapIcon from '../../assets/images/mapicon.png';

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

      <View style={styles.artCard}>

        <View style={styles.mapWrapper}>
          <Image source={MapIcon} style={styles.mapImage} />
          <View style={styles.distanceBadge}>
            <Image source={Location} style={styles.distanceIcon} />
            <ThemedText style={styles.distanceText}>1.5 km</ThemedText>
          </View>
        </View>

        <Image source={Ballerina} style={styles.artImage} />

        <TouchableOpacity style={styles.nextButton}>
          <ThemedText style={styles.nextButtonText}>{'>'}</ThemedText>
        </TouchableOpacity>

        <View style={styles.artTextWrapper}>
          <ThemedText style={[styles.artTitle, { fontFamily: 'Impact' }]}>
            Ballerina
          </ThemedText>
          <ThemedText style={[styles.artSubtitle, { fontFamily: 'LeagueSpartan' }]}>
            Stephan Balkenhol
          </ThemedText>
        </View>

      </View>
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
    paddingTop: 70,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#000',
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

  artCard: {
    marginTop: 10,
    width: '100%',
    backgroundColor: '#FF5AE5',
    borderRadius: 20,
    padding: 15,
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 20,
  },

  mapWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 90,
    height: 70,
    borderRadius: 10,
    overflow: 'visible',
    backgroundColor: '#000',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  distanceBadge: {
    position: 'absolute',
    bottom: -18,
    left: '50%',
    transform: [{ translateX: -38 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 20,
  },
  distanceIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  distanceText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'LeagueSpartan',
  },

  artImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginTop: 25,
    marginBottom: -75,
  },

  nextButton: {
    position: 'absolute',
    right: 16,
    top: '55%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 20,
  },

  artTextWrapper: {
    marginTop: 10,
  },
  artTitle: {
    color: '#fff',
    fontSize: 18,
  },
  artSubtitle: {
    color: '#fff',
    fontSize: 13,
  },
});