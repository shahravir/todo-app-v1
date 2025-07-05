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
        {item.description ? (
          <Text style={{ color: '#666', fontSize: 14, marginTop: 2 }}>{item.description}</Text>
        ) : null}
        {(item.dueDate || item.priority || (item.tags && item.tags.length > 0)) && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
            {item.dueDate && (
              <Text style={{ color: '#e53935', fontSize: 13, marginRight: 10 }}>
                Due: {new Date(item.dueDate).toLocaleDateString()}
              </Text>
            )}
            {item.priority && (
              <Text style={{ color: '#1976d2', fontSize: 13, marginRight: 10 }}>
                Priority: {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
              </Text>
            )}
            {item.tags && item.tags.length > 0 && (
              <Text style={{ color: '#388e3c', fontSize: 13 }}>
                Tags: {item.tags.join(', ')}
              </Text>
            )}
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
        <Text style={{ color: '#e53935', fontWeight: 'bold' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
} 