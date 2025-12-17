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
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useClaimedStickers } from '@/contexts/ClaimedStickersContext';

import Location from '../assets/icons/location.png';
import MapIcon from '../assets/images/mapicon.png';
import NextIcon from '../assets/icons/next.png';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';

interface ArtworkCardProps {
  artwork: {
    id: number;
    attributes: {
      Name: string;
      Creator: string;
      Distance?: string;
      Color?: string;
      Photo?: {
        data?: {
          attributes?: {
            url?: string;
          };
        };
      };
      Photo_Hidden?: {
        data?: {
          attributes?: {
            url?: string;
          };
        };
      };
      Location?: {
        lat?: number;
        lng?: number;
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

  const router = useRouter();
  const { claimedStickers } = useClaimedStickers();

  const handleMapPress = () => {
    const lat = attributes.Location?.lat;
    const lon = attributes.Location?.lng;
    router.push({
      pathname: '/(tabs)/map',
      params: {
        startRoute: 'true',
        artworkId: artwork.id.toString(),
        artworkName: attributes.Name,
        artworkLat: lat?.toString() || '',
        artworkLng: lon?.toString() || '',
        routeTs: Date.now().toString(),
      }
    });
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!artwork) {
    console.log('No artwork provided');
    return null;
  }

  console.log('Rendering artwork:', artwork);

  const attributes = artwork.attributes || artwork;
  const artworkId = artwork.id;
  const isClaimed = claimedStickers.includes(artworkId);

  const photoSource = isClaimed ? attributes.Photo : attributes.Photo_Hidden;
  let photoUrl: string | undefined = undefined;
  if (photoSource && typeof photoSource === 'object') {
    if ('data' in photoSource && photoSource.data && typeof photoSource.data === 'object') {
      photoUrl = photoSource.data.attributes?.url;
    } else if ('attributes' in photoSource && photoSource.attributes && typeof photoSource.attributes === 'object' && (photoSource.attributes as any).url) {
      photoUrl = (photoSource.attributes as { url?: string }).url;
    } else if ('url' in photoSource) {
      photoUrl = (photoSource as { url?: string }).url;
    }
  }

  console.log('Artwork ID:', artworkId, 'Claimed:', isClaimed);
  console.log('Photo URL:', photoUrl);

  const fullImageUrl = photoUrl || null;
  console.log('Full image URL:', fullImageUrl);

  const calculatedDistance = (artwork as any).distance;
  console.log('Artwork distance:', calculatedDistance);
  console.log('Full artwork object:', artwork);

  const distanceText = calculatedDistance && calculatedDistance !== Infinity
    ? `${calculatedDistance.toFixed(1)} km`
    : '1.5 km';

  console.log('Distance text:', distanceText);
  console.log('Color from attributes:', attributes.Color);

  const backgroundColor = attributes.Color
    ? (attributes.Color.startsWith('#') ? attributes.Color : `#${attributes.Color}`)
    : '#FF5AE5';

  console.log('Final backgroundColor:', backgroundColor);

  return (
    <ThemedView style={styles.titleContainer}>
      <View style={[styles.artCard, { backgroundColor }]}>

        <TouchableOpacity style={styles.mapWrapper} onPress={handleMapPress}>
          <Image source={MapIcon} style={styles.mapImage} />
          <View style={styles.distanceBadge}>
            <Image source={Location} style={styles.distanceIcon} />
            <ThemedText style={styles.distanceText}>{distanceText}</ThemedText>
          </View>
        </TouchableOpacity>

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
          <ThemedText style={[styles.artTitle, { fontFamily: 'Impact', textAlign: 'left' }]}>{attributes.Name || 'Untitled'}</ThemedText>
          <ThemedText style={[styles.artSubtitle, { fontFamily: 'LeagueSpartan-regular', textAlign: 'left' }]}>{attributes.Creator || 'Unknown'}</ThemedText>
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
    fontFamily: 'LeagueSpartan-regular',
  },

  artImage: {
    width: '80%',
    height: 300,
    resizeMode: 'contain',
    marginTop: 40,
    marginLeft: '8%',
    marginBottom: -100,
  },

  nextButton: {
    position: 'absolute',
    top: '47%',
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonRight: {
    right: 0,
  },
  nextButtonLeft: {
    left: 0,
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
    alignItems: 'flex-start',
    width: '100%',
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