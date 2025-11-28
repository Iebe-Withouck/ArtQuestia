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
import MapIcon from '../assets/images/mapicon.png';
import NextIcon from '../assets/icons/next.png';

const STRAPI_URL = 'http://172.30.40.49:1337';

interface ArtworkCardProps {
  artwork: {
    id: number;
    attributes: {
      Name: string;
      Creator: string;
      Distance?: string;
      Photo?: {
        data?: {
          attributes?: {
            url?: string;
          };
        };
      };
    };
  };
  onNext?: () => void;
  index?: number;
}

export default function ArtworkCard({ artwork, onNext, index = 0 }: ArtworkCardProps) {
  const [fontsLoaded] = useFonts({
    Impact: require('../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const handleMapPress = () => {
    // Map navigation removed
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  // Add null checks for attributes
  if (!artwork) {
    console.log('No artwork provided');
    return null;
  }

  console.log('Rendering artwork:', artwork);

  const attributes = artwork.attributes || artwork;
  
  // Use Photo field with multiple fallback checks like in stickers.tsx
  const photoData = attributes.Photo?.data;
  const photoUrl = photoData?.attributes?.url || photoData?.url || attributes.Photo?.url;
  const fullImageUrl = photoUrl ? `${STRAPI_URL}${photoUrl}` : null;
  
  // Use the calculated distance from the artwork object (passed from index.tsx)
  const calculatedDistance = (artwork as any).distance;
  console.log('Artwork distance:', calculatedDistance);
  console.log('Full artwork object:', artwork);
  
  const distanceText = calculatedDistance && calculatedDistance !== Infinity 
    ? `${calculatedDistance.toFixed(1)} km` 
    : '1.5 km';
    
  console.log('Distance text:', distanceText);

  return (
    <ThemedView style={styles.titleContainer}>
      <View style={styles.artCard}>

        <View style={styles.mapWrapper}>
          <Image source={MapIcon} style={styles.mapImage} />
          <View style={styles.distanceBadge}>
            <Image source={Location} style={styles.distanceIcon} />
            <ThemedText style={styles.distanceText}>{distanceText}</ThemedText>
          </View>
        </View>

        {fullImageUrl ? (
          <Image source={{ uri: fullImageUrl }} style={styles.artImage} />
        ) : (
          <View style={[styles.artImage, { backgroundColor: '#444' }]} />
        )}

        <TouchableOpacity 
          style={[
            styles.nextButton, 
            index === 1 ? styles.nextButtonLeft : styles.nextButtonRight
          ]} 
          onPress={onNext}
        >
          <Image source={NextIcon} style={styles.nextButtonIcon} />
        </TouchableOpacity>

        <View style={styles.artTextWrapper}>
          <ThemedText style={[styles.artTitle, { fontFamily: 'Impact' }]}>
            {attributes.Name || 'Untitled'}
          </ThemedText>
          <ThemedText style={[styles.artSubtitle, { fontFamily: 'LeagueSpartan' }]}>
            {attributes.Creator || 'Unknown'}
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
    width: '80%',
    height: 300,
    resizeMode: 'contain',
    marginTop: 40,
    marginLeft: '20%',
    marginBottom: -100,
  },

  nextButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonRight: {
    right: 16,
  },
  nextButtonLeft: {
    left: 16,
    transform: [{ rotate: '180deg' }],
  },
  nextButtonIcon: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
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