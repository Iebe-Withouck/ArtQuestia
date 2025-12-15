import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { auth } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '@/components/CustomAlert';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Account Aanmaken</Text>
      <Text style={styles.subtitle}>Maak een account om te beginnen</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Naam"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Leeftijd"
          placeholderTextColor="#999"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Wachtwoord"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Bevestig wachtwoord"
          placeholderTextColor="#999"
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
          Heb je al een account? <Text style={styles.loginTextBold}>Login hier</Text>
        </Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: scale(20),
  },
  title: {
    fontSize: moderateScale(32),
    fontFamily: 'Impact',
    color: '#fff',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#999',
    marginBottom: verticalScale(40),
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: verticalScale(20),
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
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
    color: '#fff',
    fontSize: moderateScale(18),
    fontFamily: 'Impact',
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: verticalScale(10),
  },
  loginText: {
    color: '#999',
    fontSize: moderateScale(14),
  },
  loginTextBold: {
    color: '#1AF7A2',
    fontWeight: 'bold',
  },
});
