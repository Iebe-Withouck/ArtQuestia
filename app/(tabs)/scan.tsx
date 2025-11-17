import { useFocusEffect } from '@react-navigation/native';
import {
  ViroAnimations,
  ViroARScene,
  ViroARSceneNavigator,
  ViroText
} from '@reactvision/react-viro';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// Register a rotation animation
ViroAnimations.registerAnimations({
  rotate: {
    properties: { rotateY: '+=90' }, // Rotate 90 degrees
    duration: 1000, // Duration of each step in ms
  },
  // Note: combine/child animations aren't typed in our Viro typings.
  // We'll rely on running the single 'rotate' animation with `loop: true`.
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
