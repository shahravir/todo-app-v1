import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Keyboard, Platform, ActivityIndicator, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io } from 'socket.io-client';

const STORAGE_KEY = 'TODOS';
const API_URL = 'http://localhost:3000'; // Change to your backend URL if needed

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const socketRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchAndSyncTodos();
    socketRef.current = io(API_URL);
    socketRef.current.on('todo:add', handleRemoteAdd);
    socketRef.current.on('todo:update', handleRemoteUpdate);
    socketRef.current.on('todo:delete', handleRemoteDelete);
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (modalVisible && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [modalVisible]);

  const fetchAndSyncTodos = async () => {
    try {
      const res = await axios.get(`${API_URL}/todos`);
      setTodos(res.data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    } catch (e) {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) setTodos(JSON.parse(json));
      else setTodos([]);
    }
    setLoading(false);
  };

  // Add todo (text only)
  const addTodo = async () => {
    if (!input.trim()) return;
    const todo = {
      text: input.trim(),
      done: false,
      id: Date.now().toString(),
      // Future fields: priority, labels, folders, etc.
    };
    setInput('');
    setModalVisible(false);
    Keyboard.dismiss();
    try {
      const res = await axios.post(`${API_URL}/todos`, todo);
      const newTodos = [res.data, ...todos];
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:add', res.data);
    } catch (e) {}
  };

  // Update todo
  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const updated = { ...todo, done: !todo.done };
    try {
      const res = await axios.put(`${API_URL}/todos/${id}`, updated);
      const newTodos = todos.map(t => t.id === id ? res.data : t);
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:update', res.data);
    } catch (e) {}
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      const newTodos = todos.filter(t => t.id !== id);
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:delete', id);
    } catch (e) {}
  };

  // Handle remote add
  const handleRemoteAdd = async (todo) => {
    setTodos(prev => {
      if (prev.some(t => t.id === todo.id)) return prev;
      const newTodos = [todo, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      return newTodos;
    });
  };

  // Handle remote update
  const handleRemoteUpdate = async (todo) => {
    setTodos(prev => {
      const newTodos = prev.map(t => t.id === todo.id ? todo : t);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      return newTodos;
    });
  };

  // Handle remote delete
  const handleRemoteDelete = async (id) => {
    setTodos(prev => {
      const newTodos = prev.filter(t => t.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      return newTodos;
    });
  };

  // Render todo item
  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity onPress={() => toggleTodo(item.id)} style={styles.checkbox}>
        <Text style={{ color: item.done ? '#4caf50' : '#bbb', fontWeight: 'bold' }}>{item.done ? '✓' : ''}</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.todoText, item.done && styles.todoDone]}>{item.text}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteBtn}>
        <Text style={{ color: '#e53935', fontWeight: 'bold' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={{ marginTop: 20 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minimalist Todo</Text>
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
      {/* Add Todo Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Todo</Text>
            <TextInput
              ref={inputRef}
              style={styles.modalInput}
              placeholder="What do you need to do?"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={addTodo}
              returnKeyType="done"
              autoFocus
              multiline
              maxLength={200}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#bbb' }]} onPress={() => { setModalVisible(false); setInput(''); }}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={addTodo}>
                <Text style={styles.modalBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    color: '#222',
  },
  list: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  todoText: {
    fontSize: 16,
    color: '#222',
  },
  todoDone: {
    textDecorationLine: 'line-through',
    color: '#bbb',
  },
  deleteBtn: {
    marginLeft: 10,
    padding: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#4caf50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    minWidth: 320,
    maxWidth: 400,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#222',
  },
  modalInput: {
    width: '100%',
    minHeight: 60,
    maxHeight: 120,
    fontSize: 20,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: '#fafafa',
    color: '#222',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalBtn: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
