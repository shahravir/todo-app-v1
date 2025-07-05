import React from 'react';
import { Modal, View } from 'react-native';
import { Drawer } from 'react-native-paper';

export default function DrawerMenu({ open, onClose, showCompleted, setShowCompleted, onAddTodo }) {
  const handleToggle = () => {
    setShowCompleted(!showCompleted);
    onClose();
  };
  const handleAddTodo = () => {
    onAddTodo();
    onClose();
  };
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <View style={{ width: 260, backgroundColor: '#f3f3f3', height: '100%', borderRightWidth: 1, borderRightColor: '#e0e0e0', paddingTop: 60 }}>
          <Drawer.Section title="Menu">
            <Drawer.Item
              label="Add Todo"
              icon="plus"
              onPress={handleAddTodo}
            />
            <Drawer.Item
              label={showCompleted ? 'Hide Completed' : 'Show Completed'}
              active={showCompleted}
              onPress={handleToggle}
              icon={showCompleted ? 'eye-off' : 'eye'}
            />
            {/* Future: folders, labels, settings, etc. */}
          </Drawer.Section>
        </View>
      </View>
    </Modal>
  );
} 