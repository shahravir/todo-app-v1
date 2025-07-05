import React from 'react';
import { View } from 'react-native';
import { Checkbox, IconButton, Chip, Text } from 'react-native-paper';

export default function TodoItem({ item, onToggle, onDelete }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 8, paddingHorizontal: 4 }}>
      <Checkbox
        status={item.done ? 'checked' : 'unchecked'}
        onPress={() => onToggle(item.id)}
        color="#4caf50"
        style={{ marginRight: 8 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', textDecorationLine: item.done ? 'line-through' : 'none', color: item.done ? '#bbb' : '#222' }}>
          {item.text}
        </Text>
        {item.description ? (
          <Text style={{ color: '#666', fontSize: 14, marginTop: 2 }}>{item.description}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
          {item.dueDate && (
            <Chip
              icon="calendar"
              style={{ marginRight: 6, marginBottom: 2, backgroundColor: '#f5f5f5', height: 26 }}
              textStyle={{ fontSize: 12, color: '#888', fontWeight: '400' }}
            >
              {`Due: ${new Date(item.dueDate).toLocaleDateString()}`}
            </Chip>
          )}
          {item.priority && (
            <Chip
              icon="alert"
              style={{ marginRight: 6, marginBottom: 2, backgroundColor: '#f5f5f5', height: 26 }}
              textStyle={{ fontSize: 12, color: '#888', fontWeight: '400' }}
            >
              {`Priority: ${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}`}
            </Chip>
          )}
          {item.tags && item.tags.length > 0 && (
            <Chip
              icon="label"
              style={{ marginBottom: 2, backgroundColor: '#f5f5f5', height: 26 }}
              textStyle={{ fontSize: 12, color: '#888', fontWeight: '400' }}
            >
              {`Tags: ${item.tags.join(', ')}`}
            </Chip>
          )}
        </View>
      </View>
      <IconButton icon="delete" color="#e53935" onPress={() => onDelete(item.id)} style={{ marginLeft: 8 }} />
    </View>
  );
} 