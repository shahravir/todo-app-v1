import React from 'react';
import { View } from 'react-native';
import { Drawer } from 'react-native-paper';

export default function Sidebar() {
  return (
    <View style={{ width: 260, backgroundColor: '#f3f3f3', height: '100%', borderRightWidth: 1, borderRightColor: '#e0e0e0', paddingTop: 60 }}>
      <Drawer.Section title="Menu">
        <Drawer.Item label="All Todos" active onPress={() => {}} />
        {/* Future: folders, labels, settings, etc. */}
      </Drawer.Section>
    </View>
  );
} 