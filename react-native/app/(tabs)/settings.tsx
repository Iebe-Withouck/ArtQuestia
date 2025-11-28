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

const STRAPI_URL = 'http://172.30.40.49:1337';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import Bell from '../../assets/icons/doorbell.png';
import Icon1 from '../../assets/icons/route.png';
import Icon3 from '../../assets/icons/share.png';
import Icon2 from '../../assets/icons/stickers.png';
import Oorlog from '../../assets/profile-info/oorlogsmonumenten.png';
import Religie from '../../assets/profile-info/religie.png';
import Cross from '../../assets/icons/cross.png';
import Info from '../../assets/icons/info.png';
import Age from '../../assets/profile-info/Group 100.png';
import RoutesComplete from '../../assets/profile-info/Group 99.png'
import FoundedStickers from "../../assets/profile-info/Group 98.png"
import ProfilePic from '../../assets/profile-info/Group 97.png'

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

  const stickerTypes = ['Alle stickers', 'Gevonden stickers', 'Verborgen stickers'];

  useEffect(() => {
    console.log('Component mounted, fetching artworks...');
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

  return (
    <ThemedView style={styles.titleContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={styles.bellButton}>
        <Image source={Bell} style={styles.bellIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoButton}>
        <Image source={Info} style={styles.infoIcon} />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <Image source={ProfilePic} style={styles.profilePic} />
        <ThemedText style={styles.profileName}>Jane Doe</ThemedText>
      </View>

        <View style={styles.rowInfo}>
        <TouchableOpacity style={styles.infoContainer}>
          <Image source={Age} style={styles.infoIcons} />
          <View style={styles.info}>
            <ThemedText style={styles.infoText}>Leeftijd</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoContainer}>
          <Image source={RoutesComplete} style={styles.infoIcons} />
          <View style={styles.info}>
            <ThemedText style={styles.infoText}>Complete routes</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoContainer}>
          <Image source={FoundedStickers} style={styles.infoIcons} />
          <View style={styles.info}>
            <ThemedText style={styles.infoText}>Gevonden stickers</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.themaRoute}>
        <ThemedText type="title" style={[styles.title, { fontFamily: 'LeagueSpartan' }]}>
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

      <ThemedText type="title" style={[styles.title, { fontFamily: 'LeagueSpartan' }]}>
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
                    }}
                  >
                    <ThemedText style={styles.readMoreButtonText}>Lees meer</ThemedText>
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
    top: verticalScale(60),
    right: scale(25),
    width: moderateScale(45),
    height: moderateScale(45),
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
    top: verticalScale(60),
    left: scale(25),
    width: moderateScale(45),
    height: moderateScale(45),
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
  profileContainer: {
    alignItems: 'center',
    marginTop: verticalScale(-10),
    marginBottom: verticalScale(20),
  },
  profilePic: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    resizeMode: 'contain',
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
    fontSize: moderateScale(20),
    marginTop: verticalScale(50),
    color: '#fff',
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
    fontFamily: 'Impact',
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
    fontFamily: 'Impact',
  },
  rowStickers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    columnGap: scale(10),
    rowGap: verticalScale(120),
    marginTop: verticalScale(70),
    width: '100%',
  },
  stickerContainer: {
    alignItems: 'center',
    position: 'relative',
    width: '31%', // 3 columns: 31% each
    aspectRatio: 1,
  },
  stickerIcon: {
    width: moderateScale(93),
    height: moderateScale(90),
    position: 'absolute',
    top: verticalScale(-30),
    zIndex: 10,
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
    paddingHorizontal: scale(100),
    borderRadius: moderateScale(25),
  },
  readMoreButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Impact',
  },
  rowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(40),
    paddingHorizontal: scale(5),
  },
  infoContainer: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    maxWidth: scale(115),
    marginHorizontal: scale(4),
  },
  infoIcons: {
    width: moderateScale(50),
    height: moderateScale(50),
    position: 'absolute',
    top: verticalScale(-25),
    zIndex: 10,
  },
  info: {
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
  infoText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan',
    textAlign: 'center',
  },
});