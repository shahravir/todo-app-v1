import React from 'react';
import { FlatList, Platform, View } from 'react-native';
import TodoItem from './TodoItem';
import styles from '../styles/AppStyles';

export default function TodoList({ todos, onToggle, onDelete, onRefresh, refreshing }) {
  return (
    <FlatList
      data={todos}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TodoItem item={item} onToggle={onToggle} onDelete={onDelete} />
      )}
      style={styles.list}
      contentContainerStyle={{ paddingBottom: 80 }}
      {...(Platform.OS !== 'web' ? { onRefresh, refreshing } : {})}
    />
  );
} 