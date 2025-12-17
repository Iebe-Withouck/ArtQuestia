import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { router } from "expo-router";
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import Phone from '../../assets/images/phone5.png';

export default function LocatiePermission() {
  const handleFinish = () => {
    router.replace("/(tabs)");
  };

  const handleSkip = () => {
    console.log('User skipped location permission');
    router.push("/onboarding/cameraPermission");
  };

  const handleNext = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }

    router.push("/onboarding/cameraPermission");
  };

  return (
    <View style={styles.container}>

      <Image source={Phone} style={styles.phoneImage} />

      <View style={styles.popupOverlay}>
        <View style={styles.popupCard}>
          <Text style={styles.popupTitle}>Locatie aanzetten?</Text>
          <Text style={styles.popupText}>Zet je locatie aan en krijg een heads up als er toffe kunstspots vlak bij jou opduiken, zodat je sneller nieuwe stickers scoort en vlotter rewards vrijspeelt. </Text>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Ja, ik zet het aan!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Verdergaan zonder locatie</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  progressBarContainer: {
    position: 'absolute',
    top: verticalScale(60),
    left: scale(20),
    right: scale(20),
    height: verticalScale(8),
    backgroundColor: '#ffffffff',
    borderRadius: moderateScale(30),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1AF7A2',
    borderRadius: moderateScale(30),
  },
  phoneImage: {
    width: scale(250),
    height: verticalScale(250),
    resizeMode: 'contain',
    marginBottom: verticalScale(30),
    marginTop: verticalScale(-280),
  },
  title: {
    fontSize: 28,
    fontFamily: 'Impact',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: 250,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  popupCard: {
    backgroundColor: '#292929',
    borderRadius: moderateScale(20),
    padding: scale(30),
    width: '100%',
    maxWidth: scale(350),
    borderWidth: 2,
  },
  popupTitle: {
    fontSize: moderateScale(24),
    fontFamily: 'Impact',
    color: '#fff',
    marginBottom: verticalScale(15),
  },
  popupText: {
    fontSize: moderateScale(16),
    fontFamily: 'LeagueSpartan-regular',
    color: '#fff',
    marginBottom: verticalScale(30),
    lineHeight: moderateScale(22),
  },
  nextButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(60),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(10),
    alignSelf: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Impact',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: '#215AFF',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(15),
    marginBottom: verticalScale(10),
    alignSelf: 'center',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Impact',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});