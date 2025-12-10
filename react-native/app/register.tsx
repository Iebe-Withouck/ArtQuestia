import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      await auth().createUserWithEmailAndPassword(email, password);
      
      // Save user info to AsyncStorage
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userAge', age);
      
      Alert.alert('Succes', 'Account succesvol aangemaakt!');
      // Navigate to the main app (tabs)
      router.replace('/(tabs)');
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
      Alert.alert('Registratie fout', errorMessage);
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
