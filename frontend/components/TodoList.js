import React from 'react';
import { View, Platform, FlatList, ScrollView } from 'react-native';
import { List, Divider } from 'react-native-paper';
import TodoItem from './TodoItem';
import styles from '../styles/AppStyles';

export default function TodoList({ todos, onToggle, onDelete, onRefresh, refreshing }) {
  return (
    <View style={{ flex: 1, minHeight: 0, backgroundColor: 'transparent' }}>
      <List.Section>
        {Platform.OS === 'web' ? (
          <ScrollView style={{ flex: 1, minHeight: 0, maxHeight: '100vh' }} showsVerticalScrollIndicator={true}>
            <View style={{ paddingBottom: 64 }}>
              {todos.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <TodoItem item={item} onToggle={onToggle} onDelete={onDelete} />
                  {idx < todos.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <TodoItem item={item} onToggle={onToggle} onDelete={onDelete} />}
            ItemSeparatorComponent={Divider}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={true}
          />
        )}
      </List.Section>
    </View>
  );
} 