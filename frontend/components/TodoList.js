import React from 'react';
import { View, Platform, FlatList, ScrollView } from 'react-native';
import { List, Divider } from 'react-native-paper';
import TodoItem from './TodoItem';
import styles from '../styles/AppStyles';

export default function TodoList({ todos, onToggle, onDelete, onRefresh, refreshing }) {
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
          />
        )}
      </List.Section>
    </View>
  );
} 