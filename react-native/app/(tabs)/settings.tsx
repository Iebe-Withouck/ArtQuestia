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

const STRAPI_URL = 'http://192.168.0.212:1337';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ArtworkCardDetail from '@/components/ArtworkCardDetail';
import SettingsEdit from '@/components/SettingsEdit';

import Bell from '../../assets/icons/doorbell.png';
import Oorlog from '../../assets/profile-info/oorlogsmonumenten.png';
import Religie from '../../assets/profile-info/religie.png';
import Cross from '../../assets/icons/cross.png';
import Info from '../../assets/icons/info.png';
import Age from '../../assets/profile-info/age.png';
import RoutesComplete from '../../assets/profile-info/routesComplete.png'
import FoundedStickers from "../../assets/profile-info/foundedStickers.png"
import ProfilePic from '../../assets/profile-info/Group 97.png'
import Potlood from '../../assets/profile-info/potlood.png'

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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userName, setUserName] = useState('Jane Doe');
  const [userAge, setUserAge] = useState('22');

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
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

  const handleThemaRouteSelect = (route: string) => {
    setSelectedThemaRoute(route);
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
        onSave={(name: string, age: string) => {
          setUserName(name);
          setUserAge(age);
          setShowEditView(false);
        }}
      />
    );
  }

  return (
    <ThemedView style={styles.titleContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.bellButton}>
          <Image source={Bell} style={styles.bellIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Image source={Info} style={styles.infoIcon} />
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <TouchableOpacity 
            onPress={() => {
              console.log('Edit icon pressed!');
              setShowEditView(true);
            }}
            activeOpacity={0.9}
            style={styles.profilePicWrapper}
          >
            <Image source={ProfilePic} style={styles.profilePic} />
            <Image source={Potlood} style={styles.editIconImage} />
          </TouchableOpacity>
          <ThemedText style={styles.profileName}>{userName}</ThemedText>
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
              <ThemedText style={styles.infoText}>Complete routes</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoContainer}>
            <Image source={FoundedStickers} style={styles.infoIcons} />
            <ThemedText style={styles.infoNumberStickers}>12</ThemedText>
            <View style={styles.info}>
              <ThemedText style={styles.infoText}>Gevonden stickers</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.themaRoute}>
        <ThemedText style={[styles.title]}>
          Thema routes
        </ThemedText>
      </View>
      <View style={styles.themaRouteRow}>
        <Image source={Oorlog} style={styles.themaRouteIcon} />
        <Image source={Religie} style={styles.themaRouteIcon} />
      </View>

      <TouchableOpacity 
        style={styles.themaRouteButton}
        onPress={() => {
          setThemaRouteDropdownVisible(!themaRouteDropdownVisible);
          setDropdownVisible(false);
          setStickerTypeDropdownVisible(false);
        }}
      >
        <ThemedText style={styles.themaRouteButtonText}>{selectedThemaRoute}</ThemedText>
        <ThemedText style={styles.dropdownArrow}>▼</ThemedText>
      </TouchableOpacity>

      {themaRouteDropdownVisible && (
        <View style={styles.dropdownContainerGreen}>
          {themes.filter(theme => theme !== 'Alle').map((route, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => handleThemaRouteSelect(route)}
            >
              <ThemedText style={styles.dropdownText}>{route}</ThemedText>
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
          <ThemedText style={styles.dropdownArrow}>▼</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.buttonStickers2}
          onPress={() => {
            setDropdownVisible(!dropdownVisible);
            setStickerTypeDropdownVisible(false);
          }}
        >
          <ThemedText style={styles.buttonTextStickers}>{selectedTheme === 'Alle' ? "Thema's" : selectedTheme}</ThemedText>
          <ThemedText style={styles.dropdownArrow}>▼</ThemedText>
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
            <ThemedText style={styles.dropdownText}>Alle Thema's</ThemedText>
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
            const stickerData = attributes.Stickers_Hidden?.data;
            const stickerUrl = stickerData?.attributes?.url || stickerData?.url || attributes.Stickers_Hidden?.url;
            const fullUrl = stickerUrl ? `${STRAPI_URL}${stickerUrl}` : null;
            
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
              const stickerData = attributes.Stickers_Hidden?.data;
              const stickerUrl = stickerData?.attributes?.url || stickerData?.url || attributes.Stickers_Hidden?.url;
              const fullUrl = stickerUrl ? `${STRAPI_URL}${stickerUrl}` : null;
              
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
    paddingBottom: verticalScale(40),
    paddingHorizontal: scale(20),
    marginHorizontal: scale(-20),
    marginTop: verticalScale(-70),
    marginBottom: verticalScale(30),
    borderRadius: moderateScale(30),
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: verticalScale(-10),
    marginBottom: verticalScale(20),
  },
  profilePicWrapper: {
    position: 'relative',
    width: moderateScale(100),
    height: moderateScale(100),
  },
  profilePic: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    resizeMode: 'contain',
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
    bottom: 0,
    right: 0,
    width: moderateScale(30),
    height: moderateScale(30),
    zIndex: 10,
  },
  editIconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(30),
    height: moderateScale(30),
  },
  profileName: {
    fontSize: moderateScale(30),
    color: '#fff',
    fontFamily: 'Impact',
    marginTop: verticalScale(20),
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
    fontFamily: 'LeagueSpartan',
    textAlign: 'center',
  },
  themaRoute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themaRouteRow: {
    flexDirection: 'row',
    gap: scale(5),
    width: '100%',
  },
  themaRouteIcon: {
    flex: 1,
    height: verticalScale(110),
    resizeMode: 'contain',
    marginTop: verticalScale(20),
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
    fontFamily: 'LeagueSpartan',
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
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Impact',
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
    fontFamily: 'LeagueSpartan',
  },
  buttonTextStickers: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan',
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
    fontFamily: 'Impact',
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
    fontFamily: 'LeagueSpartan',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(40),
    paddingHorizontal: scale(0),
  },
  infoContainer: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    maxWidth: scale(100),
    marginHorizontal: scale(0),
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
    top: verticalScale(-12),
    left: '50%',
    transform: [{ translateX: -moderateScale(12) }],
    zIndex: 11,
    fontSize: moderateScale(24),
    color: '#fff',
    fontFamily: 'Impact',
  },
  infoNumberRoutes: {
    position: 'absolute',
    top: verticalScale(-11),
    left: '50%',
    transform: [{ translateX: -moderateScale(6) }],
    zIndex: 11,
    fontSize: moderateScale(24),
    color: '#fff',
    fontFamily: 'Impact',
  },
  infoNumberStickers: {
    position: 'absolute',
    top: verticalScale(-12),
    left: '50%',
    transform: [{ translateX: -moderateScale(11) }],
    zIndex: 11,
    fontSize: moderateScale(24),
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
    minHeight: verticalScale(70),
  },
  infoText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan',
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
    fontFamily: 'LeagueSpartan',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});