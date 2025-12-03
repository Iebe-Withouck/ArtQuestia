import { useFocusEffect } from '@react-navigation/native';
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
  ViroARSceneNavigator,
  ViroDirectionalLight,
  ViroNode,
  ViroSpotLight,
  ViroText,
} from '@reactvision/react-viro';
import * as Location from 'expo-location';
import { useFonts } from 'expo-font';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';

const STRAPI_URL = 'http://192.168.0.155:1337';
const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Calculate bearing between two GPS coordinates
const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const toDeg = (rad: number) => rad * (180 / Math.PI);

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

// Calculate distance between two GPS coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Convert GPS coordinates to AR position relative to user
const gpsToARPosition = (
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number
): [number, number, number] => {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  const bearing = calculateBearing(userLat, userLon, targetLat, targetLon);

  // Convert bearing to radians
  const bearingRad = (bearing * Math.PI) / 180;

  // Scale down the distance for AR (1 meter real = 0.01 AR units for better visibility)
  const scaleFactor = 0.01;
  const scaledDistance = distance * scaleFactor;

  // Calculate x, z positions with scaled distance
  const x = scaledDistance * Math.sin(bearingRad);
  const z = -scaledDistance * Math.cos(bearingRad);

  // Set y to -0.5 to place object at chest/eye level
  const y = -0.5;

  return [x, y, z];
};

// AR Scene showing a 3D model at specific GPS coordinates
interface ARModelSceneProps {
  userLocation: Location.LocationObject | null;
  targetLatitude: number;
  targetLongitude: number;
}

function ARModelScene({ userLocation, targetLatitude, targetLongitude }: ARModelSceneProps) {
  // Calculate AR position based on GPS coordinates
  const arPosition: [number, number, number] = userLocation
    ? gpsToARPosition(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      targetLatitude,
      targetLongitude
    )
    : [0, -0.4, -2]; // Default position if no GPS

  const distance = userLocation
    ? calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      targetLatitude,
      targetLongitude
    )
    : 0;

  return (
    <ViroARScene>
      {/* Ambient light for overall scene illumination */}
      <ViroAmbientLight color="#ffffff" intensity={30000} />

      {/* Directional light from above-front to simulate sunlight */}
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.5]}
        intensity={500}
      />

      {/* Additional directional light from the side for depth */}
      <ViroDirectionalLight
        color="#ffffff"
        direction={[1, -0.5, 0]}
        intensity={300}
      />

      {/* Node to group and anchor all objects at GPS coordinates */}
      <ViroNode
        position={arPosition}
        dragType="FixedToWorld"
      >
        {/* Distance indicator text */}
        <ViroText
          text={`${Math.round(distance)}m away`}
          scale={[0.2, 0.2, 0.2]}
          position={[0, 0.5, 0]}
          style={styles.helloText}
        />

        {/* 3D Model with baked animation from Blender */}
        <Viro3DObject
          source={require('../../assets/3D-Models/bomb.glb')}
          resources={[]}
          position={[0, 0, 0]}
          scale={[0.1, 0.1, 0.1]}
          type="GLB"
          animation={{
            name: 'BombAction',
            run: true,
            loop: true,
          }}
          lightReceivingBitMask={1}
          shadowCastingBitMask={1}
          onLoadStart={() => console.log('Bomb loading...')}
          onLoadEnd={() => console.log('Bomb loaded at GPS coordinates')}
          onError={(event) => {
            console.error('Error loading bomb (message):', event.nativeEvent?.error);
            console.error(
              'Full error object:',
              JSON.stringify(event.nativeEvent, null, 2),
            );
          }}
        />
      </ViroNode>
    </ViroARScene>
  );
}

export default function Scan() {
  const [sceneKey, setSceneKey] = useState(0);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [menuHeight] = useState(new Animated.Value(verticalScale(120)));
  const [artworkData, setArtworkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const rotateValue = useState(new Animated.Value(0))[0];

  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  // Rotate animation for loader
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Target GPS coordinates
  const TARGET_LATITUDE = 50.818549;
  const TARGET_LONGITUDE = 3.436160;

  // Fetch artwork data from Strapi
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(`${STRAPI_URL}/api/artworks?populate=*`);
        const data = await response.json();

        console.log('Fetched artworks:', data.data?.length || 0);

        if (data.data && data.data.length > 0) {
          // Log all artwork names to help debug
          console.log('Available artworks:', data.data.map((a: any) => a.Name));

          // Find the specific artwork "Monument voor de gesneuvelden van Wereldoorlog II"
          const targetArtwork = data.data.find(
            (artwork: any) => artwork.Name === 'Monument voor de gesneuvelden van Wereldoorlog II'
          );

          if (targetArtwork) {
            console.log('Found target artwork:', targetArtwork.Name);
            console.log('Artwork data:', targetArtwork);
            setArtworkData(targetArtwork);
          } else {
            console.log('Artwork "Monument voor de gesneuvelden van Wereldoorlog II" not found');
            console.log('Using first artwork as fallback');
            setArtworkData(data.data[0]);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching artwork:', error);
        setLoading(false);
      }
    };

    fetchArtwork();
  }, []);

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        console.log('Location permission denied');
        return;
      }

      setHasPermission(true);

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(location);
      console.log('User location:', location.coords);

      // Watch for location updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setUserLocation(newLocation);
        }
      );
    })();
  }, []);

  // Toggle menu expansion
  const toggleMenu = () => {
    const toValue = isMenuExpanded ? verticalScale(120) : verticalScale(380);

    Animated.spring(menuHeight, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();

    setIsMenuExpanded(!isMenuExpanded);
  };

  // Remount AR scene when tab is focused
  useFocusEffect(
    useCallback(() => {
      setSceneKey(prev => prev + 1);
      return () => { };
    }, [])
  );

  // Show loading while getting location
  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingTitle, { fontFamily: fontsLoaded ? 'Impact' : undefined }]}>
          Bijna klaar
        </Text>
        <Text style={[styles.loadingSubtitle, { fontFamily: fontsLoaded ? 'LeagueSpartan' : undefined }]}>
          We hebben even tijd nodig om de experience awesome te maken!
        </Text>
        <Animated.Image
          source={require('../../assets/images/loader.png')}
          style={[styles.loaderImage, { transform: [{ rotate: spin }] }]}
        />
      </View>
    );
  }

  // Show error if permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Location permission denied</Text>
        <Text style={styles.errorSubtext}>Please enable location services to use AR</Text>
      </View>
    );
  }

  // Show loading while getting GPS lock
  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingTitle, { fontFamily: fontsLoaded ? 'Impact' : undefined }]}>
          Bijna klaar
        </Text>
        <Text style={[styles.loadingSubtitle, { fontFamily: fontsLoaded ? 'LeagueSpartan' : undefined }]}>
          We hebben even tijd nodig om de experience awesome te maken!
        </Text>
        <Animated.Image
          source={require('../../assets/images/loader.png')}
          style={[styles.loaderImage, { transform: [{ rotate: spin }] }]}
        />
      </View>
    );
  }

  // Wrapper function to pass props to ARModelScene
  const ARSceneWrapper = () => (
    <ARModelScene
      userLocation={userLocation}
      targetLatitude={TARGET_LATITUDE}
      targetLongitude={TARGET_LONGITUDE}
    />
  );

  // Get artwork details directly (no attributes wrapper in new Strapi format)
  const artwork = artworkData || {};

  // Get Stickers URL
  const stickersUrl = artwork.Stickers?.url;
  const fullStickersUrl = stickersUrl ? `${STRAPI_URL}${stickersUrl}` : null;

  // Add # to color code if it doesn't already have it
  const backgroundColor = artwork.Color
    ? (artwork.Color.startsWith('#') ? artwork.Color : `#${artwork.Color}`)
    : '#FF5AE5';

  // Calculate distance
  const calculatedDistance = userLocation && artwork.Location?.lat && artwork.Location?.lng
    ? (calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      artwork.Location.lat,
      artwork.Location.lng
    ) / 1000).toFixed(1)
    : 'N/A';

  return (
    <View style={{ flex: 1 }}>
      <ViroARSceneNavigator
        key={sceneKey}
        autofocus={true}
        initialScene={{ scene: ARSceneWrapper }}
        worldAlignment="GravityAndHeading"
        style={{ flex: 1 }}
      />

      {/* Collapsible Bottom Menu */}
      {artworkData && fontsLoaded && (
        <Animated.View style={[styles.bottomMenu, { height: menuHeight, backgroundColor: '#000' }]}>
          {/* Toggle Button */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleMenu}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/icons/next.png')}
              style={[
                styles.toggleIcon,
                { transform: [{ rotate: isMenuExpanded ? '90deg' : '-90deg' }] }
              ]}
            />
          </TouchableOpacity>

          {/* Collapsed View Content */}
          <View style={styles.collapsedContent}>
            {/* Sticker Image */}
            {fullStickersUrl && (
              <Image
                source={{ uri: fullStickersUrl }}
                style={styles.stickerImage}
              />
            )}

            {/* Text Content */}
            <View style={styles.textContent}>
              <Text style={[styles.artworkName, { fontFamily: 'Impact' }]}>
                {artwork.Name || 'Untitled'}
              </Text>
              <Text style={[styles.creatorName, { fontFamily: 'LeagueSpartan' }]}>
                {artwork.Creator || 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Expanded View Content */}
          {isMenuExpanded && (
            <ScrollView
              style={styles.expandedContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Info Buttons Row */}
              <View style={styles.infoButtonsRow}>
                <TouchableOpacity style={styles.buttonContainer}>
                  <Text style={[styles.buttonIcon, { fontFamily: 'Impact' }]}>Jaar</Text>
                  <View style={styles.button}>
                    <Text style={[styles.buttonText, { fontFamily: 'LeagueSpartan' }]}>
                      {artwork.Year || 'N/A'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonContainer}>
                  <Text style={[styles.buttonIcon, { fontFamily: 'Impact' }]}>Locatie</Text>
                  <View style={styles.button}>
                    <Text style={[styles.buttonText, { fontFamily: 'LeagueSpartan' }]}>
                      {calculatedDistance} km
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonContainer}>
                  <Text style={[styles.buttonIcon, { fontFamily: 'Impact' }]}>Thema</Text>
                  <View style={styles.button}>
                    <Text style={[styles.buttonText, { fontFamily: 'LeagueSpartan' }]}>
                      {artwork.Theme || 'N/A'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Description */}
              {artwork.Description && (
                <View style={styles.descriptionContainer}>
                  <Text style={[styles.description, { fontFamily: 'LeagueSpartan' }]}>
                    {artwork.Description}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  helloText: {
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loaderImage: {
    width: moderateScale(150),
    height: moderateScale(150),
    resizeMode: 'contain',
    marginTop: verticalScale(30),
  },
  loadingTitle: {
    fontSize: moderateScale(32),
    color: '#ffffff',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: moderateScale(16),
    color: '#ffffff',
    marginBottom: verticalScale(30),
    textAlign: 'center',
    paddingHorizontal: scale(40),
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 20,
  },
  errorText: {
    fontSize: 20,
    color: '#ff0000',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Bottom Menu Styles
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toggleButton: {
    position: 'absolute',
    top: verticalScale(-25),
    left: '55%',
    transform: [{ translateX: -moderateScale(25) }],
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#FF7700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  toggleIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: verticalScale(10),
  },
  stickerImage: {
    width: moderateScale(70),
    height: moderateScale(70),
    resizeMode: 'contain',
    marginRight: scale(15),
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  artworkName: {
    fontSize: moderateScale(22),
    color: '#fff',
    marginBottom: verticalScale(5),
  },
  creatorName: {
    fontSize: moderateScale(16),
    color: '#fff',
    opacity: 0.9,
  },
  expandedContent: {
    marginTop: verticalScale(20),
  },
  infoButtonsRow: {
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
    textAlign: 'center',
  },
  descriptionContainer: {
    marginBottom: verticalScale(30),
    marginTop: verticalScale(10),
  },
  description: {
    fontSize: moderateScale(15),
    color: '#fff',
    lineHeight: moderateScale(22),
  },
});