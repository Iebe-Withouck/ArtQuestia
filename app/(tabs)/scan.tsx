import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  ViroARScene,
  ViroText,
  ViroARSceneNavigator,
} from '@reactvision/react-viro';
import { useFocusEffect } from '@react-navigation/native';

function HelloWorldAR() {
  return (
    <ViroARScene>
      <ViroText
        text="Hello World"
        scale={[0.2, 0.2, 0.2]}
        position={[0, 0, -1]}
        style={styles.helloText}
      />
    </ViroARScene>
  );
}

export default function Scan() {
  const [sceneKey, setSceneKey] = useState(0);

  // Recreate the AR scene each time the tab is focused
  useFocusEffect(
    useCallback(() => {
      setSceneKey(prev => prev + 1);
      return () => {};
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <ViroARSceneNavigator
        key={sceneKey}            // <-- Forces remount
        autofocus={true}
        initialScene={{ scene: HelloWorldAR }}
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
