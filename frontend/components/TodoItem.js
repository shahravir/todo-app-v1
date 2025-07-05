import React from 'react';
import { View, Platform, TouchableOpacity } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PRIORITY_COLORS = {
  high: '#e53935', // red
  medium: '#ffb300', // amber
  low: '#43a047', // green
};

function formatDueDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'short' });
  return `${day} ${month}`;
}

export default function TodoItem({ item, onToggle }) {
  const checkboxColor = PRIORITY_COLORS[item.priority] || '#bbb';

  const checkbox = (
    <Checkbox
      status={item.done ? 'checked' : 'unchecked'}
      onPress={() => onToggle(item.id)}
      color={checkboxColor}
      uncheckedColor={checkboxColor}
      style={{ marginRight: 8, backgroundColor: 'transparent' }}
    />
  );

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 8, paddingHorizontal: 4 }}>
      {Platform.OS === 'web' ? (
        checkbox
      ) : (
        <TouchableOpacity onPress={() => onToggle(item.id)} activeOpacity={0.7} style={{ marginRight: 8 }}>
          <MaterialCommunityIcons
            name={item.done ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={28}
            color={checkboxColor}
          />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: 'regular', textDecorationLine: item.done ? 'line-through' : 'none', color: item.done ? '#bbb' : '#222' }}>
          {item.text}
        </Text>
        {item.description ? (
          <Text style={{ color: '#666', fontSize: 14, marginTop: 2 }}>{item.description}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2, alignItems: 'center' }}>
          {item.dueDate && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 2 }}>
              <MaterialCommunityIcons name="calendar" size={16} color="#b39ddb" style={{ marginRight: 3 }} />
              <Text style={{ fontSize: 13, color: '#5e35b1', fontWeight: '500' }}>{formatDueDate(item.dueDate)}</Text>
            </View>
          )}
          {item.tags && item.tags.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <MaterialCommunityIcons name="label" size={16} color="#888" style={{ marginRight: 3 }} />
              <Text style={{ fontSize: 12, color: '#888', fontWeight: '400' }}>{`Tags: ${item.tags.join(', ')}`}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
} 