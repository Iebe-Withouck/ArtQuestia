import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function ARPreparation() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Impact: require('../assets/fonts/impact.ttf'),
    'LeagueSpartan-regular': require('../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
    'LeagueSpartan-semi-bold': require('../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const handleReady = () => {
    // Navigate to the scan tab - selectedArtwork is already in context
    router.push('/(tabs)/scan');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { fontFamily: fontsLoaded ? 'Impact' : undefined }]}>
          Main character mode
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { fontFamily: fontsLoaded ? 'LeagueSpartan-semibold' : undefined }]}>
          Ga op het kruis staan & beleef{'\n'}de AR experience!
        </Text>

        {/* Arrow image */}
        <Image
          source={require('../assets/images/ar-preperation.png')}
          style={styles.arrowImage}
          resizeMode="contain"
        />

        {/* Ready button */}
        <TouchableOpacity
          style={styles.readyButton}
          onPress={handleReady}
          activeOpacity={0.8}
        >
          <Text style={[styles.readyButtonText, { fontFamily: fontsLoaded ? 'LeagueSpartan-semibold' : undefined }]}>
            Ik sta klaar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(30),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: moderateScale(48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  subtitle: {
    fontSize: moderateScale(18),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(60),
    lineHeight: moderateScale(24),
  },
  arrowImage: {
    width: scale(250),
    height: verticalScale(300),
    marginBottom: verticalScale(60),
  },
  readyButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(50),
    borderRadius: 999,
    width: '100%',
    maxWidth: scale(300),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  readyButtonText: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
  },
});
