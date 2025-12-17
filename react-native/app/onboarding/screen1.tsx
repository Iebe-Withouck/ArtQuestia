import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import Phone from '../../assets/images/phone1.png';

export default function Screen1() {
  const [fontsLoaded] = useFonts({
    'LeagueSpartan': require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const handleNext = () => {
    router.push("/onboarding/screen2");
  };

  const handleSkip = () => {
    router.replace("/login");
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '25%' }]} />
      </View>

      <Image source={Phone} style={styles.phoneImage} />

      <Text style={styles.title}>Ontdek kortrijk, beleef de quest & scoor coupons!</Text>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Hup, naar de volgende!</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Skip onboarding</Text>
      </TouchableOpacity>
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
    width: scale(400),
    height: verticalScale(400),
    resizeMode: 'contain',
    marginBottom: verticalScale(30),
    marginTop: verticalScale(50),
  },
  title: {
    fontSize: 28,
    fontFamily: 'Impact',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: 250,
  },
  nextButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(50),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(30),
    alignSelf: 'center',
  },
  nextButtonText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: moderateScale(16),
    fontFamily: 'LeagueSpartan-semibold',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(50),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(15),
    marginBottom: verticalScale(40),
    alignSelf: 'center',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: moderateScale(20),
    fontFamily: 'LeagueSpartan-regular',
    textAlign: 'center',
  },
});