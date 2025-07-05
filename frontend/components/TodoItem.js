import React, { useState, useRef } from 'react';
import { View, Platform, TouchableOpacity } from 'react-native';
import { Checkbox, Text, TextInput } from 'react-native-paper';
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

// Simple natural language parsing helpers (same as AddTodoModal)
const PRIORITY_WORDS = ['high', 'medium', 'low'];
const PRIORITY_MAP = { high: 'high', medium: 'medium', low: 'low' };
const TAG_REGEX = /#(\w+)/g;
const DATE_WORDS = [
  { word: 'today', getDate: () => new Date() },
  { word: 'tomorrow', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
];
function parseInput(text) {
  let priority = null;
  for (const word of PRIORITY_WORDS) {
    if (text.toLowerCase().includes(word)) {
      priority = PRIORITY_MAP[word];
      break;
    }
  }
  const tags = [];
  let tagMatch;
  while ((tagMatch = TAG_REGEX.exec(text))) {
    tags.push(tagMatch[1]);
  }
  let dueDate = null;
  for (const { word, getDate } of DATE_WORDS) {
    if (text.toLowerCase().includes(word)) {
      dueDate = getDate();
      break;
    }
  }
  const dateRegex = /(\d{1,2})\s+([A-Za-z]+)|([A-Za-z]+)\s+(\d{1,2})/;
  const dateMatch = text.match(dateRegex);
  if (!dueDate && dateMatch) {
    let day, monthStr;
    if (dateMatch[1] && dateMatch[2]) {
      day = parseInt(dateMatch[1], 10);
      monthStr = dateMatch[2];
    } else if (dateMatch[3] && dateMatch[4]) {
      day = parseInt(dateMatch[4], 10);
      monthStr = dateMatch[3];
    }
    if (day && monthStr) {
      const month = new Date(`${monthStr} 1, 2000`).getMonth();
      if (!isNaN(month)) {
        const now = new Date();
        dueDate = new Date(now.getFullYear(), month, day);
      }
    }
  }
  let cleanText = text
    .replace(TAG_REGEX, '')
    .replace(/\b(today|tomorrow)\b/gi, '')
    .replace(/\b(high|medium|low)\b/gi, '')
    .replace(dateRegex, '')
    .replace(/\s+/g, ' ')
    .trim();
  return { cleanText, priority, tags, dueDate };
}

export default function TodoItem({ item, onToggle, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.text);
  const inputRef = useRef(null);
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

  const handleEditStart = () => {
    if (!item.done) {
      setEditValue(item.text);
      setEditing(true);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
    }
  };
  const handleEditEnd = () => {
    setEditing(false);
    if (editValue.trim() && editValue.trim() !== item.text) {
      const parsed = parseInput(editValue);
      onEdit(item.id, parsed);
    }
  };

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
        {editing ? (
          <TextInput
            ref={inputRef}
            value={editValue}
            onChangeText={setEditValue}
            onBlur={handleEditEnd}
            style={{ fontSize: 20, fontWeight: 'regular', color: '#222', backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 6, marginVertical: 0, height: 36 }}
            autoFocus
            underlineColor="transparent"
            dense
            onSubmitEditing={handleEditEnd}
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity onPress={handleEditStart} activeOpacity={0.7}>
            <Text style={{ fontSize: 20, fontWeight: 'regular', textDecorationLine: item.done ? 'line-through' : 'none', color: item.done ? '#bbb' : '#222' }}>
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
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