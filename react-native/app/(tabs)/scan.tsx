import { useFocusEffect } from '@react-navigation/native';
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
  ViroARSceneNavigator,
  ViroDirectionalLight,
  ViroSpotLight,
  ViroText,
} from '@reactvision/react-viro';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// AR Scene showing a 3D model
function ARModelScene() {
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

      {/* Optional reference text */}
      <ViroText
        text="Look at the bomb below"
        scale={[0.2, 0.2, 0.2]}
        position={[0, 0.3, -1]}
        style={styles.helloText}
      />

      {/* 3D Cube with baked animation from Blender */}
      <Viro3DObject
        source={require('../../assets/3D-Models/bomb.glb')}
        resources={[]}
        position={[0, -0.4, -2]}
        scale={[0.1, 0.1, 0.1]}
        type="GLB"
        // This runs the animation that lives inside the GLB
        animation={{
          name: 'BombAction',   // <-- name of your Blender action / clip
          run: true,
          loop: true,
        }}
        dragType="FixedToWorld"
        onLoadStart={() => console.log('Bomb loading...')}
        onLoadEnd={() => console.log('Bomb loaded!')}
        onError={(event) => {
          console.error('Error loading bomb (message):', event.nativeEvent?.error);
          console.error(
            'Full error object:',
            JSON.stringify(event.nativeEvent, null, 2),
          );
        }}
      />
    </ViroARScene>
  );
}

export default function Scan() {
  const [sceneKey, setSceneKey] = useState(0);

  // Remount AR scene when tab is focused
  useFocusEffect(
    useCallback(() => {
      setSceneKey(prev => prev + 1);
      return () => { };
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <ViroARSceneNavigator
        key={sceneKey}
        autofocus={true}
        initialScene={{ scene: ARModelScene }}
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
});