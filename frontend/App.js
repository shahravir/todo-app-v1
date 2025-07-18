import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Keyboard, ActivityIndicator, useWindowDimensions, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import styles from './styles/AppStyles';
import TodoList from './components/TodoList';
import AddTodoModal from './components/AddTodoModal';
import Sidebar from './components/Sidebar';
import DrawerMenu from './components/DrawerMenu';
import FloatingActionButton from './components/Fab';
import { fetchTodos, addTodo as apiAddTodo, updateTodo as apiUpdateTodo, deleteTodo as apiDeleteTodo, pingBackend } from './api/api';
import { addToQueue, processQueue } from './api/offlineQueue';
import NetInfo from '@react-native-community/netinfo';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

const STORAGE_KEY = 'TODOS';
const API_URL = 'http://localhost:3000';
const SIDEBAR_WIDTH = 260;
const BREAKPOINT = 900;

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4caf50',
    accent: '#1976d2',
    background: '#fafafa',
    surface: '#fff',
    error: '#e53935',
    text: '#222',
    placeholder: '#bbb',
  },
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= BREAKPOINT;
  const [isOnline, setIsOnline] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetchAndSyncTodos();
    socketRef.current = io(API_URL);
    socketRef.current.on('todo:add', handleRemoteAdd);
    socketRef.current.on('todo:update', handleRemoteUpdate);
    socketRef.current.on('todo:delete', handleRemoteDelete);
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false);
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (modalVisible && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [modalVisible]);

  // Periodically check backend availability
  useEffect(() => {
    let interval;
    const check = async () => {
      const ok = await pingBackend();
      setIsBackendAvailable(ok);
    };
    check();
    interval = setInterval(check, 5000); // check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchAndSyncTodos() {
    try {
      const data = await fetchTodos();
      setTodos(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to fetch todos:', e);
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) setTodos(JSON.parse(json));
    }
    setLoading(false);
  }

  async function handleAddTodo(parsed) {
    if (!parsed.cleanText.trim()) return;
    const todo = {
      text: parsed.cleanText.trim(),
      description: '',
      done: false,
      id: Date.now().toString(),
      dueDate: parsed.dueDate || null,
      priority: parsed.priority || 'medium',
      tags: parsed.tags || [],
    };
    setInput('');
    setModalVisible(false);
    Keyboard.dismiss();
    if (!isOnline || !isBackendAvailable) {
      setTodos([todo, ...todos]);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([todo, ...todos]));
      await addToQueue({ type: 'add', todo });
      return;
    }
    try {
      const newTodo = await apiAddTodo(todo);
      const newTodos = [newTodo, ...todos];
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:add', newTodo);
    } catch (e) {
      console.error('Failed to add todo:', e);
    }
  }

  async function handleToggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const updated = { ...todo, done: !todo.done };
    if (!isOnline || !isBackendAvailable) {
      const newTodos = todos.map(t => t.id === id ? updated : t);
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      await addToQueue({ type: 'update', todo: updated });
      return;
    }
    try {
      const newTodo = await apiUpdateTodo(id, updated);
      const newTodos = todos.map(t => t.id === id ? newTodo : t);
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:update', newTodo);
    } catch (e) {
      console.error('Failed to update todo:', e);
    }
  }

  async function handleDeleteTodo(id) {
    if (!isOnline || !isBackendAvailable) {
      const newTodos = todos.filter(t => t.id !== id);
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      await addToQueue({ type: 'delete', id });
      return;
    }
    try {
      await apiDeleteTodo(id);
      const newTodos = todos.filter(t => t.id !== id);
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:delete', id);
    } catch (e) {
      console.error('Failed to delete todo:', e);
    }
  }

  async function handleEditTodo(id, parsed) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const updated = {
      ...todo,
      text: parsed.cleanText || todo.text,
      dueDate: parsed.dueDate !== undefined ? parsed.dueDate : todo.dueDate,
      priority: parsed.priority || todo.priority,
      tags: parsed.tags || todo.tags,
    };
    setTodos(todos.map(t => t.id === id ? updated : t));
    if (!isOnline || !isBackendAvailable) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos.map(t => t.id === id ? updated : t)));
      await addToQueue({ type: 'update', todo: updated });
      return;
    }
    try {
      const newTodo = await apiUpdateTodo(id, updated);
      const newTodos = todos.map(t => t.id === id ? newTodo : t);
      setTodos(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      socketRef.current.emit('todo:update', newTodo);
    } catch (e) {
      console.error('Failed to update todo:', e);
    }
  }

  // Sync offline queue when coming back online or backend becomes available
  useEffect(() => {
    if (!isOnline || !isBackendAvailable) return;
    (async () => {
      await processQueue(async (action) => {
        if (action.type === 'add') {
          try {
            const newTodo = await apiAddTodo(action.todo);
            setTodos(prev => {
              // Replace local todo with server todo if id matches
              const filtered = prev.filter(t => t.id !== action.todo.id);
              return [newTodo, ...filtered];
            });
            socketRef.current.emit('todo:add', newTodo);
          } catch (e) { console.error('Failed to sync add:', e); }
        } else if (action.type === 'update') {
          try {
            const newTodo = await apiUpdateTodo(action.todo.id, action.todo);
            setTodos(prev => prev.map(t => t.id === newTodo.id ? newTodo : t));
            socketRef.current.emit('todo:update', newTodo);
          } catch (e) { console.error('Failed to sync update:', e); }
        } else if (action.type === 'delete') {
          try {
            await apiDeleteTodo(action.id);
            setTodos(prev => prev.filter(t => t.id !== action.id));
            socketRef.current.emit('todo:delete', action.id);
          } catch (e) { console.error('Failed to sync delete:', e); }
        }
      });
      // After processing, update local storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    })();
    // eslint-disable-next-line
  }, [isOnline, isBackendAvailable]);

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

  // Pull-to-refresh handler for mobile
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAndSyncTodos();
    setRefreshing(false);
  };

  // Filter todos based on search query
  const filteredTodos = todos.filter(todo => {
    if (!showCompleted && todo.done) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      todo.text.toLowerCase().includes(q) ||
      (todo.description && todo.description.toLowerCase().includes(q)) ||
      (todo.tags && todo.tags.join(',').toLowerCase().includes(q)) ||
      (todo.priority && todo.priority.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={{ marginTop: 20 }}>Loading...</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.root, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        {(!isOnline || !isBackendAvailable) && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: '#ff9800',
            paddingVertical: 10,
            paddingHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>
              Backend unavailable. You are working offline. Changes will sync when backend is back.
            </Text>
          </View>
        )}
        {isLargeScreen && (
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH, zIndex: 10 }}>
            <Sidebar showCompleted={showCompleted} setShowCompleted={setShowCompleted} onAddTodo={() => setModalVisible(true)} />
          </View>
        )}
        {!isLargeScreen && (
          <>
            <TouchableOpacity style={styles.burgerBtn} onPress={() => setDrawerOpen(true)}>
              <View style={styles.burgerBar} />
              <View style={styles.burgerBar} />
              <View style={styles.burgerBar} />
            </TouchableOpacity>
            <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} showCompleted={showCompleted} setShowCompleted={setShowCompleted} onAddTodo={() => { setDrawerOpen(false); setModalVisible(true); }} />
          </>
        )}
        <View style={{ flex: 1, paddingTop: 0, paddingHorizontal: 0, minHeight: 0, ...(isLargeScreen ? { marginLeft: SIDEBAR_WIDTH } : {}) }}> 
          <TextInput
            style={{
              width: '100%',
              minHeight: 44,
              fontSize: 18,
              borderColor: '#eee',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginBottom: 8,
              backgroundColor: '#fafafa',
              color: '#222',
            }}
            placeholder="Search todos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <View style={{ flex: 1 }}>
            <TodoList
              todos={filteredTodos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              onInlineAdd={handleAddTodo}
              onEdit={handleEditTodo}
            />
          </View>
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
    </PaperProvider>
  );
}
