import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '@/components/CustomAlert';
import { useClaimedStickers } from '@/contexts/ClaimedStickersContext';

import Footer1 from '../assets/icons/footer1.png';
import Footer2 from '../assets/icons/footer2.png';
import Footer3 from '../assets/icons/footer3.png';
import Wink from '../assets/images/wink.png';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function LoginScreen() {
  const { reloadUnlockedArtworks } = useClaimedStickers();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      try {
        const response = await fetch(`${STRAPI_URL}/api/auth/firebase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: idToken,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Successfully authenticated with Strapi:', data);
          await AsyncStorage.setItem('strapiToken', data.jwt);
          await AsyncStorage.setItem('strapiUserId', data.user.id.toString());
          await AsyncStorage.setItem('firebaseUID', userCredential.user.uid);
          await AsyncStorage.setItem('userEmail', data.user.email);
          const savedToken = await AsyncStorage.getItem('strapiToken');
          const savedUserId = await AsyncStorage.getItem('strapiUserId');

          console.log('✅ User data saved to AsyncStorage:', {
            strapiUserId: data.user.id,
            firebaseUID: userCredential.user.uid,
            email: data.user.email,
            tokenSaved: !!savedToken,
            tokenLength: savedToken?.length,
            userIdSaved: !!savedUserId
          });
        } else {
          console.error('Strapi authentication failed:', data);
          throw new Error(data.error?.message || 'Strapi authentication failed');
        }
      } catch (strapiError) {
        console.error('Error sending token to Strapi:', strapiError);
        await AsyncStorage.setItem('firebaseUID', userCredential.user.uid);
        await AsyncStorage.setItem('userEmail', userCredential.user.email || '');
        console.log('⚠️ Saved Firebase data locally, but Strapi sync failed');
      }
      await reloadUnlockedArtworks();

      // On success, navigate to the main app without showing a success alert
      router.replace('/(tabs)');
    } catch (e: any) {
      setAlertConfig({
        title: 'Login Error',
        message: e.message,
        type: 'error',
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Login om stickers te sparen</Text>
          <Text style={styles.subtitle}>Loop geen{'\n'}beloningen kwijt!</Text>
        </View>

        <Image source={Wink} style={styles.winkImage} resizeMode="contain" />

        <View style={styles.inputContainer}>
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
      </View>

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? 'Bezig met inloggen...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRegister} style={styles.registerLink}>
        <Text style={styles.registerText}>
          Nog geen account? <Text style={styles.registerTextBold}>Registreer hier!</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
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
    marginBottom: verticalScale(15),
  },
  title: {
    fontSize: moderateScale(28),
    fontFamily: 'Impact',
    color: '#fff',
    marginBottom: verticalScale(10),
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: scale(20),
  },
  subtitle: {
    fontSize: moderateScale(20),
    color: '#fff',
    marginBottom: verticalScale(0),
    textAlign: 'center',
    fontFamily: "LeagueSpartan-regular",
  },
  winkImage: {
    width: moderateScale(250),
    height: moderateScale(250),
    marginBottom: verticalScale(0),
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
  loginButton: {
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
  loginButtonText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: moderateScale(18),
    fontFamily: 'LeagueSpartan-semibold',
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: verticalScale(0),
  },
  registerText: {
    color: '#999',
    fontSize: moderateScale(14),
  },
  registerTextBold: {
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
