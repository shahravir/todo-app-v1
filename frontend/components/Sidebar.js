import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/AppStyles';

export default function Sidebar() {
  return (
    <View style={styles.sidebar}>
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Menu</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>All Todos</Text>
        </TouchableOpacity>
        {/* Future: folders, labels, settings, etc. */}
      </View>
    </View>
  );
} 