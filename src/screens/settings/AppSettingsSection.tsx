import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFinanceStore } from '../../store';

const AppSettingsSection: React.FC = () => {
  const settings = useFinanceStore((s) => s.settings);
  const updateSettings = useFinanceStore((s) => s.updateSettings);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cài đặt ứng dụng</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="theme-light-dark" size={24} color="#666" />
          <Text style={styles.settingLabel}>Chủ đề tối</Text>
        </View>
        <Switch
          value={settings.theme === 'dark'}
          onValueChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })}
          trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
          thumbColor={settings.theme === 'dark' ? 'white' : '#f4f3f4'}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="currency-usd" size={24} color="#666" />
          <Text style={styles.settingLabel}>Đơn vị tiền tệ</Text>
        </View>
        <View style={styles.currencyButtons}>
          <TouchableOpacity 
            style={[styles.currencyButton, settings.currency === 'VND' && styles.currencyButtonActive]} 
            onPress={() => updateSettings({ currency: 'VND' })}
          >
            <Text style={[styles.currencyButtonText, settings.currency === 'VND' && styles.currencyButtonTextActive]}>VND</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.currencyButton, settings.currency === 'USD' && styles.currencyButtonActive]} 
            onPress={() => updateSettings({ currency: 'USD' })}
          >
            <Text style={[styles.currencyButtonText, settings.currency === 'USD' && styles.currencyButtonTextActive]}>USD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default React.memo(AppSettingsSection);

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currencyButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  currencyButtonTextActive: {
    color: 'white',
  },
});