import React from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from '../styles/AppStyles';

export default function AddTodoModal({ visible, input, setInput, onAdd, onCancel, inputRef }) {
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