import { useFocusEffect } from '@react-navigation/native';
import {
  Viro3DObject,
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
} from '@reactvision/react-viro';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// AR Scene showing a 3D model
function ARModelScene() {
  const [rotation, setRotation] = useState([0, 0, 0]);

  // Continuously rotate the model
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRotation(([x, y, z]) => [x, y + 2, z]); // Rotate 2 degrees per frame on Y axis
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

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
        source={require('../../assets/3D-Models/model.glb')}
        resources={[]}
        position={[0, 0, -1]}
        scale={[0.5, 0.5, 0.5]}
        rotation={rotation}
        type="GLB"
        dragType="FixedToWorld"
        onLoadStart={() => console.log('Model loading...')}
        onLoadEnd={() => console.log('Model loaded!')}
        onError={(e) => console.error('Error loading model:', e)}
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
