import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Keyboard, ActivityIndicator, useWindowDimensions, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import styles from './styles/AppStyles';
import TodoList from './components/TodoList';
import AddTodoModal from './components/AddTodoModal';
import Sidebar from './components/Sidebar';
import DrawerMenu from './components/DrawerMenu';
import Fab from './components/Fab';
import { fetchTodos, addTodo as apiAddTodo, updateTodo as apiUpdateTodo, deleteTodo as apiDeleteTodo } from './api/api';

const STORAGE_KEY = 'TODOS';
const API_URL = 'http://localhost:3000';
const SIDEBAR_WIDTH = 260;
const BREAKPOINT = 900;

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= BREAKPOINT;

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

  async function fetchAndSyncTodos() {
    try {
      const data = await fetchTodos();
      setTodos(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) setTodos(JSON.parse(json));
      else setTodos([]);
    }
    setLoading(false);
  }

  async function handleAddTodo() {
    if (!input.trim()) return;
    const todo = {
      text: input.trim(),
      done: false,
      id: Date.now().toString(),
    };
    setInput('');
    setModalVisible(false);
    Keyboard.dismiss();
    try {
      const newTodo = await apiAddTodo(todo);
      const newTodos = [newTodo, ...todos];
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:add', newTodo);
    } catch (e) {}
  }

  async function handleToggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const updated = { ...todo, done: !todo.done };
    try {
      const newTodo = await apiUpdateTodo(id, updated);
      const newTodos = todos.map(t => t.id === id ? newTodo : t);
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:update', newTodo);
    } catch (e) {}
  }

  async function handleDeleteTodo(id) {
    try {
      await apiDeleteTodo(id);
      const newTodos = todos.filter(t => t.id !== id);
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:delete', id);
    } catch (e) {}
  }

  // Socket handlers
  const handleRemoteAdd = async (todo) => {
    setTodos(prev => {
      if (prev.some(t => t.id === todo.id)) return prev;
      const newTodos = [todo, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      return newTodos;
    });
  };
  const handleRemoteUpdate = async (todo) => {
    setTodos(prev => {
      const newTodos = prev.map(t => t.id === todo.id ? todo : t);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      return newTodos;
    });
  };
  const handleRemoteDelete = async (id) => {
    setTodos(prev => {
      const newTodos = prev.filter(t => t.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      return newTodos;
    });
  };

  function handleDragEnd(newOrder) {
    setTodos(newOrder);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
    // Optionally: emit socket event for order sync
  }

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={{ marginTop: 20 }}>Loading...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.root}>
        {isLargeScreen && <Sidebar />}
        {!isLargeScreen && (
          <>
            <TouchableOpacity style={styles.burgerBtn} onPress={() => setDrawerOpen(true)}>
              <View style={styles.burgerBar} />
              <View style={styles.burgerBar} />
              <View style={styles.burgerBar} />
            </TouchableOpacity>
            <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          </>
        )}
        <View style={[styles.container, isLargeScreen && { marginLeft: SIDEBAR_WIDTH }]}> 
          <Text style={styles.title}>Minimalist Todo</Text>
          <TodoList
            todos={todos}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            onDragEnd={handleDragEnd}
          />
          <Fab onPress={() => setModalVisible(true)} />
          <AddTodoModal
            visible={modalVisible}
            input={input}
            setInput={setInput}
            onAdd={handleAddTodo}
            onCancel={() => { setModalVisible(false); setInput(''); }}
            inputRef={inputRef}
          />
          <StatusBar style="auto" />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
