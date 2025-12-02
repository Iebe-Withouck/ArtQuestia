import { useFocusEffect } from '@react-navigation/native';
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
  ViroARSceneNavigator,
  ViroDirectionalLight,
  ViroNode,
  ViroSpotLight,
  ViroText,
} from '@reactvision/react-viro';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// Calculate bearing between two GPS coordinates
const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const toDeg = (rad: number) => rad * (180 / Math.PI);

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

// Calculate distance between two GPS coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Convert GPS coordinates to AR position relative to user
const gpsToARPosition = (
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number
): [number, number, number] => {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  const bearing = calculateBearing(userLat, userLon, targetLat, targetLon);

  // Convert bearing to radians
  const bearingRad = (bearing * Math.PI) / 180;

  // Scale down the distance for AR (1 meter real = 0.01 AR units for better visibility)
  const scaleFactor = 0.01;
  const scaledDistance = distance * scaleFactor;

  // Calculate x, z positions with scaled distance
  const x = scaledDistance * Math.sin(bearingRad);
  const z = -scaledDistance * Math.cos(bearingRad);

  // Set y to -0.5 to place object at chest/eye level
  const y = -0.5;

  return [x, y, z];
};

// AR Scene showing a 3D model at specific GPS coordinates
interface ARModelSceneProps {
  userLocation: Location.LocationObject | null;
  targetLatitude: number;
  targetLongitude: number;
}

function ARModelScene({ userLocation, targetLatitude, targetLongitude }: ARModelSceneProps) {
  // Calculate AR position based on GPS coordinates
  const arPosition: [number, number, number] = userLocation
    ? gpsToARPosition(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      targetLatitude,
      targetLongitude
    )
    : [0, -0.4, -2]; // Default position if no GPS

  const distance = userLocation
    ? calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      targetLatitude,
      targetLongitude
    )
    : 0;

  return (
    <ViroARScene>
      {/* Ambient light for overall scene illumination */}
      <ViroAmbientLight color="#ffffff" intensity={30000} />

      {/* Directional light from above-front to simulate sunlight */}
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.5]}
        intensity={500}
      />

      {/* Additional directional light from the side for depth */}
      <ViroDirectionalLight
        color="#ffffff"
        direction={[1, -0.5, 0]}
        intensity={300}
      />

      {/* Node to group and anchor all objects at GPS coordinates */}
      <ViroNode
        position={arPosition}
        dragType="FixedToWorld"
      >
        {/* Distance indicator text */}
        <ViroText
          text={`${Math.round(distance)}m away`}
          scale={[0.2, 0.2, 0.2]}
          position={[0, 0.5, 0]}
          style={styles.helloText}
        />

        {/* 3D Model with baked animation from Blender */}
        <Viro3DObject
          source={require('../../assets/3D-Models/bomb.glb')}
          resources={[]}
          position={[0, 0, 0]}
          scale={[0.1, 0.1, 0.1]}
          type="GLB"
          animation={{
            name: 'BombAction',
            run: true,
            loop: true,
          }}
          lightReceivingBitMask={1}
          shadowCastingBitMask={1}
          onLoadStart={() => console.log('Bomb loading...')}
          onLoadEnd={() => console.log('Bomb loaded at GPS coordinates')}
          onError={(event) => {
            console.error('Error loading bomb (message):', event.nativeEvent?.error);
            console.error(
              'Full error object:',
              JSON.stringify(event.nativeEvent, null, 2),
            );
          }}
        />
      </ViroNode>
    </ViroARScene>
  );
}

export default function Scan() {
  const [sceneKey, setSceneKey] = useState(0);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Target GPS coordinates
  const TARGET_LATITUDE = 50.818549;
  const TARGET_LONGITUDE = 3.436160;

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        console.log('Location permission denied');
        return;
      }

      setHasPermission(true);

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(location);
      console.log('User location:', location.coords);

      // Watch for location updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setUserLocation(newLocation);
        }
      );
    })();
  }, []);

  // Remount AR scene when tab is focused
  useFocusEffect(
    useCallback(() => {
      setSceneKey(prev => prev + 1);
      return () => { };
    }, [])
  );

  // Show loading while getting location
  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Requesting location permission...</Text>
      </View>
    );
  }

  // Show error if permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Location permission denied</Text>
        <Text style={styles.errorSubtext}>Please enable location services to use AR</Text>
      </View>
    );
  }

  // Show loading while getting GPS lock
  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Getting GPS location...</Text>
      </View>
    );
  }

  // Wrapper function to pass props to ARModelScene
  const ARSceneWrapper = () => (
    <ARModelScene
      userLocation={userLocation}
      targetLatitude={TARGET_LATITUDE}
      targetLongitude={TARGET_LONGITUDE}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <ViroARSceneNavigator
        key={sceneKey}
        autofocus={true}
        initialScene={{ scene: ARSceneWrapper }}
        worldAlignment="GravityAndHeading"
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  helloText: {
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 20,
  },
  errorText: {
    fontSize: 20,
    color: '#ff0000',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});