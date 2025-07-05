import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/AppStyles';

export default function DrawerMenu({ open, onClose }) {
  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.drawerOverlay} onPress={onClose}>
        <Pressable style={styles.drawerContent} onPress={e => e.stopPropagation()}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>All Todos</Text>
            </TouchableOpacity>
            {/* Future: folders, labels, settings, etc. */}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
} 