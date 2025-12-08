import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, TextInput } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

import Smiley from '../../assets/images/pinkSmiley.png';
import Google from '../../assets/icons/Google.png';
import Instagram from '../../assets/icons/Instagram.png';

export default function Screen4() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleNext = () => {
    router.push("/onboarding/locatiePermission");
  };

  const handleLogin = () => {
    router.push("/onboarding/login");
  };

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <Text style={styles.title}>Registreer en spaar stickers om beloningen te winnen!</Text>
      </View>
      <Image source={Smiley} style={styles.phoneImage} />

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Naam</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Voer je naam in"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Voer je email in"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Wachtwoord</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Voer je wachtwoord in"
            placeholderTextColor="#999"
            secureTextEntry={true}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Herhaal wachtwoord</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Voer je wachtwoord in"
            placeholderTextColor="#999"
            secureTextEntry={true}
            autoCapitalize="none"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleNext}>
        <Text style={styles.loginButtonText}>Registreer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registreerButton} onPress={handleLogin}>
        <Text style={styles.registreerButtonText}>Wel al een account? Log in!</Text>
      </TouchableOpacity>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.googleButton}>
          <Image source={Google} style={styles.googleImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.instagramButton}>
          <Image source={Instagram} style={styles.instagramImage} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: verticalScale(50),
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: verticalScale(-50),
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Impact',
    color: '#fff',
    textAlign: 'center',
    maxWidth: scale(500),
  },
  phoneImage: {
    width: scale(120),
    height: verticalScale(120),
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    marginBottom: verticalScale(20),
    marginTop: verticalScale(-30),
  },
  loginButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(105),
    borderRadius: moderateScale(10),
    marginTop: verticalScale(10),
    alignSelf: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Impact',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registreerButton: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(50),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(10),
    alignSelf: 'center',
  },
  registreerButtonText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: 'LeagueSpartan-regular',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(-10),
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
    backgroundColor: '#292929',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    fontSize: moderateScale(15),
    color: '#fff',
    fontFamily: 'LeagueSpartan-regular',
  },
  forgotPassword: {
    fontSize: moderateScale(12),
    color: '#fff',
    fontFamily: 'LeagueSpartan-regular',
    marginTop: verticalScale(10),
    textAlign: 'left',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
    gap: scale(20),
  },
  googleButton: {
    backgroundColor: '#292929',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    borderRadius: moderateScale(10),
    marginTop: verticalScale(10),
    alignSelf: 'center',
  },
  googleImage: {
    width: scale(30),
    height: verticalScale(30),
    resizeMode: 'contain',
  },
  instagramButton: {
    backgroundColor: '#292929',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    borderRadius: moderateScale(10),
    marginTop: verticalScale(10),
    alignSelf: 'center',
  },
  instagramImage: {
    width: scale(30),
    height: verticalScale(30),
    resizeMode: 'contain',
  },
});