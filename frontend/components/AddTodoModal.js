import React from 'react';
import { View, Platform } from 'react-native';
import { Dialog, Portal, TextInput, Button, SegmentedButtons } from 'react-native-paper';

export default function AddTodoModal({ visible, input, setInput, description, setDescription, dueDate, setDueDate, priority, setPriority, tags, setTags, onAdd, onCancel, inputRef }) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel} style={{ borderRadius: 16 }}>
        <Dialog.Title>Add Todo</Dialog.Title>
        <Dialog.Content>
          <TextInput
            ref={inputRef}
            label="What do you need to do?"
            value={input}
            onChangeText={setInput}
            autoFocus
            multiline
            maxLength={200}
            style={{ marginBottom: 12 }}
          />
          <TextInput
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
            style={{ marginBottom: 12 }}
          />
          <TextInput
            label="Due Date (YYYY-MM-DD, optional)"
            value={dueDate}
            onChangeText={setDueDate}
            maxLength={10}
            style={{ marginBottom: 12 }}
          />
          <SegmentedButtons
            value={priority}
            onValueChange={setPriority}
            buttons={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            style={{ marginBottom: 12 }}
          />
          <TextInput
            label="Tags (comma separated, optional)"
            value={tags}
            onChangeText={setTags}
            maxLength={100}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel} textColor="#bbb">Cancel</Button>
          <Button onPress={onAdd} mode="contained">Add</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
} 