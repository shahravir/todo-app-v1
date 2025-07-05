import React, { useState, useRef } from 'react';
import { View, Platform, FlatList, ScrollView, TextInput as RNTextInput } from 'react-native';
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

export default function TodoList({ todos, onToggle, onDelete, onRefresh, refreshing, onInlineAdd }) {
  const [inlineInput, setInlineInput] = useState('');
  const inputRef = useRef(null);

  const handleInlineAdd = () => {
    const parsed = parseInput(inlineInput);
    if (parsed.cleanText.trim()) {
      onInlineAdd(parsed);
      setInlineInput('');
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
                    <TodoItem item={item} onToggle={onToggle} onDelete={onDelete} />
                  </View>
                  {idx < todos.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {/* Inline add row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#fafafa', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#eee' }}>
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
            </View>
          </ScrollView>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 10 }}>
                <TodoItem item={item} onToggle={onToggle} onDelete={onDelete} />
              </View>
            )}
            ItemSeparatorComponent={Divider}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={true}
            ListFooterComponent={
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#fafafa', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#eee' }}>
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
            }
          />
        )}
      </List.Section>
    </View>
  );
} 