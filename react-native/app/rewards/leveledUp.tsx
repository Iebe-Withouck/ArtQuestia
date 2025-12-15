import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { router } from "expo-router";

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function LeveledUp() {
  const handleLeveledUp = () => {
    router.push("/(tabs)/stickers");
  };

  const handleShare = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      {/* Header Text */}
      <Text style={styles.headerText}>Goede vooruitgang</Text>
      <Text style={styles.subHeaderText}>Ga zo voort!</Text>

      {/* Badge Image */}
      <View style={styles.badgeContainer}>
        <Image
          source={require('../../assets/images/badge2.png')}
          style={styles.badgeImage}
          resizeMode="contain"
        />
      </View>

      {/* Quest Title */}
      <Text style={styles.questTitle}>Modern quest</Text>
      <Text style={styles.questProgress}>35% compleet</Text>

      {/* Progress Image */}
      <Image
        source={require('../../assets/icons/themaRouteIcon2.png')}
        style={styles.progressImage}
        resizeMode="contain"
      />

      {/* Buttons */}
      <TouchableOpacity style={styles.levelUpButton} onPress={handleLeveledUp}>
        <Text style={styles.levelUpButtonText}>Op naar de volgende</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>Deel je ervaring!</Text>
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
    padding: scale(20),
  },
  headerText: {
    fontSize: moderateScale(32),
    fontFamily: 'Impact',
    color: '#fff',
    textAlign: 'center',
    marginTop: verticalScale(100),
  },
  subHeaderText: {
    fontSize: moderateScale(18),
    fontFamily: 'LeagueSpartan-regular',
    color: '#fff',
    textAlign: 'center',
    marginTop: verticalScale(10),
  },
  badgeContainer: {
    width: scale(250),
    height: verticalScale(250),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: verticalScale(30),
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  questTitle: {
    fontSize: moderateScale(28),
    fontFamily: 'Impact',
    color: '#fff',
    textAlign: 'center',
  },
  questProgress: {
    fontSize: moderateScale(18),
    fontFamily: 'LeagueSpartan-regular',
    color: '#fff',
    textAlign: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(30),
  },
  progressImage: {
    width: '90%',
    height: verticalScale(80),
    marginBottom: verticalScale(50),
  },
  levelUpButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(60),
    borderRadius: moderateScale(30),
    width: '85%',
    marginBottom: verticalScale(15),
  },
  levelUpButtonText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: moderateScale(18),
    fontFamily: 'LeagueSpartan-semibold',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#0066FF',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(60),
    borderRadius: moderateScale(30),
    width: '85%',
    marginBottom: verticalScale(80),
  },
  shareButtonText: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontFamily: 'LeagueSpartan-semibold',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
