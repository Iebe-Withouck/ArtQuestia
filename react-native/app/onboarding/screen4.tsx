import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { router } from "expo-router";

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import Phone from '../../assets/images/phone4.png';

export default function Screen4() {
  const handleNext = () => {
    router.push("/onboarding/screen5");
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '100%' }]} />
      </View>

      <Image source={Phone} style={styles.phoneImage} />

      <Text style={styles.title}>Spaar de digitale stickers en win een beloning!</Text>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Start jouw avontuur</Text>
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
    marginTop: verticalScale(10),
  },
  title: {
    fontSize: 28,
    fontFamily: 'Impact',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: 220,
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
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Impact',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});