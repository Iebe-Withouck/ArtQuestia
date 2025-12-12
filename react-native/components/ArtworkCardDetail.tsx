import { useFonts } from 'expo-font';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Notifications from '@/components/Notifications';
import { useClaimedStickers } from '@/contexts/ClaimedStickersContext';

import NextIcon from '../assets/icons/next.png';
import Bell from '../assets/icons/doorbell_black.png';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface ArtworkCardDetailProps {
  artwork: {
    id: number;
    distance?: number;
    attributes: {
      Name: string;
      Creator: string;
      Year?: number;
      Theme?: string;
      Description?: string;
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
      Stickers?: {
        data?: {
          attributes?: {
            url?: string;
          };
        };
      };
      Stickers_Hidden?: {
        data?: {
          attributes?: {
            url?: string;
          };
        };
      };
    };
  };
  onClose?: () => void;
}

export default function ArtworkCardDetail({ artwork, onClose }: ArtworkCardDetailProps) {
  const router = useRouter();
  const { claimedStickers } = useClaimedStickers();
  const [fontsLoaded] = useFonts({
    Impact: require('../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });
  const [showNotifications, setShowNotifications] = useState(false);

  const handleStartRoute = () => {
    // Store artwork data in global state or pass via params
    // For now, we'll use router params
    if (onClose) onClose();

    // Voeg een unieke timestamp toe zodat de effect-hook in map.tsx altijd opnieuw triggert
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

  // Show notifications if opened
  if (showNotifications) {
    return <Notifications onClose={() => setShowNotifications(false)} />;
  }

  if (!artwork) {
    console.log('No artwork provided');
    return null;
  }

  const attributes = artwork.attributes || artwork;
  const artworkId = artwork.id;
  const isClaimed = claimedStickers.includes(artworkId);

  // Use Photo if claimed, otherwise use Photo_Hidden
  const photoSource = isClaimed ? attributes.Photo : attributes.Photo_Hidden;

  // Get Photo URL - Strapi Cloud returns full URLs, not relative paths
  let photoUrl: string | undefined = undefined;
  if (photoSource) {
    if (
      typeof photoSource === 'object' &&
      'data' in photoSource &&
      photoSource.data &&
      typeof photoSource.data === 'object' &&
      'attributes' in photoSource.data &&
      photoSource.data.attributes &&
      typeof photoSource.data.attributes === 'object' &&
      'url' in photoSource.data.attributes &&
      typeof photoSource.data.attributes.url === 'string'
    ) {
      photoUrl = photoSource.data.attributes.url;
    } else if (
      typeof photoSource === 'object' &&
      'attributes' in photoSource &&
      photoSource.attributes &&
      typeof photoSource.attributes === 'object' &&
      'url' in photoSource.attributes &&
      typeof photoSource.attributes.url === 'string'
    ) {
      photoUrl = photoSource.attributes.url;
    }
  }
  if (!photoUrl && (photoSource as any)?.url && typeof (photoSource as any).url === 'string') {
    photoUrl = (photoSource as any).url;
  }
  const fullImageUrl = photoUrl || null;

  // Get Stickers URL
  let stickersUrl: string | undefined = undefined;
  if (attributes.Stickers) {
    if (
      typeof attributes.Stickers === 'object' &&
      'data' in attributes.Stickers &&
      attributes.Stickers.data &&
      typeof attributes.Stickers.data === 'object' &&
      'attributes' in attributes.Stickers.data &&
      attributes.Stickers.data.attributes &&
      typeof attributes.Stickers.data.attributes === 'object' &&
      'url' in attributes.Stickers.data.attributes &&
      typeof attributes.Stickers.data.attributes.url === 'string'
    ) {
      stickersUrl = attributes.Stickers.data.attributes.url;
    } else if (
      typeof attributes.Stickers === 'object' &&
      'attributes' in attributes.Stickers &&
      attributes.Stickers.attributes &&
      typeof attributes.Stickers.attributes === 'object' &&
      'url' in attributes.Stickers.attributes &&
      typeof attributes.Stickers.attributes.url === 'string'
    ) {
      stickersUrl = attributes.Stickers.attributes.url;
    }
  }
  if (!stickersUrl && (attributes as any).Stickers?.url && typeof (attributes as any).Stickers.url === 'string') {
    stickersUrl = (attributes as any).Stickers.url;
  }
  const fullStickersUrl = stickersUrl || null;

  // Get Stickers_Hidden URL
  let stickersHiddenUrl: string | undefined = undefined;
  if (attributes.Stickers_Hidden) {
    if (
      typeof attributes.Stickers_Hidden === 'object' &&
      'data' in attributes.Stickers_Hidden &&
      attributes.Stickers_Hidden.data &&
      typeof attributes.Stickers_Hidden.data === 'object' &&
      'attributes' in attributes.Stickers_Hidden.data &&
      attributes.Stickers_Hidden.data.attributes &&
      typeof attributes.Stickers_Hidden.data.attributes === 'object' &&
      'url' in attributes.Stickers_Hidden.data.attributes &&
      typeof attributes.Stickers_Hidden.data.attributes.url === 'string'
    ) {
      stickersHiddenUrl = attributes.Stickers_Hidden.data.attributes.url;
    } else if (
      typeof attributes.Stickers_Hidden === 'object' &&
      'attributes' in attributes.Stickers_Hidden &&
      attributes.Stickers_Hidden.attributes &&
      typeof attributes.Stickers_Hidden.attributes === 'object' &&
      'url' in attributes.Stickers_Hidden.attributes &&
      typeof attributes.Stickers_Hidden.attributes.url === 'string'
    ) {
      stickersHiddenUrl = attributes.Stickers_Hidden.attributes.url;
    }
  }
  if (!stickersHiddenUrl && (attributes as any).Stickers_Hidden?.url && typeof (attributes as any).Stickers_Hidden.url === 'string') {
    stickersHiddenUrl = (attributes as any).Stickers_Hidden.url;
  }
  const fullStickersHiddenUrl = stickersHiddenUrl || null;

  // Get location info
  const lat = attributes.Location?.lat;
  const lon = attributes.Location?.lng;

  // Use the calculated distance from the artwork object (passed from index.tsx)
  const calculatedDistance = (artwork as any).distance;
  const distanceText = calculatedDistance && calculatedDistance !== Infinity
    ? `${calculatedDistance.toFixed(1)} km`
    : 'Distance not available';

  // Add # to color code if it doesn't already have it
  const backgroundColor = attributes.Color
    ? (attributes.Color.startsWith('#') ? attributes.Color : `#${attributes.Color}`)
    : '#FF5AE5';

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Back Button */}
        <TouchableOpacity style={[styles.nextButton]} onPress={onClose} >
          <Image source={NextIcon} style={styles.nextButtonIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellButton} onPress={() => setShowNotifications(true)}>
          <Image source={Bell} style={styles.bellIcon} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        {/* Main Photo */}
        {fullImageUrl && (
          <View style={[styles.imageContainer, { backgroundColor }]}>
            <Image source={{ uri: fullImageUrl }} style={styles.heroImage} />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>

          {/* Title Section */}
          <ThemedText style={[styles.title, { fontFamily: 'Impact' }]}>
            {attributes.Name || 'Untitled'}
          </ThemedText>

          <ThemedText style={[styles.creator, { fontFamily: 'LeagueSpartan-regular' }]}>
            {attributes.Creator || 'Unknown'}
          </ThemedText>

          {!isClaimed && (
            <ThemedText style={[styles.hidden, { fontFamily: 'Impact' }]}>
              Nog Verborgen
            </ThemedText>
          )}

          <View style={styles.rowButtons}>
            <TouchableOpacity style={styles.buttonContainer}>
              <ThemedText style={styles.buttonIcon}>Jaar</ThemedText>
              <View style={styles.button}>
                <ThemedText style={styles.buttonText}>{attributes.Year || 'N/A'}</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonContainer}>
              <ThemedText style={styles.buttonIcon}>Afstand</ThemedText>
              <View style={styles.button}>
                <ThemedText style={styles.buttonText}>{distanceText}</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonContainer}>
              <ThemedText style={styles.buttonIcon}>Thema</ThemedText>
              <View style={styles.button}>
                <ThemedText style={styles.buttonText}>{attributes.Theme || 'N/A'}</ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {attributes.Description && (
            <View style={styles.section}>
              <ThemedText style={[styles.description, { fontFamily: 'LeagueSpartan-regular' }]}>
                {attributes.Description}
              </ThemedText>
            </View>
          )}

          <TouchableOpacity
            style={styles.startTochtButton}
            onPress={handleStartRoute}>
            <ThemedText style={styles.startTochtButtonText}>Ga op ontdekking!</ThemedText>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },

  // Back Button
  nextButton: {
    position: 'absolute',
    top: verticalScale(60),
    left: scale(5),
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    transform: [{ rotate: '180deg' }],
  },
  nextButtonIcon: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
  },
  bellButton: {
    position: 'absolute',
    top: verticalScale(68),
    right: scale(20),
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  bellIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  notificationDot: {
    position: 'absolute',
    top: moderateScale(2),
    right: moderateScale(2),
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#FF0000',
    borderWidth: 1.5,
    borderColor: '#000',
  },

  // Hero Image
  imageContainer: {
    width: '100%',
    height: verticalScale(400),
    borderRadius: moderateScale(30),
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  heroImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },

  // Content
  contentContainer: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(30),
  },
  title: {
    fontSize: moderateScale(25),
    color: '#fff',
    marginBottom: verticalScale(5),
    lineHeight: moderateScale(38),
  },
  creator: {
    fontSize: moderateScale(18),
    color: '#fff',
    marginBottom: verticalScale(30),
  },

  hidden: {
    fontSize: moderateScale(15),
    color: '#F10906',
    marginBottom: verticalScale(30),
    borderColor: '#F10906',
    borderWidth: 1.5,
    padding: 10,
    textAlign: 'center',
    borderRadius: moderateScale(8),
  },

  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    maxWidth: scale(100),
    marginHorizontal: scale(0),
  },
  buttonIcon: {
    width: moderateScale(100),
    height: moderateScale(100),
    position: 'absolute',
    top: verticalScale(-5),
    zIndex: 10,
    color: '#fff',
    fontSize: moderateScale(20),
    fontFamily: 'Impact',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(8),
    backgroundColor: '#292929',
    paddingTop: verticalScale(20),
    minHeight: verticalScale(70),
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-regular',
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: verticalScale(30),
    marginTop: verticalScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(24),
    color: '#fff',
    marginBottom: verticalScale(12),
  },
  description: {
    fontSize: moderateScale(15),
    color: '#fff',
    lineHeight: moderateScale(22),
  },

  // Location
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: moderateScale(12),
    padding: scale(15),
    alignSelf: 'flex-start',
  },
  locationIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
    marginRight: scale(10),
  },
  locationText: {
    fontSize: moderateScale(14),
    color: '#fff',
  },

  // Images
  sectionImage: {
    width: '100%',
    height: verticalScale(300),
    resizeMode: 'cover',
    borderRadius: moderateScale(12),
    backgroundColor: '#1a1a1a',
  },
  stickerImage: {
    width: scale(200),
    height: scale(200),
    resizeMode: 'contain',
    alignSelf: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: moderateScale(12),
    padding: scale(20),
  },
  readMoreButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(50),
    marginBottom: verticalScale(10),
  },
  readMoreButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'Impact',
  },
  startTochtButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(50),
    marginBottom: verticalScale(10),
  },
  startTochtButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-semibold',
  },
});
