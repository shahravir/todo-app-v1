import React from 'react';
import { Modal, View } from 'react-native';
import { Drawer } from 'react-native-paper';

export default function DrawerMenu({ open, onClose }) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <View style={{ width: 260, backgroundColor: '#f3f3f3', height: '100%', borderRightWidth: 1, borderRightColor: '#e0e0e0', paddingTop: 60 }}>
          <Drawer.Section title="Menu">
            <Drawer.Item label="All Todos" active onPress={() => {}} />
            {/* Future: folders, labels, settings, etc. */}
          </Drawer.Section>
        </View>
      </View>
    </Modal>
  );
} 