import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/layout/AppHeader';
import AppSettingsSection from './AppSettingsSection';
import SecuritySection from './SecuritySection';
import DataManagementSection from './DataManagementSection';
import CategoryManagementSection from './CategoryManagementSection';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppHeader title="Cài đặt" elevated />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <AppSettingsSection />
        <SecuritySection />
        <DataManagementSection />
        <CategoryManagementSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  header: {
    display: 'none',
  },
  title: { display: 'none' },
});
