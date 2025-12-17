import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useFonts } from 'expo-font';
import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import ARScene1 from '../../components/ar/ARScene1';
import ARScene2 from '../../components/ar/ARScene2';
import ARScene3 from '../../components/ar/ARScene3';
import ARScene4 from '../../components/ar/ARScene4';
import { useArtwork } from '@/contexts/ArtworkContext';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function Scan() {
  const { selectedArtwork } = useArtwork();
  const router = useRouter();
  const [sceneKey, setSceneKey] = useState(0);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const rotateValue = useState(new Animated.Value(0))[0];

  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

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

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        console.log('Locatietoestemming geweigerd');
        return;
      }

      setHasPermission(true);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(location);
      console.log('User location:', location.coords);

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

  useFocusEffect(
    useCallback(() => {
      setSceneKey(prev => prev + 1);
      return () => { };
    }, [])
  );

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

  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Locatietoestemming geweigerd</Text>
        <Text style={styles.errorSubtext}>Schakel locatievoorzieningen in om AR te gebruiken</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingTitle, { fontFamily: fontsLoaded ? 'Impact' : undefined }]}>
          Bijna klaar
        </Text>
        <Text style={[styles.loadingSubtitle, { fontFamily: fontsLoaded ? 'LeagueSpartan-regular' : undefined }]}>
          We hebben even tijd nodig om de experience awesome te maken!
        </Text>
        <Animated.Image
          source={require('../../assets/images/loader.png')}
          style={[styles.loaderImage, { transform: [{ rotate: spin }] }]}
        />
      </View>
    );
  }

  if (!selectedArtwork || !selectedArtwork.arSceneNumber) {
    return (
      <View style={styles.noArtworkContainer}>
        <Text style={[styles.noArtworkTitle, { fontFamily: fontsLoaded ? 'Impact' : undefined }]}>
          Ga naar een kunstwerk om een AR experience te starten
        </Text>
        <Image
          source={require('../../assets/images/fallbackimage.png')}
          style={{ width: 250, height: 412, marginVertical: 40 }}
        />
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push('/map')}
        >
          <Text style={[styles.mapButtonText, { fontFamily: fontsLoaded ? 'LeagueSpartan-semibold' : undefined }]}>
            Ga naar map
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderARScene = () => {
    const sceneNumber = selectedArtwork?.arSceneNumber || 1;
    const commonProps = {
      userLocation,
      sceneKey,
    };

    switch (sceneNumber) {
      case 1:
        return <ARScene1 {...commonProps} />;
      case 2:
        return <ARScene2 {...commonProps} />;
      case 3:
        return <ARScene3 {...commonProps} />;
      case 4:
        return <ARScene4 {...commonProps} />;
      default:
        return <ARScene1 {...commonProps} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderARScene()}
    </View>
  );
}

const styles = StyleSheet.create({
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
  noArtworkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: scale(40),
  },
  noArtworkTitle: {
    fontSize: moderateScale(24),
    color: '#ffffff',
    marginBottom: verticalScale(30),
    textAlign: 'center',
  },
  mapButton: {
    backgroundColor: '#FF7700',
    paddingHorizontal: scale(40),
    paddingVertical: verticalScale(15),
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapButtonText: {
    fontSize: moderateScale(18),
    color: '#rgba(0, 0, 0, 0.6)',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});