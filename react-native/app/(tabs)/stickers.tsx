import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { useClaimedStickers } from '@/contexts/ClaimedStickersContext';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ArtworkCardDetail from '@/components/ArtworkCardDetail';
import Notifications from '@/components/Notifications';

import Bell from '../../assets/icons/doorbell.png';
import Icon11 from '../../assets/prestaties/11.png';
import Icon4 from '../../assets/prestaties/4.png';
import Icon7 from '../../assets/prestaties/7.png';
import Icon120 from '../../assets/prestaties/120.png';
import Icon55 from '../../assets/prestaties/55.png';
import Route from '../../assets/icons/themaRouteIcon.png';
import Cross from '../../assets/icons/cross.png';

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const { claimedStickers } = useClaimedStickers();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [stickerTypeDropdownVisible, setStickerTypeDropdownVisible] = useState(false);
  const [themeQuestDropdownVisible, setThemeQuestDropdownVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("Alle");
  const [selectedStickerType, setSelectedStickerType] = useState("Alle stickers");
  const [selectedThemeQuest, setSelectedThemeQuest] = useState("Oorlog");
  const [artworks, setArtworks] = useState<any[]>([]);
  const [themes, setThemes] = useState<string[]>(['Alle', 'Religie', 'Historie', 'Moderne Kunst', 'ZieMie', 'Oorlog']);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<any>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const stickerTypes = ['Alle stickers', 'Gevonden stickers', 'Verborgen stickers'];

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

  useEffect(() => {
    console.log('Component mounted, fetching artworks...');
    getUserLocation();
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/artworks?populate=*`);
      const data = await response.json();

      console.log('API Response:', data);

      if (data.error) {
        console.error('Strapi API Error:', data.error);
        alert(`API Error: ${data.error.message}. Please enable public access to artworks in Strapi Settings > Users & Permissions > Public > Artwork`);
        setLoading(false);
        return;
      }

      if (data.data) {
        console.log('First artwork:', JSON.stringify(data.data[0], null, 2));
        setArtworks(data.data);
        console.log('Artworks set:', data.data.length);

        // Extract unique themes - Strapi v4 uses attributes
        const uniqueThemes = ['Alle', ...new Set(
          data.data
            .map((artwork: any) => {
              const theme = artwork.attributes?.Theme || artwork.Theme;
              console.log('Theme found:', theme);
              return theme;
            })
            .filter((theme: string) => theme)
        )];
        setThemes(uniqueThemes as string[]);
        console.log('Themes set:', uniqueThemes);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      alert(`Network Error: ${error}. Make sure Strapi is running on ${STRAPI_URL}`);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setDropdownVisible(false);
  };

  const handleStickerTypeSelect = (type: string) => {
    setSelectedStickerType(type);
    setStickerTypeDropdownVisible(false);
  };

  const handleThemeQuestSelect = (theme: string) => {
    setSelectedThemeQuest(theme);
    setThemeQuestDropdownVisible(false);
  };

  const handleStickerPress = (artwork: any) => {
    // Calculate distance if user location is available
    if (userLocation) {
      const attributes = artwork.attributes || artwork;
      const lat = attributes.Location?.lat;
      const lon = attributes.Location?.lng;

      if (lat && lon) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          lat,
          lon
        );
        artwork.distance = distance;
      }
    }
    setSelectedSticker(artwork);
    setModalVisible(true);
  };

  const currentStickers = selectedTheme === 'Alle'
    ? artworks
    : artworks.filter(artwork => {
      const theme = artwork.attributes?.Theme || artwork.Theme;
      console.log('Filtering - Artwork:', JSON.stringify(artwork, null, 2));
      console.log('Filtering - Theme value:', `"${theme}"`, 'Type:', typeof theme);
      console.log('Filtering - Selected:', `"${selectedTheme}"`, 'Type:', typeof selectedTheme);
      console.log('Filtering - Match:', theme === selectedTheme);
      return theme === selectedTheme;
    });

  console.log('Total artworks:', artworks.length);
  console.log('Current stickers count:', currentStickers.length, 'Selected theme:', selectedTheme);

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  // Show notifications if opened
  if (showNotifications) {
    return <Notifications onClose={() => setShowNotifications(false)} />;
  }

  // Show detail view if artwork is selected
  if (showDetailView && selectedSticker) {
    return <ArtworkCardDetail artwork={selectedSticker} onClose={() => setShowDetailView(false)} />;
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

        <View style={[styles.themaRoute, { marginTop: verticalScale(50) }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10) }}
            onPress={() => {
              setThemeQuestDropdownVisible(!themeQuestDropdownVisible);
              setDropdownVisible(false);
              setStickerTypeDropdownVisible(false);
            }}
          >
            <ThemedText style={[styles.title, { marginTop: 0 }]}>
              {selectedThemeQuest} quest
            </ThemedText>
            <Image source={require('../../assets/icons/arrow.png')} style={[styles.dropdownArrow, { transform: [{ rotate: themeQuestDropdownVisible ? '180deg' : '0deg' }] }]} />
          </TouchableOpacity>
          <ThemedText style={[styles.percentage, { marginTop: 0 }]}>
            55% compleet
          </ThemedText>
        </View>

        {themeQuestDropdownVisible && (
          <View style={[styles.dropdownContainerOrange, { marginTop: verticalScale(10), marginBottom: verticalScale(10) }]}>
            {themes.filter(theme => theme !== 'Alle').map((theme, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleThemeQuestSelect(theme)}
              >
                <ThemedText style={styles.dropdownText}>{theme}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Image source={Route} style={styles.themaRouteIcon} />


        <ThemedText style={[styles.stickersTitle]}>
          Stickers
        </ThemedText>
        <View style={styles.buttonContainerStickers}>
          <TouchableOpacity
            style={styles.buttonStickers1}
            onPress={() => {
              setStickerTypeDropdownVisible(!stickerTypeDropdownVisible);
              setDropdownVisible(false);
            }}
          >
            <ThemedText style={styles.buttonTextStickers}>{selectedStickerType}</ThemedText>
            <Image source={require('../../assets/icons/arrow.png')} style={[styles.dropdownArrow, { transform: [{ rotate: stickerTypeDropdownVisible ? '180deg' : '0deg' }] }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonStickers2}
            onPress={() => {
              setDropdownVisible(!dropdownVisible);
              setStickerTypeDropdownVisible(false);
            }}
          >
            <ThemedText style={styles.buttonTextStickers}>{selectedTheme === 'Alle' ? "Quests" : selectedTheme}</ThemedText>
            <Image source={require('../../assets/icons/arrow.png')} style={[styles.dropdownArrow, { transform: [{ rotate: dropdownVisible ? '180deg' : '0deg' }] }]} />
          </TouchableOpacity>
        </View>

        {stickerTypeDropdownVisible && (
          <View style={styles.dropdownContainerBlue}>
            {stickerTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleStickerTypeSelect(type)}
              >
                <ThemedText style={styles.dropdownText}>{type}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {dropdownVisible && (
          <View style={styles.dropdownContainerOrange}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                console.log('Selected theme: Alle');
                handleThemeSelect('Alle');
              }}
            >
              <ThemedText style={styles.dropdownText}>Alle Quests</ThemedText>
            </TouchableOpacity>
            {themes.filter(theme => theme !== 'Alle').map((theme, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => {
                  console.log('Selected theme:', theme);
                  handleThemeSelect(theme);
                }}
              >
                <ThemedText style={styles.dropdownText}>{theme}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.rowStickers}>
          {currentStickers.length === 0 ? (
            <ThemedText style={{ color: '#fff', padding: 20 }}>
              No stickers found for theme: {selectedTheme}
            </ThemedText>
          ) : (
            currentStickers.map((artwork, index) => {
              const attributes = artwork.attributes || artwork;
              const artworkId = artwork.id;
              const isClaimed = claimedStickers.includes(artworkId);

              // Use Stickers if claimed, otherwise use Stickers_Hidden
              const stickerSource = isClaimed ? attributes.Stickers : attributes.Stickers_Hidden;
              const stickerData = stickerSource?.data || stickerSource;
              const stickerUrl = stickerData?.attributes?.url || stickerData?.url || stickerSource?.url;
              const fullUrl = stickerUrl || null;

              console.log('Rendering sticker:', attributes.Name, 'Claimed:', isClaimed, 'URL:', fullUrl);

              return (
                <TouchableOpacity
                  key={artwork.id || index}
                  style={styles.stickerContainer}
                  onPress={() => handleStickerPress(artwork)}
                >
                  {fullUrl ? (
                    <Image
                      source={{ uri: fullUrl }}
                      style={styles.stickerIcon}
                    />
                  ) : (
                    <View style={[styles.stickerIcon, { backgroundColor: '#444' }]} />
                  )}
                  <ThemedText style={styles.stickerName}>
                    {attributes.Name || 'Untitled'}
                  </ThemedText>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSticker && (() => {
              const attributes = selectedSticker.attributes || selectedSticker;
              const artworkId = selectedSticker.id;
              const isClaimed = claimedStickers.includes(artworkId);

              // Use Stickers if claimed, otherwise use Stickers_Hidden
              const stickerSource = isClaimed ? attributes.Stickers : attributes.Stickers_Hidden;
              const stickerData = stickerSource?.data || stickerSource;
              const stickerUrl = stickerData?.attributes?.url || stickerData?.url || stickerSource?.url;
              const fullUrl = stickerUrl || null;

              return (
                <>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Image source={Cross} style={styles.closeButtonIcon} />
                  </TouchableOpacity>

                  {fullUrl && (
                    <Image
                      source={{ uri: fullUrl }}
                      style={styles.modalStickerImage}
                    />
                  )}

                  <ThemedText style={styles.modalTitle}>
                    {attributes.Name || 'Untitled'}
                  </ThemedText>

                  <ThemedText style={styles.modalCreator}>
                    {attributes.Creator || 'Onbekend'}
                  </ThemedText>

                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() => {
                      setModalVisible(false);
                      setShowDetailView(true);
                    }}
                  >
                    <ThemedText style={styles.readMoreButtonText}>Lees meer</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deelButton}
                    onPress={() => {
                      setModalVisible(false);
                    }}
                  >
                    <ThemedText style={styles.deelButtonText}>Deel je ervaring!</ThemedText>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
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
    fontSize: moderateScale(24),
    marginTop: verticalScale(50),
    color: '#fff',
    fontFamily: 'Impact',
  },
  stickersTitle: {
    fontSize: moderateScale(24),
    marginTop: verticalScale(50),
    marginBottom: verticalScale(10),
    color: '#fff',
    fontFamily: 'Impact',
  },
  percentage: {
    fontSize: moderateScale(15),
    marginTop: verticalScale(50),
    color: '#fff',
    fontFamily: 'LeagueSpartan-regular',
  },
  prestatiesSubtitle: {
    fontSize: moderateScale(15),
    color: '#ffffffff',
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

  rowButtonsScrollView: {
    marginTop: verticalScale(20),
    paddingTop: verticalScale(30),
  },
  rowButtonsContent: {
    flexDirection: 'row',
    gap: scale(5),
    paddingRight: scale(20),
    paddingLeft: (0),
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(40),
    marginBottom: verticalScale(20),
    width: '100%',
    gap: scale(10),
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'relative',
    width: scale(88),
  },
  buttonIcon: {
    width: moderateScale(60),
    height: moderateScale(77),
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
    marginTop: verticalScale(40),
    paddingTop: verticalScale(20),
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-regular',
    textAlign: 'center',
  },
  themaRoute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  themaRouteIcon: {
    width: '100%',
    height: verticalScale(60),
    resizeMode: 'contain',
  },
  buttonContainerStickers: {
    flexDirection: 'row',
    gap: scale(10),
    marginTop: verticalScale(10),
  },
  buttonStickers1: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(30),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#215AFF',
    gap: scale(5),
  },
  buttonStickers2: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(30),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7700',
    gap: scale(5),
  },
  dropdownArrow: {
    width: moderateScale(10),
    height: moderateScale(10),
    tintColor: '#fff',
  },
  dropdownContainerBlue: {
    backgroundColor: '#215AFF',
    borderRadius: moderateScale(14),
    marginTop: verticalScale(5),
    overflow: 'hidden',
  },
  dropdownContainerOrange: {
    backgroundColor: '#FF7700',
    borderRadius: moderateScale(14),
    marginTop: verticalScale(5),
    overflow: 'hidden',
  },
  dropdownContainer: {
    backgroundColor: '#292929',
    borderRadius: moderateScale(14),
    marginTop: verticalScale(5),
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  dropdownText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-regular',
  },
  buttonTextStickers: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-regular',
    fontWeight: 'bold',
  },
  rowStickers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    columnGap: scale(10),
    rowGap: verticalScale(60),
    marginTop: verticalScale(70),
    marginBottom: verticalScale(50),
    width: '100%',
  },
  stickerContainer: {
    alignItems: 'center',
    position: 'relative',
    width: '31%', // 3 columns: 31% each
    minHeight: verticalScale(120),
  },
  stickerIcon: {
    width: moderateScale(93),
    height: moderateScale(93),
    position: 'absolute',
    top: verticalScale(-30),
    zIndex: 10,
  },
  stickerName: {
    color: '#fff',
    fontSize: moderateScale(15),
    lineHeight: moderateScale(14),
    fontFamily: 'LeagueSpartan-semibold',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: verticalScale(85),
    paddingHorizontal: scale(2),
    flexWrap: 'wrap',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: moderateScale(20),
    padding: scale(30),
    width: '90%',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: verticalScale(20),
    right: scale(20),
    width: moderateScale(35),
    height: moderateScale(35),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButtonText: {
    color: '#000000ff',
    fontSize: moderateScale(23),
    fontFamily: 'Impact',
  },
  modalStickerImage: {
    width: moderateScale(150),
    height: moderateScale(150),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: moderateScale(24),
    color: '#fff',
    fontFamily: 'Impact',
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
  modalCreator: {
    fontSize: moderateScale(16),
    color: '#ccc',
    fontFamily: 'LeagueSpartan',
    textAlign: 'center',
    marginBottom: verticalScale(25),
  },
  readMoreButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(95),
    borderRadius: moderateScale(25),
    marginBottom: verticalScale(10),
  },
  readMoreButtonText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-regular',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deelButton: {
    backgroundColor: '#215AFF',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(73),
    borderRadius: moderateScale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  deelButtonText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-regular',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});