/**
 * SecuritySection
 * --------------------------------------
 * PIN flow with deferring enable:
 * - Toggling ON does not immediately set pinEnabled. We first show inputs.
 * - Only after Save (and successful validation) we commit { pinCode, pinEnabled: true }.
 * - Toggling OFF clears both pinEnabled and pinCode to avoid mismatches.
 */
import React from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFinanceStore } from '../../store';
import { useDebounce } from '../../hooks/useDebounce';

const SecuritySection: React.FC = () => {
  const settings = useFinanceStore((s) => s.settings);
  const updateSettings = useFinanceStore((s) => s.updateSettings);

  const [pinInput, setPinInput] = React.useState('');
  const [pinConfirm, setPinConfirm] = React.useState('');
  const [pinError, setPinError] = React.useState('');
  const debouncedPin = useDebounce(pinInput, 300);
  const debouncedConfirm = useDebounce(pinConfirm, 300);
  const [isEnabling, setIsEnabling] = React.useState(false);

  // Validate PIN when debounced value changes
  React.useEffect(() => {
    if (!settings.pinEnabled) {
      setPinError('');
      return;
    }
    if (debouncedPin.length === 0) {
      setPinError('');
      return;
    }
    if (debouncedPin.length < 4) {
      setPinError('PIN phải có ít nhất 4 chữ số');
      return;
    }
    if (debouncedPin.length > 6) {
      setPinError('PIN không được quá 6 chữ số');
      return;
    }
    if (debouncedConfirm && debouncedPin !== debouncedConfirm) {
      setPinError('PIN và xác nhận không khớp');
      return;
    }
    setPinError('');
  }, [debouncedPin, debouncedConfirm, settings.pinEnabled]);

  const handlePinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setPinInput(numericText);
    }
  };

  const handlePinSave = () => {
    const value = debouncedPin; // ensure stable value
    if (value.length < 4) {
      setPinError('PIN phải có ít nhất 4 chữ số');
      return;
    }
    if (value.length > 6) {
      setPinError('PIN không được quá 6 chữ số');
      return;
    }
    if (value !== debouncedConfirm) {
      setPinError('PIN và xác nhận không khớp');
      return;
    }
    updateSettings({ pinCode: value, pinEnabled: true });
    Alert.alert('Thành công', 'PIN đã được lưu');
    setPinInput('');
    setPinConfirm('');
    setIsEnabling(false);
  };

  const handleToggle = (v: boolean) => {
    if (!v) {
      // Tắt PIN thì xoá mã PIN để tránh so khớp sai
      updateSettings({ pinEnabled: false, pinCode: '' });
      setPinInput('');
      setPinConfirm('');
      setPinError('');
      setIsEnabling(false);
    } else {
      // Chưa bật ngay để tránh bất kỳ modal khóa nào xuất hiện trước khi người dùng lưu PIN
      setIsEnabling(true);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bảo mật</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="lock" size={24} color="#666" />
          <Text style={styles.settingLabel}>Khóa PIN</Text>
        </View>
        <Switch
          value={settings.pinEnabled || isEnabling}
          onValueChange={handleToggle}
          trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
          thumbColor={settings.pinEnabled ? 'white' : '#f4f3f4'}
        />
      </View>

      {(settings.pinEnabled || isEnabling) && (
        <View style={styles.pinSection}>
          <View style={styles.pinInputContainer}>
            <TextInput 
              style={[styles.pinInput, pinError && styles.pinInputError]} 
              placeholder="Nhập PIN (4-6 chữ số)" 
              keyboardType="numeric" 
              value={pinInput} 
              onChangeText={handlePinChange}
              secureTextEntry
              maxLength={6}
            />
            <TextInput 
              style={[styles.pinInput, pinError && styles.pinInputError]} 
              placeholder="Xác nhận PIN" 
              keyboardType="numeric" 
              value={pinConfirm} 
              onChangeText={(t) => setPinConfirm(t.replace(/[^0-9]/g, '').slice(0,6))}
              secureTextEntry
              maxLength={6}
            />
            <TouchableOpacity style={styles.pinSaveButton} onPress={handlePinSave}>
              <Icon name="check" size={20} color="white" />
            </TouchableOpacity>
          </View>
          {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
        </View>
      )}

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="fingerprint" size={24} color="#666" />
          <Text style={styles.settingLabel}>Sinh trắc học</Text>
        </View>
        <Text style={styles.comingSoonText}>Sẽ hỗ trợ sau</Text>
      </View>
    </View>
  );
};

export default React.memo(SecuritySection);

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
  pinSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pinInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  pinInputError: {
    borderColor: '#F44336',
    backgroundColor: '#ffebee',
  },
  pinSaveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});