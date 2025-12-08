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
  const [fontsLoaded] = useFonts({
    Impact: require('../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });
  const [showNotifications, setShowNotifications] = useState(false);

  const handleStartRoute = () => {
    // Store artwork data in global state or pass via params
    // For now, we'll use router params
    if (onClose) onClose();

    // Navigate to map tab with artwork data
    router.push({
      pathname: '/(tabs)/map',
      params: {
        startRoute: 'true',
        artworkId: artwork.id.toString(),
        artworkName: attributes.Name,
        artworkLat: lat?.toString() || '',
        artworkLng: lon?.toString() || '',
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

  // Get Photo URL - Strapi Cloud returns full URLs, not relative paths
  const photoData = attributes.Photo?.data || attributes.Photo;
  const photoUrl = photoData?.attributes?.url || photoData?.url || attributes.Photo?.url;
  const fullImageUrl = photoUrl || null;

  // Get Photo_Hidden URL
  const photoHiddenData = attributes.Photo_Hidden?.data || attributes.Photo_Hidden;
  const photoHiddenUrl = photoHiddenData?.attributes?.url || photoHiddenData?.url || attributes.Photo_Hidden?.url;
  const fullPhotoHiddenUrl = photoHiddenUrl || null;

  // Get Stickers URL - Strapi Cloud returns full URLs
  const stickersData = attributes.Stickers?.data || attributes.Stickers;
  const stickersUrl = stickersData?.attributes?.url || stickersData?.url || attributes.Stickers?.url;
  const fullStickersUrl = stickersUrl || null;

  // Get Stickers_Hidden URL
  const stickersHiddenData = attributes.Stickers_Hidden?.data || attributes.Stickers_Hidden;
  const stickersHiddenUrl = stickersHiddenData?.attributes?.url || stickersHiddenData?.url || attributes.Stickers_Hidden?.url;
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
        </TouchableOpacity>

        {/* Main Photo */}
        {fullPhotoHiddenUrl && (
          <View style={[styles.imageContainer, { backgroundColor }]}>
            <Image source={{ uri: fullPhotoHiddenUrl }} style={styles.heroImage} />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>

          {/* Title Section */}
          <ThemedText style={[styles.title, { fontFamily: 'Impact' }]}>
            {attributes.Name || 'Untitled'}
          </ThemedText>

          <ThemedText style={[styles.creator, { fontFamily: 'LeagueSpartan' }]}>
            {attributes.Creator || 'Unknown'}
          </ThemedText>

          <ThemedText style={[styles.hidden, { fontFamily: 'Impact' }]}>
            Nog Verborgen
          </ThemedText>

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
              <ThemedText style={[styles.description, { fontFamily: 'LeagueSpartan' }]}>
                {attributes.Description}
              </ThemedText>
            </View>
          )}

          <TouchableOpacity
            style={styles.startTochtButton}
            onPress={handleStartRoute}>
            <ThemedText style={styles.startTochtButtonText}>Start je tocht naar {attributes.Name}</ThemedText>
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
    fontFamily: 'LeagueSpartan',
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
    fontFamily: 'Impact',
  },
});
