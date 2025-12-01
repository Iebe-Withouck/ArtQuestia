import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import Bell from '../../assets/icons/doorbell.png';
import Info from '../../assets/icons/info.png';
import ProfilePic from '../../assets/profile-info/Group 97.png'
import Potlood from '../../assets/profile-info/potlood.png'

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });



  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ThemedView style={styles.titleContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={styles.bellButton}>
        <Image source={Bell} style={styles.bellIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoButton}>
        <Image source={Info} style={styles.infoIcon} />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <View style={styles.profilePicWrapper}>
          <Image source={ProfilePic} style={styles.profilePic} />
          <Image source={Potlood} style={styles.editIcon} />
        </View>
        <ThemedText style={styles.profileName}>Jane Doe</ThemedText>
      </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingTop: verticalScale(70),
    paddingHorizontal: scale(20),
  },

  bellButton: {
    position: 'absolute',
    top: verticalScale(68),
    right: scale(20),
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  bellIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  infoButton: {
    position: 'absolute',
    top: verticalScale(68),
    left: scale(20),
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  infoIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: verticalScale(-10),
    marginBottom: verticalScale(20),
  },
  profilePicWrapper: {
    position: 'relative',
    width: moderateScale(100),
    height: moderateScale(100),
  },
  profilePic: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    resizeMode: 'contain',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(30),
    height: moderateScale(30),
    resizeMode: 'contain',
  },
  profileName: {
    fontSize: moderateScale(30),
    color: '#fff',
    fontFamily: 'Impact',
    marginTop: verticalScale(20),
  },

});