// app/camera.tsx
import 'react-native-worklets-core';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import CameraComponent from './components/Camera';

export default function CameraPage() {
  return (
    <View style={styles.container}>
      <CameraComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
