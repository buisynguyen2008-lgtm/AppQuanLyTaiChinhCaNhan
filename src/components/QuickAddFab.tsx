import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFinanceStore } from '../store';

// Base height used for TabBar in RootNavigator (62) + margin

export default function QuickAddFab() {
  const insets = useSafeAreaInsets();
  const openQuickAdd = useFinanceStore((s) => s.openQuickAdd);

  const bottomOffset = Math.max(insets.bottom, 8);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <TouchableOpacity
        onPress={openQuickAdd}
        activeOpacity={0.85}
        style={[styles.fab, { bottom: bottomOffset }]}
      >
        <Icon name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
});
