import React from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import styles from '../styles/AppStyles';

export default function AddTodoModal({ visible, input, setInput, description, setDescription, dueDate, setDueDate, priority, setPriority, tags, setTags, onAdd, onCancel, inputRef }) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Add Todo</Text>
          <TextInput
            ref={inputRef}
            style={styles.modalInput}
            placeholder="What do you need to do?"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={onAdd}
            returnKeyType="done"
            autoFocus
            multiline
            maxLength={200}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Due Date (YYYY-MM-DD, optional)"
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'}
            maxLength={10}
          />
          <View style={{ width: '100%', marginBottom: 16 }}>
            <Text style={{ marginBottom: 6, color: '#222', fontWeight: '500' }}>Priority</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {['low', 'medium', 'high'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.modalBtn, { backgroundColor: priority === p ? '#4caf50' : '#eee', flex: 1, marginLeft: p === 'low' ? 0 : 8 }]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.modalBtnText, { color: priority === p ? '#fff' : '#222' }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Tags (comma separated, optional)"
            value={tags}
            onChangeText={setTags}
            maxLength={100}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#bbb' }]} onPress={onCancel}>
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={onAdd}>
              <Text style={styles.modalBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
} 