import React from 'react';
import { FAB } from 'react-native-paper';
import { Platform } from 'react-native';

export default function FloatingActionButton({ onPress }) {
  return (
    <FAB
      icon="plus"
      onPress={onPress}
      style={{ position: Platform.OS === 'web' ? 'fixed' : 'absolute', right: 32, bottom: 40, zIndex: 10 }}
      color="#fff"
    />
  );
} 