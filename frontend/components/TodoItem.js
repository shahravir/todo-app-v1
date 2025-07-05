import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/AppStyles';

export default function TodoItem({ item, onToggle, onDelete }) {
  return (
    <View style={styles.todoItem}>
      <TouchableOpacity onPress={() => onToggle(item.id)} style={styles.checkbox}>
        <Text style={{ color: item.done ? '#4caf50' : '#bbb', fontWeight: 'bold' }}>{item.done ? '✓' : ''}</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.todoText, item.done && styles.todoDone]}>{item.text}</Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
        <Text style={{ color: '#e53935', fontWeight: 'bold' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
} 