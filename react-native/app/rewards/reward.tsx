import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function Reward() {
  const params = useLocalSearchParams();
  const themeName = (params.themeName as string) || 'Modern';

  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    'LeagueSpartan-regular': require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
    'LeagueSpartan-semibold': require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const handleReward = () => {
    router.push("/(tabs)/map");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header Text */}
      <Text style={[styles.headerText, { fontFamily: 'Impact' }]}>{themeName} quest voltooid</Text>
      <Text style={[styles.subHeaderText, { fontFamily: 'LeagueSpartan-regular' }]}>
        We droppen je beloning in je mailbox,{'\n'}binnen max. 2 dagen. Enjoy!
      </Text>

      {/* Reward Image */}
      <View style={styles.rewardContainer}>
        <Image
          source={require('../../assets/images/reward.png')}
          style={styles.rewardImage}
          resizeMode="contain"
        />
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.rewardButton} onPress={handleReward}>
        <Text style={[styles.rewardButtonText, { fontFamily: 'LeagueSpartan-semibold' }]}>Start nieuwe quest</Text>
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
    marginTop: verticalScale(80),
    marginBottom: verticalScale(20),
  },
  subHeaderText: {
    fontSize: moderateScale(16),
    fontFamily: 'LeagueSpartan-regular',
    color: '#fff',
    textAlign: 'center',
    marginBottom: verticalScale(60),
    lineHeight: moderateScale(24),
  },
  rewardContainer: {
    width: scale(350),
    height: verticalScale(400),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(60),
  },
  rewardImage: {
    width: '125%',
    height: '125%',
  },
  rewardButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(60),
    borderRadius: moderateScale(30),
    width: '85%',
    marginBottom: verticalScale(80),
  },
  rewardButtonText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: moderateScale(20),
    fontFamily: 'LeagueSpartan-semibold',
    textAlign: 'center',
  },
});
