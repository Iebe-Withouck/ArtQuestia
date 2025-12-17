import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function LeveledUp() {
  const params = useLocalSearchParams();
  const themeName = (params.themeName as string) || 'Modern';
  const badgeUrl = params.badgeUrl as string;
  const progress = params.progress ? parseInt(params.progress as string) : 0;

  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    'LeagueSpartan-regular': require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
    'LeagueSpartan-semibold': require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const handleLeveledUp = () => {
    router.push("/(tabs)/map");
  };

  const handleShare = () => {
    router.replace("/(tabs)");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header Text */}
      <Text style={[styles.headerText, { fontFamily: 'Impact' }]}>Goede vooruitgang</Text>
      <Text style={[styles.subHeaderText, { fontFamily: 'LeagueSpartan-regular' }]}>Ga zo voort!</Text>

      {/* Badge Image */}
      <View style={styles.badgeContainer}>
        {badgeUrl ? (
          <Image
            source={{ uri: badgeUrl }}
            style={styles.badgeImage}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require('../../assets/images/badge2.png')}
            style={styles.badgeImage}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Quest Title */}
      <Text style={[styles.questTitle, { fontFamily: 'Impact' }]}>{themeName} quest</Text>
      <Text style={[styles.questProgress, { fontFamily: 'LeagueSpartan-regular' }]}>{progress}% compleet</Text>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        {/* Running icon that moves with progress */}
        <Image
          source={require('../../assets/icons/running.png')}
          style={[
            styles.runningIcon,
            { left: `${progress}%` }
          ]}
        />
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%` }
            ]}
          />
        </View>
        {/* Flag icon at the end */}
        <Image
          source={require('../../assets/icons/flag.png')}
          style={styles.flagIcon}
        />
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.levelUpButton} onPress={handleLeveledUp}>
        <Text style={[styles.levelUpButtonText, { fontFamily: 'LeagueSpartan-semibold' }]}>Ga naar de volgende</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={[styles.shareButtonText, { fontFamily: 'LeagueSpartan-semibold' }]}>Deel je ervaring!</Text>
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
  // Progress bar styles
  progressBarContainer: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(50),
    position: 'relative',
    width: '90%',
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
    marginLeft: -moderateScale(15), // Center the icon on the percentage point
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
