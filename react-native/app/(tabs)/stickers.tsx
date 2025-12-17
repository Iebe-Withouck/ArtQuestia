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
import { useRouter } from 'expo-router';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ArtworkCardDetail from '@/components/ArtworkCardDetail';
import Notifications from '@/components/Notifications';

import Bell from '../../assets/icons/doorbell.png';
import Cross from '../../assets/icons/cross.png';
import Flag from '../../assets/icons/flag.png';
import Running from '../../assets/icons/running.png';

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const { claimedStickers } = useClaimedStickers();
  const router = useRouter();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [stickerTypeDropdownVisible, setStickerTypeDropdownVisible] = useState(false);
  const [themeQuestDropdownVisible, setThemeQuestDropdownVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("Alle");
  const [selectedStickerType, setSelectedStickerType] = useState("Alle stickers");
  const [selectedThemeQuest, setSelectedThemeQuest] = useState("Oorlog");
  const [artworks, setArtworks] = useState<any[]>([]);
  const [themes, setThemes] = useState<string[]>(['Alle', 'Religie', 'Historie', 'Moderne Kunst', 'ZieMie', 'Oorlog']);
  const [themeData, setThemeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<any>(null);
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
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
    fetchThemesWithBadges();
  }, []);

  const fetchThemesWithBadges = async () => {
    try {
      console.log('🚀 Fetching badges...');
      const response = await fetch(`${STRAPI_URL}/api/badges?populate=*`);
      console.log('📡 Badge response status:', response.status);

      const data = await response.json();
      console.log('📦 Badge response data count:', data.data?.length);

      if (data.data) {
        console.log('✨ Badges fetched:', data.data.length);
        if (data.data.length > 0) {
          console.log('📸 First badge structure:', {
            name: data.data[0].name,
            themeName: data.data[0].theme?.Name,
            hasPhoto: !!data.data[0].PhotoBadge
          });
        }
        setThemeData(data.data);
        console.log('✅ ThemeData updated with', data.data.length, 'badges');
      } else {
        console.log('❌ No data.data in badge response');
      }
    } catch (error) {
      console.error('❌ Error fetching badges:', error);
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

  const getBadgeForTheme = (theme: string, badgeType: 'not_achieved' | 'partial' | 'full') => {
    const prefixMap = {
      'not_achieved': 'Not_Achieved',
      'partial': '1_Achieved',
      'full': 'Full_Achieved'
    };

    const prefix = prefixMap[badgeType];

    const themeMap: { [key: string]: string } = {
      'Moderne Kunst': 'Modern',
      'Oorlog': 'Oorlog',
      'Historie': 'Historie',
      'Religie': 'Religie',
      'ZieMie': 'ZieMie'
    };

    const badgeSuffix = themeMap[theme] || theme;
    const expectedBadgeName = `${prefix}_${badgeSuffix}`;

    console.log(`🔍 Looking for badge: ${expectedBadgeName} (theme: ${theme})`);

    const badge = themeData.find((b: any) => {
      const badgeName = b.name;
      console.log(`  Checking badge: ${badgeName}`);
      return badgeName === expectedBadgeName;
    });

    if (badge) {
      console.log(`✅ Found badge for ${theme}:`, badge.name);
      const photoBadge = badge.PhotoBadge;
      const url = photoBadge?.url;
      console.log(`  Badge image URL:`, url);
      return url;
    }

    console.log(`❌ No badge found with name: ${expectedBadgeName}`);
    return null;
  };

  const calculateThemeBadges = () => {
    const themeBadges: { [theme: string]: { claimed: number; total: number; badge: 'not_achieved' | 'partial' | 'full'; imageUrl: string | null } } = {};

    const realThemes = themes.filter(t => t !== 'Alle');

    realThemes.forEach(theme => {
      const themeArtworks = artworks.filter(artwork => {
        const artworkTheme = artwork.attributes?.Theme || artwork.Theme;
        return artworkTheme === theme;
      });

      const total = themeArtworks.length;
      const claimed = themeArtworks.filter(artwork =>
        claimedStickers.includes(artwork.id)
      ).length;

      let badge: 'not_achieved' | 'partial' | 'full' = 'not_achieved';
      if (claimed === total && total > 0) {
        badge = 'full';
      } else if (claimed > 0) {
        badge = 'partial';
      }

      const imageUrl = getBadgeForTheme(theme, badge);

      themeBadges[theme] = { claimed, total, badge, imageUrl };
    });

    return themeBadges;
  };

  const getThemePercentage = (theme: string): number => {
    if (!artworks || artworks.length === 0) return 0;

    const themeArtworks = artworks.filter(artwork => {
      const artworkTheme = artwork.attributes?.Theme || artwork.Theme;
      return artworkTheme === theme;
    });

    const total = themeArtworks.length;
    if (total === 0) return 0;

    const claimed = themeArtworks.filter(artwork =>
      claimedStickers.includes(artwork.id)
    ).length;

    return Math.round((claimed / total) * 100);
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

  const handleBadgePress = (theme: string, status: any) => {
    setSelectedBadge({ theme, ...status });
    setBadgeModalVisible(true);
  };

  const themeFilteredStickers = selectedTheme === 'Alle'
    ? artworks
    : artworks.filter(artwork => {
      const theme = artwork.attributes?.Theme || artwork.Theme;
      return theme === selectedTheme;
    });
  const currentStickers = (() => {
    if (selectedStickerType === 'Alle stickers') {
      return themeFilteredStickers;
    } else if (selectedStickerType === 'Gevonden stickers') {
      return themeFilteredStickers.filter(artwork => claimedStickers.includes(artwork.id));
    } else if (selectedStickerType === 'Verborgen stickers') {
      return themeFilteredStickers.filter(artwork => !claimedStickers.includes(artwork.id));
    }
    return themeFilteredStickers;
  })();

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (showNotifications) {
    return <Notifications onClose={() => setShowNotifications(false)} />;
  }

  if (showDetailView && selectedSticker) {
    return <ArtworkCardDetail artwork={selectedSticker} onClose={() => setShowDetailView(false)} />;
  }

  console.log('🎨 About to render. ThemeData length:', themeData.length);

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

        <ThemedText style={[styles.instructionText]}>
          Swipe om ze allemaal te zien
        </ThemedText>

        {themeData.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgesContainer}
            contentContainerStyle={styles.badgesContent}
          >
            {Object.entries(calculateThemeBadges()).map(([theme, status]) => (
              <TouchableOpacity
                key={theme}
                style={styles.badgeItem}
                onPress={() => handleBadgePress(theme, status)}
              >
                {status.imageUrl ? (
                  <Image
                    source={{ uri: status.imageUrl }}
                    style={styles.badgeImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.badgePlaceholder}>
                    <ThemedText style={styles.badgePlaceholderText}>?</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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
            <Image source={require('../../assets/icons/arrow2.png')} style={[styles.dropdownArrow, styles.whiteArrow, { transform: [{ rotate: themeQuestDropdownVisible ? '0deg' : '180deg' }] }]} />
          </TouchableOpacity>
          <ThemedText style={[styles.percentage, { marginTop: 0 }]}>
            {getThemePercentage(selectedThemeQuest)}% compleet
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

        <View style={styles.progressBarContainer}>
          <Image
            source={Running}
            style={[
              styles.runningIcon,
              { left: `${getThemePercentage(selectedThemeQuest)}%` }
            ]}
          />
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${getThemePercentage(selectedThemeQuest)}%` }
              ]}
            />
          </View>
          <Image
            source={Flag}
            style={styles.flagIcon}
          />
        </View>


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
            <ThemedText style={[styles.buttonTextStickers, styles.whiteText]}>{selectedStickerType}</ThemedText>
            <Image source={require('../../assets/icons/arrow.png')} style={[styles.dropdownArrowSmall, styles.whiteArrow, { transform: [{ rotate: stickerTypeDropdownVisible ? '180deg' : '0deg' }] }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonStickers2}
            onPress={() => {
              setDropdownVisible(!dropdownVisible);
              setStickerTypeDropdownVisible(false);
            }}
          >
            <ThemedText style={styles.buttonTextStickers}>{selectedTheme === 'Alle' ? "Quests" : selectedTheme}</ThemedText>
            <Image source={require('../../assets/icons/arrow.png')} style={[styles.dropdownArrowSmall, { transform: [{ rotate: dropdownVisible ? '180deg' : '0deg' }] }]} />
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
                <ThemedText style={[styles.dropdownText, styles.whiteText]}>{type}</ThemedText>
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
          {currentStickers.length === 0 ? (() => {
            if (
              selectedStickerType === 'Verborgen stickers' &&
              themeFilteredStickers.length > 0 &&
              themeFilteredStickers.every(artwork => claimedStickers.includes(artwork.id))
            ) {
              return (
                <ThemedText style={{ color: '#c0c0c0ff', padding: 20, fontWeight: 'semibold', fontFamily: 'LeagueSpartan-semibold', backgroundColor: '#64646461', borderRadius: 10, marginBottom: verticalScale(20) }}>
                  Je hebt alle stickers voor dit thema al gevonden!
                </ThemedText>
              );
            } else {
              return (
                <ThemedText style={{ color: '#c0c0c0ff', padding: 20, fontWeight: 'semibold', fontFamily: 'LeagueSpartan-semibold', backgroundColor: '#64646461', borderRadius: 10, marginBottom: verticalScale(20) }}>
                  Je hebt nog geen stickers verzameld voor het thema {selectedTheme}
                </ThemedText>
              );
            }
          })() : (
            currentStickers.map((artwork, index) => {
              const attributes = artwork.attributes || artwork;
              const artworkId = artwork.id;
              const isClaimed = claimedStickers.includes(artworkId);

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

                  {isClaimed && (
                    <TouchableOpacity
                      style={styles.deelButton}
                      onPress={() => {
                        setModalVisible(false);
                      }}
                    >
                      <ThemedText style={styles.deelButtonText}>Deel je ervaring!</ThemedText>
                    </TouchableOpacity>
                  )}
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      <Modal
        visible={badgeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBadgeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBadge && (() => {
              const badgeType = selectedBadge.badge;

              return (
                <>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setBadgeModalVisible(false)}
                  >
                    <Image source={Cross} style={styles.closeButtonIcon} />
                  </TouchableOpacity>

                  {selectedBadge.imageUrl && (
                    <Image
                      source={{ uri: selectedBadge.imageUrl }}
                      style={styles.modalStickerImage}
                    />
                  )}

                  <ThemedText style={styles.modalTitle}>
                    {selectedBadge.theme}
                  </ThemedText>

                  {badgeType === 'full' && (
                    <ThemedText style={styles.modalSubtitle}>
                      Je hebt alle stickers gevonden!
                    </ThemedText>
                  )}

                  {badgeType === 'not_achieved' && (
                    <TouchableOpacity
                      style={[styles.readMoreButton2, { paddingHorizontal: scale(60) }]}
                      onPress={() => {
                        setBadgeModalVisible(false);
                        router.push('/(tabs)/map');
                      }}
                    >
                      <ThemedText style={styles.readMoreButtonText}>Start deze quest</ThemedText>
                    </TouchableOpacity>
                  )}

                  {badgeType === 'partial' && (
                    <TouchableOpacity
                      style={[styles.readMoreButton2, { paddingHorizontal: scale(50) }]}
                      onPress={() => {
                        setBadgeModalVisible(false);
                        router.push('/(tabs)/map');
                      }}
                    >
                      <ThemedText style={styles.readMoreButtonText}>Op naar de volgende</ThemedText>
                    </TouchableOpacity>
                  )}
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
  instructionText: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(30),
    color: '#979797da',
  },
  title: {
    fontSize: moderateScale(24),
    marginTop: verticalScale(50),
    lineHeight: moderateScale(28),
    color: '#fff',
    fontFamily: 'Impact',
  },
  stickersTitle: {
    fontSize: moderateScale(24),
    marginTop: verticalScale(50),
    marginBottom: verticalScale(10),
    lineHeight: moderateScale(28),
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
    width: moderateScale(16),
    height: moderateScale(16),
    tintColor: 'rgba(0, 0, 0, 0.6)',
  },
  dropdownArrowSmall: {
    width: moderateScale(10),
    height: moderateScale(10),
    tintColor: 'rgba(0, 0, 0, 0.6)',
  },
  whiteText: {
    color: '#fff',
  },
  whiteArrow: {
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
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: moderateScale(15),
    fontFamily: 'LeagueSpartan-regular',
  },
  buttonTextStickers: {
    color: 'rgba(0, 0, 0, 0.6)',
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
    width: '31%',
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
    lineHeight: moderateScale(20),
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

  modalSubtitle: {
    fontSize: moderateScale(16),
    color: '#ccc',
    fontFamily: 'LeagueSpartan-regular',
    textAlign: 'center',
    marginBottom: verticalScale(25),
    marginTop: verticalScale(20),
  },

  readMoreButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(95),
    borderRadius: moderateScale(25),
    marginBottom: verticalScale(10),
  },

  readMoreButton2: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(95),
    borderRadius: moderateScale(25),
    marginBottom: verticalScale(10),
    marginTop: verticalScale(20),
  },

  readMoreButtonText: {
    color: 'rgba(0, 0, 0, 0.6)',
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
  badgesContainer: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
  },
  badgesContent: {
    paddingHorizontal: scale(5),
    gap: scale(20),
  },
  badgeItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePlaceholder: {
    width: scale(90),
    height: scale(90),
    borderRadius: moderateScale(45),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555',
  },
  badgePlaceholderText: {
    fontSize: moderateScale(40),
    color: '#888',
  },
  badgeImage: {
    width: scale(90),
    height: scale(90),
    borderRadius: moderateScale(45),
  },
  progressBarContainer: {
    marginTop: verticalScale(35),
    marginBottom: verticalScale(20),
    position: 'relative',
  },
  progressBarBackground: {
    width: '100%',
    height: verticalScale(12),
    backgroundColor: '#fff',
    borderRadius: moderateScale(6),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1AF7A2',
    borderRadius: moderateScale(6),
  },
  runningIcon: {
    position: 'absolute',
    width: moderateScale(30),
    height: moderateScale(30),
    top: verticalScale(-35),
    marginLeft: -moderateScale(15),
    resizeMode: 'contain',
  },
  flagIcon: {
    position: 'absolute',
    width: moderateScale(25),
    height: moderateScale(25),
    top: verticalScale(-32),
    right: -moderateScale(12),
    resizeMode: 'contain',
  },
});