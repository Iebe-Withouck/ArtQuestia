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
import { auth } from '@/config/firebase';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Notifications from '@/components/Notifications';

import Bell from '../assets/icons/doorbell.png';
import Info from '../assets/icons/info.png';
import ProfilePic from '../assets/profile-info/profile-pic.png';
import Plus from '../assets/profile-info/newPic.png'
import Arrow from '../assets/icons/arrow2.png';
import Cross from '../assets/icons/cross.png';
import Mail from '../assets/icons/mail.png';
import Phone from '../assets/icons/phone.png';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.email) {
      setEmail(user.email);
    }
  }, []);
  const [language, setLanguage] = useState('nl');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [camera, setCamera] = useState('False');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [location, setLocation] = useState('False');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [notificaties, setNotificaties] = useState('False');
  const [isNotificatiesOpen, setIsNotificatiesOpen] = useState(false);


  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  // Show notifications if opened
  if (showNotifications) {
    return <Notifications onClose={() => setShowNotifications(false)} />;
  }

  return (
    <ThemedView style={styles.titleContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.bellButton} onPress={() => setShowNotifications(true)}>
            <Image source={Bell} style={styles.bellIcon} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoButton} onPress={() => setInfoModalVisible(true)}>
            <Image source={Info} style={styles.infoIcon} />
          </TouchableOpacity>

          <View style={styles.profileContainer}>
            <View style={styles.profilePicWrapper}>
              <View style={styles.profilePicCircle}>
                <Image source={ProfilePic} style={styles.profilePic} resizeMode="cover" />
              </View>
              <TouchableOpacity
                onPress={() => { }}
                activeOpacity={0.9}
                style={styles.editIconTouchable}
              >
                <Image source={Plus} style={styles.editIconImage} />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.profileName} numberOfLines={2}>{userName}</ThemedText>
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
            <Image source={Arrow} style={[styles.dropdownArrowImage, { transform: [{ rotate: isLanguageOpen ? '0deg' : '180deg' }] }]} />
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
          <View style={styles.rowWithLabel}>
            <ThemedText style={styles.labelInline}>Camera</ThemedText>
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
              <Image source={Arrow} style={[styles.dropdownArrowImage, camera === 'True' && { tintColor: '#000' }, { transform: [{ rotate: isCameraOpen ? '0deg' : '180deg' }] }]} />
            </TouchableOpacity>
          </View>
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
          <View style={styles.rowWithLabel}>
            <ThemedText style={styles.labelInline}>Locatie</ThemedText>
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
              <Image source={Arrow} style={[styles.dropdownArrowImage, location === 'True' && { tintColor: '#000' }, { transform: [{ rotate: isLocationOpen ? '0deg' : '180deg' }] }]} />
            </TouchableOpacity>
          </View>
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

        <View style={styles.notificatiesSection}>
          <View style={styles.rowWithLabel}>
            <ThemedText style={styles.labelInline}>Notificaties</ThemedText>
            <TouchableOpacity
              style={[
                styles.dropdownNotificaties,
                notificaties === 'False' && styles.dropdownNotificatiesRed,
                notificaties === 'True' && styles.dropdownNotificatiesGreen
              ]}
              onPress={() => setIsNotificatiesOpen(!isNotificatiesOpen)}
            >
              <ThemedText style={[styles.dropdownText, notificaties === 'True' && styles.dropdownTextGreen]}>
                {notificaties === 'False' ? 'Niet-toegelaten' : notificaties === 'True' ? 'Toegelaten' : ''}
              </ThemedText>
              <Image source={Arrow} style={[styles.dropdownArrowImage, notificaties === 'True' && { tintColor: '#000' }, { transform: [{ rotate: isNotificatiesOpen ? '0deg' : '180deg' }] }]} />
            </TouchableOpacity>
          </View>
          {isNotificatiesOpen && (
            <View style={styles.dropdownOptions}>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => { setNotificaties('False'); setIsNotificatiesOpen(false); }}
              >
                <ThemedText style={styles.dropdownOptionText}>Niet-toegelaten</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => { setNotificaties('True'); setIsNotificatiesOpen(false); }}
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

      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <TouchableOpacity
              style={styles.infoModalCloseButton}
              onPress={() => setInfoModalVisible(false)}
            >
              <Image source={Cross} style={styles.infoModalCloseIcon} />
            </TouchableOpacity>

            <ThemedText style={styles.infoModalTitle}>Heb je problemen{"\n"}of vragen?</ThemedText>

            <ThemedText style={styles.infoModalSubtitle}>Meld dit via</ThemedText>

            <View style={styles.infoModalContactRow}>
              <Image source={Mail} style={styles.infoModalIcon} />
              <ThemedText style={styles.infoModalContactText}>lieselotte.peperstraete@kortrijk.be</ThemedText>
            </View>

            <View style={styles.infoModalContactRow}>
              <Image source={Phone} style={styles.infoModalIcon} />
              <ThemedText style={styles.infoModalContactText}>+32 478 67 25 90</ThemedText>
            </View>
          </View>
        </View>
      </Modal>
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
  notificationDot: {
    position: 'absolute',
    top: moderateScale(2),
    right: moderateScale(2),
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#FF0000',
    borderWidth: 1.5,
    borderColor: '#000',
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
    paddingHorizontal: scale(20),
  },
  profilePicWrapper: {
    position: 'relative',
    width: moderateScale(100),
    height: moderateScale(100),
    marginBottom: verticalScale(10),
  },
  profilePicCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    overflow: 'hidden',
    backgroundColor: '#444',
  },
  profilePic: {
    width: moderateScale(100),
    height: moderateScale(100),
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
    bottom: -5,
    right: -5,
    width: moderateScale(35),
    height: moderateScale(35),
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconImage: {
    width: moderateScale(30),
    height: moderateScale(30),
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  profileName: {
    fontSize: moderateScale(26),
    color: '#fff',
    fontFamily: 'Impact',
    marginTop: verticalScale(10),
    textAlign: 'center',
    width: '100%',
    lineHeight: moderateScale(30),
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
    fontFamily: 'LeagueSpartan-regular',
    marginBottom: verticalScale(8),
  },
  rowWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  labelInline: {
    fontSize: moderateScale(20),
    color: '#fff',
    fontFamily: 'LeagueSpartan-regular',
    flex: 1,
  },
  labelHeader: {
    fontSize: moderateScale(20),
    color: '#fff',
    fontFamily: 'LeagueSpartan-semibold',
    marginBottom: verticalScale(8),
    fontWeight: '600',
    marginTop: verticalScale(35),
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    fontSize: moderateScale(15),
    color: '#fff',
    fontFamily: 'LeagueSpartan-regular',
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
  },
  notificatiesSection: {
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
    alignItems: 'center',
    minWidth: scale(180),
  },
  dropdownCameraRed: {
    backgroundColor: '#292929',
  },
  dropdownCameraGreen: {
    backgroundColor: '#1AF7A2',
  },
  dropdownLocation: {
    backgroundColor: '#292929',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: scale(180),
  },
  dropdownLocationRed: {
    backgroundColor: '#292929',
  },
  dropdownLocationGreen: {
    backgroundColor: '#1AF7A2',
  },
  dropdownNotificaties: {
    backgroundColor: '#292929',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: scale(180),
  },
  dropdownNotificatiesRed: {
    backgroundColor: '#292929',
  },
  dropdownNotificatiesGreen: {
    backgroundColor: '#1AF7A2',
  },
  dropdownText: {
    fontSize: moderateScale(15),
    color: '#fff',
    fontFamily: 'LeagueSpartan-regular',
  },
  dropdownTextGreen: {
    color: '#000',
  },
  dropdownArrow: {
    fontSize: moderateScale(12),
    color: '#fff',
  },
  dropdownArrowImage: {
    width: moderateScale(10),
    height: moderateScale(10),
    tintColor: '#fff',
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
    fontFamily: 'LeagueSpartan-regular',
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
    fontFamily: 'LeagueSpartan-semibold',
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
    fontFamily: 'LeagueSpartan-regular',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: moderateScale(20),
    padding: scale(40),
    paddingTop: scale(20),
    width: '90%',
    alignItems: 'center',
    position: 'relative',
  },
  infoModalCloseButton: {
    position: 'absolute',
    top: verticalScale(20),
    right: scale(20),
    width: moderateScale(35),
    height: moderateScale(35),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  infoModalCloseIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  infoModalTitle: {
    fontSize: moderateScale(28),
    color: '#fff',
    fontFamily: 'Impact',
    textAlign: 'left',
    width: '100%',
    marginTop: verticalScale(5),
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(32),
  },
  infoModalSubtitle: {
    fontSize: moderateScale(18),
    color: '#fff',
    fontFamily: 'LeagueSpartan-regular',
    textAlign: 'left',
    width: '100%',
    marginBottom: verticalScale(15),
  },
  infoModalContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
    width: '100%',
    paddingHorizontal: scale(10),
  },
  infoModalIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    resizeMode: 'contain',
    marginRight: scale(15),
  },
  infoModalContactText: {
    fontSize: moderateScale(14),
    color: '#fff',
    fontFamily: 'LeagueSpartan-regular',
    flex: 1,
    textAlign: 'left',
  },

});