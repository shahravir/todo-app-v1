import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../styles/AppStyles';

export default function Fab({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.fabIcon}>＋</Text>
    </TouchableOpacity>
  );
} 