import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Dialog, Portal, TextInput, Button, Text } from 'react-native-paper';

// Simple natural language parsing helpers
const PRIORITY_WORDS = ['high', 'medium', 'low'];
const PRIORITY_MAP = { high: 'high', medium: 'medium', low: 'low' };
const TAG_REGEX = /#(\w+)/g;
const DATE_WORDS = [
  { word: 'today', getDate: () => new Date() },
  { word: 'tomorrow', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
];

function parseInput(text) {
  // Priority
  let priority = null;
  for (const word of PRIORITY_WORDS) {
    if (text.toLowerCase().includes(word)) {
      priority = PRIORITY_MAP[word];
      break;
    }
  }
  // Tags
  const tags = [];
  let tagMatch;
  while ((tagMatch = TAG_REGEX.exec(text))) {
    tags.push(tagMatch[1]);
  }
  // Date (simple)
  let dueDate = null;
  for (const { word, getDate } of DATE_WORDS) {
    if (text.toLowerCase().includes(word)) {
      dueDate = getDate();
      break;
    }
  }
  // Try to match a date in format '5 July' or 'July 5'
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
  // Remove parsed words from text for title/desc
  let cleanText = text
    .replace(TAG_REGEX, '')
    .replace(/\b(today|tomorrow)\b/gi, '')
    .replace(/\b(high|medium|low)\b/gi, '')
    .replace(dateRegex, '')
    .replace(/\s+/g, ' ')
    .trim();
  return { cleanText, priority, tags, dueDate };
}

export default function AddTodoModal({ visible, input, setInput, onAdd, onCancel, inputRef }) {
  const [parsed, setParsed] = useState({ cleanText: '', priority: null, tags: [], dueDate: null });

  useEffect(() => {
    setParsed(parseInput(input));
  }, [input]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel} style={{ borderRadius: 16 }}>
        <Dialog.Content>
          <TextInput
            ref={inputRef}
            label="What do you need to do? (e.g., 'Buy milk tomorrow high #groceries')"
            value={input}
            onChangeText={setInput}
            autoFocus
            multiline
            maxLength={300}
            style={{ marginBottom: 12, fontSize: 18 }}
          />
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 15, color: '#888' }}>Summary:</Text>
            <Text style={{ fontSize: 16, marginTop: 2 }}>
              <Text style={{ fontWeight: 'bold' }}>Task:</Text> {parsed.cleanText || '—'}
            </Text>
            <Text style={{ fontSize: 16, marginTop: 2 }}>
              <Text style={{ fontWeight: 'bold' }}>Priority:</Text> {parsed.priority ? parsed.priority.charAt(0).toUpperCase() + parsed.priority.slice(1) : '—'}
            </Text>
            <Text style={{ fontSize: 16, marginTop: 2 }}>
              <Text style={{ fontWeight: 'bold' }}>Due:</Text> {parsed.dueDate ? parsed.dueDate.toLocaleDateString() : '—'}
            </Text>
            <Text style={{ fontSize: 16, marginTop: 2 }}>
              <Text style={{ fontWeight: 'bold' }}>Tags:</Text> {parsed.tags.length > 0 ? parsed.tags.join(', ') : '—'}
            </Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button
              onPress={onCancel}
              mode="text"
              style={{ borderRadius: 8, paddingHorizontal: 18, paddingVertical: 6 }}
              labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#888' }}
            >
              Cancel
            </Button>
            <Button
              onPress={() => onAdd(parsed)}
              mode="contained"
              style={{ borderRadius: 8, backgroundColor: '#f4b6b6', paddingHorizontal: 18, paddingVertical: 6 }}
              labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}
            >
              Add task
            </Button>
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
} 