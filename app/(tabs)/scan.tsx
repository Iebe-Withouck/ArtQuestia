import { useFocusEffect } from '@react-navigation/native';
import {
  Viro3DObject,
  ViroAnimations,
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
} from '@reactvision/react-viro';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// Register a rotation animation
ViroAnimations.registerAnimations({
  rotate: {
    properties: { rotateY: '+=360' }, // Rotate 360 degrees
    duration: 3000, // Duration in ms
  },
});

// AR Scene showing a 3D model
function ARModelScene() {
  return (
    <ViroARScene>
      {/* Optional reference text */}
      <ViroText
        text="Look at the model below"
        scale={[0.2, 0.2, 0.2]}
        position={[0, 0.3, -1]}
        style={styles.helloText}
      />

      {/* 3D Model */}
      <Viro3DObject
        source={require('../../assets/3D-Models/model.glb')} // Update with your model path
        resources={[]} // Any additional textures/resources if needed
        position={[0, 0, -1]} // 1 meter in front of camera
        scale={[0.2, 0.2, 0.2]} // Adjust size
        type="GLB"
        dragType="FixedToWorld" // Allows dragging
        animation={{ name: 'rotate', run: true, loop: true }} // Auto rotate
        onLoadStart={() => console.log('Model loading...')}
        onLoadEnd={() => console.log('Model loaded!')}
        onError={(e) => console.log('Error loading model:', e)}
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
      return () => {};
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <ViroARSceneNavigator
        key={sceneKey} // Forces remount
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
