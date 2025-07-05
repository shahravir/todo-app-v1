import React, { useState, useRef } from 'react';
import { View, Platform, FlatList, ScrollView, TextInput as RNTextInput, TouchableWithoutFeedback, StyleSheet, Dimensions } from 'react-native';
import { List, Divider, IconButton, Text, TextInput } from 'react-native-paper';
import TodoItem from './TodoItem';
import styles from '../styles/AppStyles';

// Simple natural language parsing helpers (same as AddTodoModal)
const PRIORITY_WORDS = ['high', 'medium', 'low'];
const PRIORITY_MAP = { high: 'high', medium: 'medium', low: 'low' };
const TAG_REGEX = /#(\w+)/g;
const DATE_WORDS = [
  { word: 'today', getDate: () => new Date() },
  { word: 'tomorrow', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
  { word: 'next week', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
  { word: 'next month', getDate: () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; } },
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
  // 1. Check for relative words
  for (const { word, getDate } of DATE_WORDS) {
    if (text.toLowerCase().includes(word)) {
      dueDate = getDate();
      break;
    }
  }
  // 2. Check for ISO or US/EU date formats (2024-07-01, 1/7, 7/1, 1-7, 7-1, 1 July, July 1)
  if (!dueDate) {
    // ISO yyyy-mm-dd
    const isoMatch = text.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      dueDate = new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  if (!dueDate) {
    // dd/mm or mm/dd or dd-mm or mm-dd
    const slashMatch = text.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/);
    if (slashMatch) {
      let [, a, b, c] = slashMatch;
      let year = new Date().getFullYear();
      let month, day;
      if (c) year = Number(c.length === 2 ? '20' + c : c);
      // Try both dd/mm and mm/dd, prefer future date
      const d1 = new Date(year, Number(b) - 1, Number(a));
      const d2 = new Date(year, Number(a) - 1, Number(b));
      const now = new Date();
      if (d1 >= now) dueDate = d1; else if (d2 >= now) dueDate = d2;
    }
  }
  if (!dueDate) {
    // 1 July, July 1
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthRegex = new RegExp(`(\\d{1,2})\\s+(${monthNames.join('|')})`, 'i');
    const monthMatch = text.match(monthRegex);
    if (monthMatch) {
      const day = parseInt(monthMatch[1], 10);
      const month = monthNames.findIndex(m => m === monthMatch[2].toLowerCase());
      if (month !== -1) {
        const now = new Date();
        dueDate = new Date(now.getFullYear(), month, day);
      }
    }
    const monthRegex2 = new RegExp(`(${monthNames.join('|')})\\s+(\\d{1,2})`, 'i');
    const monthMatch2 = text.match(monthRegex2);
    if (monthMatch2) {
      const month = monthNames.findIndex(m => m === monthMatch2[1].toLowerCase());
      const day = parseInt(monthMatch2[2], 10);
      if (month !== -1) {
        const now = new Date();
        dueDate = new Date(now.getFullYear(), month, day);
      }
    }
  }
  let cleanText = text
    .replace(TAG_REGEX, '')
    .replace(/\b(today|tomorrow|next week|next month)\b/gi, '')
    .replace(/\b(high|medium|low)\b/gi, '')
    .replace(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/, '')
    .replace(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/, '')
    .replace(/(\d{1,2})\s+([A-Za-z]+)/, '')
    .replace(/([A-Za-z]+)\s+(\d{1,2})/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return { cleanText, priority, tags, dueDate };
}

// Overlay to close inline input if user clicks/taps outside
const Overlay = ({ onPress }) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={stylesOverlay.overlay} pointerEvents="auto" />
  </TouchableWithoutFeedback>
);

const stylesOverlay = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});

export default function TodoList({ todos, onToggle, onDelete, onRefresh, refreshing, onInlineAdd, onEdit }) {
  const [inlineInput, setInlineInput] = useState('');
  const inputRef = useRef(null);
  const [showInlineInput, setShowInlineInput] = useState(false);

  const handleInlineAdd = () => {
    const parsed = parseInput(inlineInput);
    if (parsed.cleanText.trim()) {
      onInlineAdd(parsed);
      setInlineInput('');
      setShowInlineInput(false);
      if (inputRef.current) inputRef.current.blur();
    }
  };

  return (
    <View style={{ flex: 1, minHeight: 0, backgroundColor: 'transparent', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
      <List.Section>
        {Platform.OS === 'web' ? (
          <ScrollView style={{ flex: 1, minHeight: 0, maxHeight: '100vh' }} showsVerticalScrollIndicator={true}>
            <View style={{ paddingBottom: 64 }}>
              {todos.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <View style={{ marginBottom: 10 }}>
                    <TodoItem
                      item={item}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  </View>
                  {idx < todos.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {/* Inline add row toggle */}
              {showInlineInput ? (
                <>
                  <Overlay onPress={() => setShowInlineInput(false)} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#fafafa', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#eee', zIndex: 20 }}>
                    <TextInput
                      ref={inputRef}
                      value={inlineInput}
                      onChangeText={setInlineInput}
                      placeholder="Add a task (e.g., 'Buy milk tomorrow high #groceries')"
                      style={{ flex: 1, backgroundColor: 'transparent', fontSize: 16 }}
                      onSubmitEditing={handleInlineAdd}
                      blurOnSubmit={true}
                      returnKeyType="done"
                    />
                    <IconButton icon="plus" color="#4caf50" size={28} onPress={handleInlineAdd} style={{ marginLeft: 2 }} />
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'flex-start', marginTop: 10 }}>
                  <IconButton icon="plus" color="#4caf50" size={28} onPress={() => setShowInlineInput(true)} style={{ marginLeft: 0 }} />
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 10 }}>
                <TodoItem
                  item={item}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </View>
            )}
            ItemSeparatorComponent={Divider}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={true}
            ListFooterComponent={
              showInlineInput ? (
                <>
                  <Overlay onPress={() => setShowInlineInput(false)} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#fafafa', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#eee', zIndex: 20 }}>
                    <TextInput
                      ref={inputRef}
                      value={inlineInput}
                      onChangeText={setInlineInput}
                      placeholder="Add a task (e.g., 'Buy milk tomorrow high #groceries')"
                      style={{ flex: 1, backgroundColor: 'transparent', fontSize: 16 }}
                      onSubmitEditing={handleInlineAdd}
                      blurOnSubmit={true}
                      returnKeyType="done"
                    />
                    <IconButton icon="plus" color="#4caf50" size={28} onPress={handleInlineAdd} style={{ marginLeft: 2 }} />
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'flex-start', marginTop: 10 }}>
                  <IconButton icon="plus" color="#4caf50" size={28} onPress={() => setShowInlineInput(true)} style={{ marginLeft: 0 }} />
                </View>
              )
            }
          />
        )}
      </List.Section>
    </View>
  );
} 