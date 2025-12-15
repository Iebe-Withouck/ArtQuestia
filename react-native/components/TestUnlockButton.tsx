import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getCurrentUser, unlockArtwork, getUnlockedArtworks, isArtworkUnlocked } from '@/services/userService';

/**
 * Test component to verify Strapi connection and unlock functionality
 * Add this temporarily to any screen to test
 */
export default function TestUnlockButton() {
  const [userData, setUserData] = useState<any>(null);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [testArtworkId] = useState(1); // Change this to an actual artwork ID
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user
      const user = await getCurrentUser();
      setUserData(user);
      console.log('📱 Current User:', user);

      // Get unlocked artworks
      const unlocked = await getUnlockedArtworks();
      setUnlockedCount(unlocked.length);
      console.log('🎨 Unlocked Artworks:', unlocked);

      // Check if test artwork is unlocked
      const unlocked = await isArtworkUnlocked(testArtworkId);
      setIsUnlocked(unlocked);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
  };

  const testUnlock = async () => {
    try {
      console.log('🔓 Testing unlock for artwork:', testArtworkId);
      const success = await unlockArtwork(testArtworkId);
      
      if (success) {
        Alert.alert('Success!', `Artwork ${testArtworkId} unlocked and saved to Strapi!`);
        await loadData(); // Reload data
      } else {
        Alert.alert('Failed', 'Could not unlock artwork. Check console for errors.');
      }
    } catch (error) {
      console.error('❌ Error unlocking:', error);
      Alert.alert('Error', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Strapi Connection Test</Text>
      
      {userData ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>✅ User: {userData.userEmail}</Text>
          <Text style={styles.infoText}>🆔 Strapi ID: {userData.strapiUserId}</Text>
          <Text style={styles.infoText}>🔥 Firebase UID: {userData.firebaseUID?.slice(0, 10)}...</Text>
          <Text style={styles.infoText}>🎨 Unlocked: {unlockedCount} artworks</Text>
        </View>
      ) : (
        <Text style={styles.errorText}>❌ Not logged in</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={testUnlock}>
        <Text style={styles.buttonText}>
          {isUnlocked ? '✅ Already Unlocked' : '🔓 Test Unlock Artwork #' + testArtworkId}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.reloadButton} onPress={loadData}>
        <Text style={styles.buttonText}>🔄 Reload Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#FF7700',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  reloadButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
