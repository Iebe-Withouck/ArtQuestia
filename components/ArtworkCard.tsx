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

import Location from '../assets/icons/location.png';
import Ballerina from '../assets/images/ballerina.png';
import MapIcon from '../assets/images/mapicon.png';

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Impact: require('../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ThemedView style={styles.titleContainer}>
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
    paddingTop: 30,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  artCard: {
    width: '100%',
    backgroundColor: '#FF5AE5',
    borderRadius: 20,
    padding: 15,
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
    borderRadius: 10,
    borderColor: '#0000',
    borderWidth: 2,
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
    marginTop: 10,
    marginBottom: -78,
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