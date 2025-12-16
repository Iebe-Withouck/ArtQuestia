import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { auth } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '@/components/CustomAlert';

import PinkSmiley from '../assets/images/pinkSmiley.png';
import Footer1 from '../assets/icons/footer1.png';
import Footer2 from '../assets/icons/footer2.png';
import Footer3 from '../assets/icons/footer3.png';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  const handleRegister = async () => {
    setError('');

    // Validation
    if (!name || !age || !email || !password || !confirmPassword) {
      setError('Vul alle velden in');
      return;
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters zijn');
      return;
    }

    setLoading(true);

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Register user with Strapi and send name/age
      try {
        const response = await fetch(`${STRAPI_URL}/api/auth/firebase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: idToken,
            name: name,
            age: age,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Successfully registered with Strapi:', data);

          // Store all user data
          await AsyncStorage.setItem('strapiToken', data.jwt);
          await AsyncStorage.setItem('strapiUserId', data.user.id.toString());
          await AsyncStorage.setItem('firebaseUID', firebaseUser.uid);
          await AsyncStorage.setItem('userEmail', data.user.email);
          await AsyncStorage.setItem('userName', name);
          await AsyncStorage.setItem('userAge', age);

          console.log('User data saved:', {
            strapiUserId: data.user.id,
            firebaseUID: firebaseUser.uid,
            email: data.user.email,
            name: name,
            age: age
          });
        } else {
          console.error('Strapi registration failed:', data);
          throw new Error(data.error?.message || 'Strapi registration failed');
        }
      } catch (strapiError: any) {
        console.error('Error registering with Strapi:', strapiError);
        // Clean up Firebase user if Strapi registration fails
        await deleteUser(firebaseUser);
        throw new Error('Account creation failed. Please try again.');
      }

      setAlertConfig({
        title: 'Succes',
        message: 'Account succesvol aangemaakt!',
        type: 'success',
      });
      setAlertVisible(true);

      // Navigate after a brief delay to show the success message
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    } catch (e: any) {
      let errorMessage = e.message;

      // Translate common Firebase errors to Dutch
      if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'Dit e-mailadres is al in gebruik';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = 'Ongeldig e-mailadres';
      } else if (e.code === 'auth/weak-password') {
        errorMessage = 'Wachtwoord is te zwak';
      }

      setError(errorMessage);
      setAlertConfig({
        title: 'Registratie fout',
        message: errorMessage,
        type: 'error',
      });
      setAlertVisible(true);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Registreer en spaar stickers om beloningen te winnen!</Text>
          <Image source={PinkSmiley} style={styles.pinkSmileyImage} resizeMode="contain" />
        </View>

        <View style={styles.inputContainer}>
        <Text style={styles.label}>Naam</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <Text style={styles.label}>Leeftijd</Text>
        <TextInput
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.label}>Wachtwoord</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <Text style={styles.label}>Bevestig wachtwoord</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.registerButton, loading && styles.disabledButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.registerButtonText}>
          {loading ? 'Bezig met registreren...' : 'Registreer'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogin} style={styles.loginLink}>
        <Text style={styles.loginText}>
          Wel al een account? <Text style={styles.loginTextBold}>Login hier!</Text>
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Image source={Footer1} style={styles.footerImageSmall} resizeMode="contain" />
        <Image source={Footer2} style={styles.footerImageLarge} resizeMode="contain" />
        <Image source={Footer3} style={styles.footerImageSmall} resizeMode="contain" />
      </View>

        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
    paddingBottom: verticalScale(100),
  },
  titleContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: verticalScale(45),
  },
  title: {
    fontSize: moderateScale(28),
    fontFamily: 'Impact',
    color: '#fff',
    textAlign: 'center',
    zIndex: 1,
  },
  pinkSmileyImage: {
    position: 'absolute',
    right: scale(-10),
    top: verticalScale(25),
    width: moderateScale(100),
    height: moderateScale(100),
    zIndex: 0,
  },
  inputContainer: {
    width: '100%',
    marginBottom: verticalScale(15),
  },
  label: {
    fontSize: moderateScale(16),
    color: '#fff',
    fontFamily: 'LeagueSpartan-regular',
    marginBottom: verticalScale(8),
    marginLeft: scale(5),
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: moderateScale(10),
    padding: moderateScale(15),
    marginBottom: verticalScale(15),
    color: '#fff',
    fontSize: moderateScale(16),
  },
  errorText: {
    color: '#ff4444',
    marginBottom: verticalScale(15),
    textAlign: 'center',
    fontSize: moderateScale(14),
  },
  registerButton: {
    backgroundColor: '#FF7700',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(60),
    borderRadius: moderateScale(25),
    width: '100%',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: moderateScale(18),
    fontFamily: 'LeagueSpartan-semibold',
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: verticalScale(0),
  },
  loginText: {
    color: '#999',
    fontSize: moderateScale(14),
  },
  loginTextBold: {
    color: '#1AF7A2',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: scale(20),
  },
  footerImageSmall: {
    width: moderateScale(20),
    height: moderateScale(35),
  },
  footerImageLarge: {
    width: moderateScale(65),
    height: moderateScale(65),
  },
});
