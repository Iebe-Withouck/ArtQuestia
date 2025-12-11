import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
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
    // Navigate to the scan tab
    router.push('/(tabs)/scan');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Instruction text */}
        <Text style={[styles.instructionText, { fontFamily: fontsLoaded ? 'Impact' : undefined }]}>
          Ga op de pijl voor het kunstwerk staan om te beginnen
        </Text>

        {/* Ready button */}
        <TouchableOpacity
          style={styles.readyButton}
          onPress={handleReady}
          activeOpacity={0.8}
        >
          <Text style={[styles.readyButtonText, { fontFamily: fontsLoaded ? 'LeagueSpartan-semi-bold' : undefined }]}>
            Ik sta klaar!
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
  instructionText: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(60),
    lineHeight: moderateScale(40),
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
    color: '#000000',
    textAlign: 'center',
  },
});
