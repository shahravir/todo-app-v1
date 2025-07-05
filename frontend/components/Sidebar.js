import React from 'react';
import { View } from 'react-native';
import { Drawer } from 'react-native-paper';

export default function Sidebar({ showCompleted, setShowCompleted }) {
  return (
    <View style={{ width: 260, backgroundColor: '#f3f3f3', height: '100%', borderRightWidth: 1, borderRightColor: '#e0e0e0', paddingTop: 60 }}>
      <Drawer.Section title="Menu">
        <Drawer.Item
          label={showCompleted ? 'Hide Completed' : 'Show Completed'}
          active={showCompleted}
          onPress={() => setShowCompleted(!showCompleted)}
          icon={showCompleted ? 'eye-off' : 'eye'}
        />
        {/* Future: folders, labels, settings, etc. */}
      </Drawer.Section>
    </View>
  );
} 