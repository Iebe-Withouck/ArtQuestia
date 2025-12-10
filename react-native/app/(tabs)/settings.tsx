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
import AsyncStorage from '@react-native-async-storage/async-storage';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';


const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ArtworkCardDetail from '@/components/ArtworkCardDetail';
import SettingsEdit from '@/components/SettingsEdit';
import Notifications from '@/components/Notifications';

import Bell from '../../assets/icons/doorbell.png';
import Oorlog from '../../assets/profile-info/oorlogsmonumenten.png';
import Religie from '../../assets/profile-info/religie.png';
import Cross from '../../assets/icons/cross.png';
import Info from '../../assets/icons/info.png';
import Age from '../../assets/profile-info/age.png';
import RoutesComplete from '../../assets/profile-info/routesComplete.png'
import FoundedStickers from "../../assets/profile-info/foundedStickers.png"
import ProfilePic from '../../assets/profile-info/profile-pic.png';
import Potlood from '../../assets/profile-info/potlood.png'
import Delete from '../../assets/icons/delete.png'

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [stickerTypeDropdownVisible, setStickerTypeDropdownVisible] = useState(false);
  const [themaRouteDropdownVisible, setThemaRouteDropdownVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("Alle");
  const [selectedStickerType, setSelectedStickerType] = useState("Alle stickers");
  const [selectedThemaRoute, setSelectedThemaRoute] = useState("Themaroute toevoegen");
  const [artworks, setArtworks] = useState<any[]>([]);
  const [themes, setThemes] = useState<string[]>(['Alle', 'Religie', 'Historie', 'Moderne Kunst', 'ZieMie', 'Oorlog']);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<any>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showEditView, setShowEditView] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userName, setUserName] = useState('Jane Doe');
  const [userAge, setUserAge] = useState('22');
  const [themaRoutes, setThemaRoutes] = useState<any[]>([]);
  const [availableThemes, setAvailableThemes] = useState<any[]>([]);

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
    fetchThemes();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const age = await AsyncStorage.getItem('userAge');

      if (name) setUserName(name);
      if (age) setUserAge(age);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchThemes = async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/themes?populate=*`);
      const data = await response.json();

      if (data.error) {
        console.error('Strapi API Error:', data.error);
        return;
      }

      if (data.data) {
        const themesData = data.data.map((theme: any) => ({
          id: theme.id,
          name: theme.Name,
          image: theme.Image?.[0]?.url || null
        }));
        setAvailableThemes(themesData);
        setThemaRoutes(themesData.slice(0, 2));
        console.log('Themes loaded:', themesData.length);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

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

  const handleThemaRouteSelect = (themeName: string) => {
    // Find the theme in availableThemes
    const themeToAdd = availableThemes.find(t => t.name === themeName);

    if (themeToAdd && !themaRoutes.some(r => r.id === themeToAdd.id)) {
      setThemaRoutes([...themaRoutes, themeToAdd]);
    }

    setSelectedThemaRoute('Themaroute toevoegen');
    setThemaRouteDropdownVisible(false);
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

  // Show edit view if edit icon is clicked
  if (showEditView) {
    return (
      <SettingsEdit
        onClose={() => setShowEditView(false)}
        userName={userName}
        userAge={userAge}
        onSave={async (name: string, age: string) => {
          setUserName(name);
          setUserAge(age);
          await AsyncStorage.setItem('userName', name);
          await AsyncStorage.setItem('userAge', age);
          setShowEditView(false);
        }}
      />
    );
  }

  return (
    <ThemedView style={styles.titleContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.bellButton} onPress={() => setShowNotifications(true)}>
            <Image source={Bell} style={styles.bellIcon} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoButton}>
            <Image source={Info} style={styles.infoIcon} />
          </TouchableOpacity>

          <View style={styles.profileContainer}>
            <View style={styles.profilePicWrapper}>
              <View style={styles.profilePicCircle}>
                <Image
                  source={ProfilePic}
                  style={styles.profilePic}
                  resizeMode="cover"
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  console.log('Edit icon pressed!');
                  setShowEditView(true);
                }}
                activeOpacity={0.9}
                style={styles.editIconTouchable}
              >
                <Image source={Potlood} style={styles.editIconImage} />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.profileName} numberOfLines={2}>{userName}</ThemedText>
          </View>

          <View style={styles.rowInfo}>
            <TouchableOpacity style={styles.infoContainer}>
              <Image source={Age} style={styles.infoIcons} />
              <ThemedText style={styles.infoNumberAge}>{userAge}</ThemedText>
              <View style={styles.info}>
                <ThemedText style={styles.infoText}>Leeftijd</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoContainer}>
              <Image source={RoutesComplete} style={styles.infoIcons} />
              <ThemedText style={styles.infoNumberRoutes}>5</ThemedText>
              <View style={styles.info}>
                <ThemedText style={styles.infoText}>Complete{"\n"}routes</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoContainer}>
              <Image source={FoundedStickers} style={styles.infoIcons} />
              <ThemedText style={styles.infoNumberStickers}>12</ThemedText>
              <View style={styles.info}>
                <ThemedText style={styles.infoText}>Gevonden{"\n"}stickers</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.themaRoute}>
          <ThemedText style={[styles.title]}>
            Quest routes
          </ThemedText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.themaRouteScrollView}
          contentContainerStyle={styles.themaRouteRow}
        >
          {themaRoutes.map((route) => (
            <View key={route.id} style={styles.themaRouteContainer}>
              {route.image ? (
                <Image source={{ uri: route.image }} style={styles.themaRouteIcon} />
              ) : (
                <View style={[styles.themaRouteIcon, { backgroundColor: '#444' }]} />
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setThemaRoutes(themaRoutes.filter(r => r.id !== route.id))}
              >
                <Image source={Delete} style={styles.deleteIcon} />
              </TouchableOpacity>
              <ThemedText style={styles.themaRouteName}>{route.name}</ThemedText>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.themaRouteButton}
          onPress={() => {
            setThemaRouteDropdownVisible(!themaRouteDropdownVisible);
            setDropdownVisible(false);
            setStickerTypeDropdownVisible(false);
          }}
        >
          <ThemedText style={styles.themaRouteButtonText}>{selectedThemaRoute}</ThemedText>
          <Image source={require('../../assets/icons/arrow.png')} style={[styles.dropdownArrow, { transform: [{ rotate: themaRouteDropdownVisible ? '180deg' : '0deg' }] }]} />
        </TouchableOpacity>

        {themaRouteDropdownVisible && (
          <View style={styles.dropdownContainerGreen}>
            {availableThemes
              .filter(theme => !themaRoutes.some(r => r.id === theme.id))
              .map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={styles.dropdownItem}
                  onPress={() => handleThemaRouteSelect(theme.name)}
                >
                  <ThemedText style={styles.dropdownText}>{theme.name}</ThemedText>
                </TouchableOpacity>
              ))}
          </View>
        )}

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
              const stickerData = attributes.Stickers_Hidden?.data || attributes.Stickers_Hidden;
              const stickerUrl = stickerData?.attributes?.url || stickerData?.url || attributes.Stickers_Hidden?.url;
              const fullUrl = stickerUrl || null;

              console.log('Rendering sticker:', attributes.Name, 'URL:', fullUrl);

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
              const stickerData = attributes.Stickers_Hidden?.data || attributes.Stickers_Hidden;
              const stickerUrl = stickerData?.attributes?.url || stickerData?.url || attributes.Stickers_Hidden?.url;
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
  infoButton: {
    position: 'absolute',
    top: verticalScale(68),
    left: scale(20),
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  infoIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  profileSection: {
    backgroundColor: '#292929',
    paddingTop: verticalScale(80),
    paddingBottom: verticalScale(20),
    paddingHorizontal: scale(20),
    marginHorizontal: scale(-20),
    marginTop: verticalScale(-70),
    borderRadius: moderateScale(30),
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: verticalScale(-10),
    marginBottom: verticalScale(40),
    paddingHorizontal: scale(20),
  },
  profilePicWrapper: {
    position: 'relative',
    width: moderateScale(100),
    height: moderateScale(100),
    marginBottom: verticalScale(10),
  },
  profilePicCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    overflow: 'hidden',
    backgroundColor: '#444',
  },
  profilePic: {
    width: moderateScale(100),
    height: moderateScale(100),
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(30),
    height: moderateScale(30),
    resizeMode: 'contain',
  },
  editIconTouchable: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: moderateScale(35),
    height: moderateScale(35),
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconImage: {
    width: moderateScale(30),
    height: moderateScale(30),
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  profileName: {
    fontSize: moderateScale(26),
    color: '#fff',
    fontFamily: 'Impact',
    marginTop: verticalScale(10),
    textAlign: 'center',
    width: '100%',
    lineHeight: moderateScale(30),
  },

  mainTitle: {
    fontSize: moderateScale(32),
    color: '#fff',
  },
  subtitle: {
    fontSize: moderateScale(16),
    marginTop: verticalScale(8),
    color: '#fff',
  },
  title: {
    fontFamily: 'Impact',
    fontSize: moderateScale(24),
    marginTop: verticalScale(50),
    color: '#fff',
  },
  stickersTitle: {
    fontSize: moderateScale(24),
    marginTop: verticalScale(50),
    marginBottom: verticalScale(10),
    color: '#fff',
    fontFamily: 'Impact',
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
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(40),
    marginBottom: verticalScale(20),
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'relative',
    width: scale(100),
  },
  buttonIcon: {
    width: moderateScale(60),
    height: moderateScale(77),
    position: 'absolute',
    top: verticalScale(-25),
    zIndex: 10,
  },
  button: {
    width: '80%',
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
  },
  themaRouteScrollView: {
    marginTop: verticalScale(20),
  },
  themaRouteRow: {
    flexDirection: 'row',
    gap: scale(10),
    paddingRight: scale(20),
  },
  themaRouteContainer: {
    width: scale(165),
    position: 'relative',
  },
  themaRouteIcon: {
    width: scale(165),
    height: verticalScale(110),
    resizeMode: 'contain',
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteIcon: {
    width: moderateScale(28),
    height: moderateScale(28),
    resizeMode: 'contain',
  },
  themaRouteName: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: 'LeagueSpartan',
    textAlign: 'center',
    marginTop: verticalScale(8),
  },
  themaRouteButton: {
    width: '100%',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(30),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7700',
    gap: scale(5),
    marginTop: verticalScale(20),
  },
  themaRouteButtonText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-regular',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dropdownContainerGreen: {
    backgroundColor: '#FF7700',
    borderRadius: moderateScale(14),
    marginTop: verticalScale(5),
    overflow: 'hidden',
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
    textAlign: 'center',
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
    fontFamily: 'LeagueSpartan-regular',
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
  rowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoContainer: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    minWidth: scale(100),
    marginHorizontal: scale(2),
  },
  infoIcons: {
    width: moderateScale(50),
    height: moderateScale(50),
    position: 'absolute',
    top: verticalScale(-25),
    zIndex: 10,
  },
  infoNumberAge: {
    position: 'absolute',
    top: verticalScale(-10),
    alignSelf: 'center',
    zIndex: 11,
    fontSize: moderateScale(22),
    color: '#000',
    fontFamily: 'Impact',
  },
  infoNumberRoutes: {
    position: 'absolute',
    top: verticalScale(-10),
    alignSelf: 'center',
    zIndex: 11,
    fontSize: moderateScale(22),
    color: '#000',
    fontFamily: 'Impact',
  },
  infoNumberStickers: {
    position: 'absolute',
    top: verticalScale(-10),
    alignSelf: 'center',
    zIndex: 11,
    fontSize: moderateScale(22),
    color: '#000000ff',
    fontFamily: 'Impact',
  },
  info: {
    width: '100%',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(8),
    backgroundColor: '#000000ff',
    paddingTop: verticalScale(20),
    height: verticalScale(70),
  },
  infoText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-regular',
    textAlign: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: scale(2),
    lineHeight: moderateScale(16),
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