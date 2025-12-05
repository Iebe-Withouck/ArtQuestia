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

import Bell from '../assets/icons/doorbell.png';
import Info from '../assets/icons/info.png';
import ProfilePic from '../assets/profile-info/Group 97.png'
import Plus from '../assets/profile-info/newPic.png'

interface SettingsEditProps {
  onClose: () => void;
  userName: string;
  userAge: string;
  onSave: (name: string, age: string) => void;
}

export default function SettingsEdit({ onClose, userName, userAge, onSave }: SettingsEditProps) {
  const [fontsLoaded] = useFonts({
    Impact: require('../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const [name, setName] = useState(userName);
  const [age, setAge] = useState(userAge);
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('nl');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [camera, setCamera] = useState('False');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [location, setLocation] = useState('False');
  const [isLocationOpen, setIsLocationOpen] = useState(false);


  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ThemedView style={styles.titleContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.bellButton}>
          <Image source={Bell} style={styles.bellIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Image source={Info} style={styles.infoIcon} />
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <View style={styles.profilePicWrapper}>
            <Image source={ProfilePic} style={styles.profilePic} />
            <Image source={Plus} style={styles.editIconImage} />
          </View>
          <ThemedText style={styles.profileName}>{userName}</ThemedText>
        </View>

        <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Naam</ThemedText>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Voer je naam in"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Leeftijd</ThemedText>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Voer je leeftijd in"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>E-mail</ThemedText>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Voer je e-mail in"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
      </View>

      <View style={styles.languageSection}>
        <ThemedText style={styles.label}>Taal</ThemedText>
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setIsLanguageOpen(!isLanguageOpen)}
        >
          <ThemedText style={styles.dropdownText}>
            {language === 'nl' ? 'Nederlands' : language === 'en' ? 'English' : language === 'fr' ? 'Français' : 'Deutsch'}
          </ThemedText>
          <ThemedText style={styles.dropdownArrow}>{isLanguageOpen ? '▲' : '▼'}</ThemedText>
        </TouchableOpacity>
        {isLanguageOpen && (
          <View style={styles.dropdownOptions}>
            <TouchableOpacity 
              style={styles.dropdownOption}
              onPress={() => { setLanguage('nl'); setIsLanguageOpen(false); }}
            >
              <ThemedText style={styles.dropdownOptionText}>Nederlands</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dropdownOption}
              onPress={() => { setLanguage('en'); setIsLanguageOpen(false); }}
            >
              <ThemedText style={styles.dropdownOptionText}>English</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dropdownOption}
              onPress={() => { setLanguage('fr'); setIsLanguageOpen(false); }}
            >
              <ThemedText style={styles.dropdownOptionText}>Français</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dropdownOption}
              onPress={() => { setLanguage('de'); setIsLanguageOpen(false); }}
            >
              <ThemedText style={styles.dropdownOptionText}>Deutsch</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.machtigingenSection}>
        <ThemedText style={styles.labelHeader}>App-machtigingen</ThemedText>
      </View>

        <View style={styles.cameraSection}>
        <ThemedText style={styles.label}>Camera</ThemedText>
        <TouchableOpacity 
          style={[
            styles.dropdownCamera,
            camera === 'False' && styles.dropdownCameraRed,
            camera === 'True' && styles.dropdownCameraGreen
          ]}
          onPress={() => setIsCameraOpen(!isCameraOpen)}
        >
          <ThemedText style={[styles.dropdownText, camera === 'True' && styles.dropdownTextGreen]}>
            {camera === 'False' ? 'Niet-toegelaten' : camera === 'True' ? 'Toegelaten' : ''}
          </ThemedText>
          <ThemedText style={[styles.dropdownArrow, camera === 'True' && styles.dropdownTextGreen]}>{isCameraOpen ? '▲' : '▼'}</ThemedText>
        </TouchableOpacity>
        {isCameraOpen && (
          <View style={styles.dropdownOptions}>
            <TouchableOpacity 
              style={styles.dropdownOption}
              onPress={() => { setCamera('False'); setIsCameraOpen(false); }}
            >
              <ThemedText style={styles.dropdownOptionText}>Niet-toegelaten</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dropdownOption}
              onPress={() => { setCamera('True'); setIsCameraOpen(false); }}
            >
              <ThemedText style={styles.dropdownOptionText}>Toegelaten</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

    <View style={styles.locatieSection}>
        <ThemedText style={styles.label}>Locatie</ThemedText>
        <TouchableOpacity 
          style={[
            styles.dropdownLocation,
            location === 'False' && styles.dropdownLocationRed,
            location === 'True' && styles.dropdownLocationGreen
          ]}
          onPress={() => setIsLocationOpen(!isLocationOpen)}
        >
          <ThemedText style={[styles.dropdownText, location === 'True' && styles.dropdownTextGreen]}>
            {location === 'False' ? 'Niet-toegelaten' : location === 'True' ? 'Toegelaten' : ''}
          </ThemedText>
          <ThemedText style={[styles.dropdownArrow, location === 'True' && styles.dropdownTextGreen]}>{isLocationOpen ? '▲' : '▼'}</ThemedText>
        </TouchableOpacity>
        {isLocationOpen && (
          <View style={styles.dropdownOptions}>
            <TouchableOpacity 
              style={styles.dropdownOption}
              onPress={() => { setLocation('False'); setIsLocationOpen(false); }}
            >
              <ThemedText style={styles.dropdownOptionText}>Niet-toegelaten</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dropdownOption}
              onPress={() => { setLocation('True'); setIsLocationOpen(false); }}
            >
              <ThemedText style={styles.dropdownOptionText}>Toegelaten</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={() => onSave(name, age)}
      >
        <ThemedText style={styles.saveButtonText}>Wijzigingen opslaan</ThemedText>
      </TouchableOpacity>

        <TouchableOpacity 
        style={styles.cancelButton}
        onPress={onClose}
      >
        <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
      </TouchableOpacity>

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
  profileSection: {
    backgroundColor: '#292929',
    paddingTop: verticalScale(80),
    paddingBottom: verticalScale(40),
    paddingHorizontal: scale(20),
    marginHorizontal: scale(-20),
    marginTop: verticalScale(-70),
    marginBottom: verticalScale(30),
    borderRadius: moderateScale(30),
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
  editIconTouchable: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(30),
    height: moderateScale(30),
    zIndex: 10,
  },
  editIconImage: {
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
  formContainer: {
    width: '100%',
    marginTop: verticalScale(30),
    paddingHorizontal: scale(20),
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(20),
    color: '#fff',
    fontFamily: 'LeagueSpartan',
    marginBottom: verticalScale(8),
  },  
  labelHeader: {
    fontSize: moderateScale(16),
    color: '#fff',
    fontFamily: 'LeagueSpartan',
    marginBottom: verticalScale(8),
    fontWeight: 'bold',
    marginTop: verticalScale(35),
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    fontSize: moderateScale(15),
    color: '#fff',
    fontFamily: 'LeagueSpartan',
  },
  languageSection: {
    width: '100%',
    marginTop: verticalScale(10),
    paddingHorizontal: scale(20),
  },
  machtigingenSection: {
    width: '100%',
    marginTop: verticalScale(10),
    paddingHorizontal: scale(20),
  },
  cameraSection: {
    width: '100%',
    marginTop: verticalScale(20),
    paddingHorizontal: scale(20),
  },
  locatieSection: {
    width: '100%',
    marginTop: verticalScale(20),
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  dropdown: {
    backgroundColor: '#292929',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownCamera: {
    backgroundColor: '#292929',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(70),
    alignItems: 'center',
  },
  dropdownCameraRed: {
    backgroundColor: '#dc2626',
  },
  dropdownCameraGreen: {
    backgroundColor: '#16a34a',
  },
  dropdownLocation: {
    backgroundColor: '#292929',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(70),
    alignItems: 'center',
  },
  dropdownLocationRed: {
    backgroundColor: '#dc2626',
  },
  dropdownLocationGreen: {
    backgroundColor: '#16a34a',
  },
  dropdownText: {
    fontSize: moderateScale(15),
    color: '#fff',
    fontFamily: 'LeagueSpartan',
  },
  dropdownTextGreen: {
    color: '#000',
  },
  dropdownArrow: {
    fontSize: moderateScale(12),
    color: '#fff',
  },
  dropdownOptions: {
    flexDirection: 'column',
    backgroundColor: '#292929',
    borderRadius: moderateScale(12),
    marginTop: verticalScale(8),
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownOptionText: {
    fontSize: moderateScale(15),
    color: '#fff',
    fontFamily: 'LeagueSpartan',
  },
  saveButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(50),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(30),
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'LeagueSpartan',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(50),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(15),
    marginBottom: verticalScale(40),
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: moderateScale(20),
    fontFamily: 'LeagueSpartan',
    textAlign: 'center',
  },

});