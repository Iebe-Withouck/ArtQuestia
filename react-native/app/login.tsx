import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Logged in successfully!');
      // Navigate to the main app (tabs)
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
      Alert.alert('Login Error', e.message);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welkom Terug!</Text>
      <Text style={styles.subtitle}>Log in om verder te gaan</Text>

      <View style={styles.inputContainer}>
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
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
          Nog geen account? <Text style={styles.registerTextBold}>Registreer hier</Text>
        </Text>
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
    color: '#fff',
    fontSize: moderateScale(18),
    fontFamily: 'Impact',
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: verticalScale(10),
  },
  registerText: {
    color: '#999',
    fontSize: moderateScale(14),
  },
  registerTextBold: {
    color: '#1AF7A2',
    fontWeight: 'bold',
  },
});
