import { useFonts } from 'expo-font';
import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import Bell from '../../assets/icons/doorbell.png';
import Icon1 from '../../assets/icons/route.png';
import Search from '../../assets/icons/search.png';
import Icon3 from '../../assets/icons/share.png';
import Icon2 from '../../assets/icons/stickers.png';

import ArtworkCard from '@/components/ArtworkCard';
import ArtworkCardDetail from '@/components/ArtworkCardDetail';
import Notifications from '@/components/Notifications';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
export default function SettingsScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArtworks, setFilteredArtworks] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    getUserLocation();
    fetchArtworks();
  }, []);

  // Filter artworks based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArtworks([]);
    } else {
      const filtered = artworks.filter(artwork => {
        const attributes = artwork.attributes || artwork;
        return attributes.Name?.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredArtworks(filtered);
    }
  }, [searchQuery, artworks]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      console.log('User location:', location.coords);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const fetchArtworks = async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/artworks?populate=*`);
      const data = await response.json();

      console.log('Fetched artworks:', data);
      if (data.data && data.data[0]) {
        console.log('First artwork attributes:', data.data[0].attributes);
      }

      if (data.error) {
        console.error('Strapi API Error:', data.error);
        setLoading(false);
        return;
      }

      if (data.data) {
        console.log('Setting artworks:', data.data.length);
        setArtworks(data.data);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  // Show notifications if opened
  if (showNotifications) {
    return <Notifications onClose={() => setShowNotifications(false)} />;
  }

  // Show detail view if artwork is selected
  if (selectedArtwork) {
    return <ArtworkCardDetail artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />;
  }

  return (
    <ThemedView style={styles.titleContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.bellButton} onPress={() => setShowNotifications(true)}>
          <Image source={Bell} style={styles.bellIcon} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <ThemedText style={[styles.mainTitle]}>
          ArtQuestia
        </ThemedText>

        <ThemedText style={[styles.subtitle, { fontFamily: 'LeagueSpartan-regular' }]}>
          Ontdek Kortrijk, beleef de quest & scoor coupons
        </ThemedText>

        <View style={styles.container}>
          <TextInput
            placeholder="Zoek naar kunstwerken"
            placeholderTextColor="#666666"
            style={[styles.input, { fontFamily: 'LeagueSpartan-regular' }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Image source={Search} style={styles.icon} />
          </TouchableOpacity>
        </View>

        {/* Search results dropdown */}
        {filteredArtworks.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <ScrollView
              style={styles.searchResultsList}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {filteredArtworks.map((item) => {
                const attributes = item.attributes || item;
                const lat = attributes.Location?.lat;
                const lon = attributes.Location?.lng;
                const distance = userLocation && lat && lon
                  ? calculateDistance(userLocation.latitude, userLocation.longitude, lat, lon)
                  : null;

                return (
                  <TouchableOpacity
                    key={item.id.toString()}
                    style={styles.searchResultItem}
                    onPress={() => {
                      setSearchQuery('');
                      setFilteredArtworks([]);
                      const artworkWithDistance = {
                        ...item,
                        distance: distance || Infinity
                      };
                      setSelectedArtwork(artworkWithDistance);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchResultTextContainer}>
                      <ThemedText style={styles.searchResultTitle}>
                        {attributes.Name || 'Onbekend'}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <ThemedText style={[styles.title]}>
          Begin de zoektocht!
        </ThemedText>

        <View style={styles.rowButtons}>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => router.push('/(tabs)/map')}>
            <Image source={Icon1} style={styles.buttonIcon} />
            <View style={styles.button}>
              <ThemedText style={styles.buttonText}>Kies je quest</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonContainer} onPress={() => router.push('/(tabs)/stickers')}>
            <Image source={Icon2} style={styles.buttonIcon} />
            <View style={styles.button}>
              <ThemedText style={styles.buttonText}>Verzamel{'\n'}stickers!</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonContainer}>
            <Image source={Icon3} style={styles.buttonIcon} />
            <View style={styles.button}>
              <ThemedText style={styles.buttonText}>Deel je{"\n"}ervaring</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <ThemedText style={[styles.title]}>
          Dichtstbijzijnde kunstwerken
        </ThemedText>

        {(() => {
          if (!userLocation) {
            return (
              <ThemedText style={{ color: '#fff', padding: 20, textAlign: 'center' }}>
                Locatie ophalen...
              </ThemedText>
            );
          }

          if (artworks.length === 0) {
            return (
              <ThemedText style={{ color: '#fff', padding: 20, textAlign: 'center' }}>
                Geen kunstwerken gevonden
              </ThemedText>
            );
          }

          // Calculate distances and sort artworks
          const artworksWithDistance = artworks
            .map(artwork => {
              const attributes = artwork.attributes || artwork;

              // Location is a nested object with lat and lng properties
              const lat = attributes.Location?.lat;
              const lon = attributes.Location?.lng;

              if (!lat || !lon) {
                console.log('Missing lat/lon for artwork:', attributes.Name);
                return { ...artwork, distance: Infinity };
              }

              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                lat,
                lon
              );

              console.log('Calculated distance for', attributes.Name, ':', distance, 'km');

              return { ...artwork, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 2); // Only take the 2 closest

          const handleNext = (index: number) => {
            const nextIndex = (index + 1) % artworksWithDistance.length;
            setCurrentArtworkIndex(nextIndex);
            scrollViewRef.current?.scrollTo({
              x: nextIndex * width,
              animated: true,
            });
          };

          return (
            <View style={styles.artworkContainer}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                onMomentumScrollEnd={(event) => {
                  const contentOffsetX = event.nativeEvent.contentOffset.x;
                  const newIndex = Math.round(contentOffsetX / width);
                  setCurrentArtworkIndex(newIndex);
                }}
              >
                {artworksWithDistance.map((artwork, index) => (
                  <View key={artwork.id || index} style={styles.artworkCardWrapper}>
                    <TouchableOpacity onPress={() => setSelectedArtwork(artwork)} activeOpacity={0.95}>
                      <ArtworkCard
                        artwork={artwork}
                        onNext={() => handleNext(index)}
                        index={index}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          );
        })()}

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
    paddingTop: verticalScale(70),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(60),
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

  mainTitle: {
    fontFamily: 'Impact',
    fontSize: moderateScale(32),
    color: '#fff',
    lineHeight: moderateScale(38),
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: '#fff',
  },
  title: {
    marginTop: verticalScale(40),
    fontFamily: 'Impact',
    fontSize: moderateScale(24),
    color: '#fff',
  },
  artworkScrollView: {
    width: '100%',
    marginTop: verticalScale(10),
    marginHorizontal: scale(-20),
  },
  artworkScrollContent: {
    paddingHorizontal: 0,
  },
  artworkContainer: {
    width: '110%',
    marginTop: verticalScale(5),
    marginLeft: scale(-20),
    marginRight: scale(-20),
  },
  artworkCardWrapper: {
    width: width,
    paddingHorizontal: scale(20),
  },

  container: {
    flexDirection: 'row',
    width: '100%',
    height: verticalScale(45),
    backgroundColor: '#fff',
    borderRadius: moderateScale(30),
    overflow: 'hidden',
    marginTop: verticalScale(16),
  },
  input: {
    flex: 1,
    paddingLeft: scale(15),
    fontSize: moderateScale(15),
    color: '#000',
  },
  searchButton: {
    width: moderateScale(50),
    backgroundColor: '#FF7700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: moderateScale(18),
    height: moderateScale(18),
    tintColor: '#fff',
  },

  searchResultsContainer: {
    marginTop: verticalScale(10),
    maxHeight: height * 0.25,
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    zIndex: 9,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchResultsList: {
    maxHeight: height * 0.25,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    width: '100%',
  },
  searchResultTextContainer: {
    flex: 1,
    marginRight: scale(12),
  },
  searchResultTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#000',
    marginBottom: verticalScale(4),
    fontFamily: 'LeagueSpartan-regular',
  },
  searchResultDistance: {
    fontSize: moderateScale(14),
    color: '#000000',
    fontFamily: 'LeagueSpartan-regular',
  },

  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(40),
    marginBottom: verticalScale(20),
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    maxWidth: scale(100),
  },
  buttonIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    position: 'absolute',
    top: verticalScale(-25),
    zIndex: 10,
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
    margin: -10,
    lineHeight: moderateScale(16),
  },
});