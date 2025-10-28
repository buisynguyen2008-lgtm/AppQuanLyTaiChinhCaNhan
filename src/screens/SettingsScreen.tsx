import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFinanceStore } from '../store';
import { toCSV } from '../utils/csv';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDebounce } from '../hooks/useDebounce';
import Clipboard from '@react-native-clipboard/clipboard';

export default function SettingsScreen() {
  const nav = useNavigation();
  const settings = useFinanceStore((s) => s.settings);
  const updateSettings = useFinanceStore((s) => s.updateSettings);
  const transactions = useFinanceStore((s) => s.transactions);
  const [pin, setPin] = React.useState(settings.pinCode || '');
  const debouncedPin = useDebounce(pin, 300);
  const [pinError, setPinError] = React.useState('');

  const exportCSV = () => {
    const csv = toCSV(transactions);
    Alert.alert(
      'Xuất dữ liệu CSV',
      'Dữ liệu đã được chuẩn bị. Bạn có thể sao chép nội dung này để lưu vào file CSV.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Sao chép', onPress: () => {
            Clipboard.setString(csv);
            Alert.alert('Thành công', 'Dữ liệu đã được sao chép vào clipboard');
          }
        }
      ]
    );
  };

  React.useEffect(() => {
    if (debouncedPin.length > 0 && debouncedPin.length < 4) {
      setPinError('PIN phải có ít nhất 4 chữ số');
    } else if (debouncedPin.length > 6) {
      setPinError('PIN không được quá 6 chữ số');
    } else {
      setPinError('');
    }
  }, [debouncedPin]);

  const handlePinSave = () => {
    if (debouncedPin.length < 4) {
      setPinError('PIN phải có ít nhất 4 chữ số');
      return;
    }
    if (debouncedPin.length > 6) {
      setPinError('PIN không được quá 6 chữ số');
      return;
    }
    updateSettings({ pinCode: debouncedPin });
    setPinError('');
    Alert.alert('Thành công', 'PIN đã được lưu');
  };

  const handlePinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setPin(numericText);
      setPinError('');
    }
  };

  // Category manager local state
  const [catName, setCatName] = React.useState('');
  const [catType, setCatType] = React.useState<'income' | 'expense'>('expense');
  const [catColor, setCatColor] = React.useState('#888888');
  const [catIcon, setCatIcon] = React.useState('shape');

  const categories = useFinanceStore((s) => s.categories);
  const addCategory = useFinanceStore((s) => s.addCategory);
  const removeCategory = useFinanceStore((s) => s.removeCategory);

  const addNewCategory = () => {
    const name = catName.trim();
    if (!name) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Lỗi', 'Danh mục này đã tồn tại');
      return;
    }
    addCategory({ name, color: catColor, icon: catIcon, type: catType });
    setCatName('');
    Alert.alert('Thành công', 'Danh mục đã được thêm');
  };

  const predefinedColors = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#A66CFF', '#00C1D4', '#FF8FB1', '#9AA0A6'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cài đặt</Text>
      </View>

      {/* App Settings */}
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

      {/* Security Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bảo mật</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="lock" size={24} color="#666" />
            <Text style={styles.settingLabel}>Khóa PIN</Text>
          </View>
          <Switch
            value={settings.pinEnabled}
            onValueChange={(v) => updateSettings({ pinEnabled: v })}
            trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
            thumbColor={settings.pinEnabled ? 'white' : '#f4f3f4'}
          />
        </View>

        {settings.pinEnabled && (
          <View style={styles.pinSection}>
            <View style={styles.pinInputContainer}>
              <TextInput
                style={[styles.pinInput, pinError && styles.pinInputError]}
                placeholder="Nhập PIN (4-6 chữ số)"
                keyboardType="numeric"
                value={pin}
                onChangeText={handlePinChange}
                secureTextEntry
                maxLength={6}
              />
              <TouchableOpacity style={styles.pinSaveButton} onPress={handlePinSave}>
                <Icon name="check" size={20} color="white" />
              </TouchableOpacity>
            </View>
            {pinError && <Text style={styles.errorText}>{pinError}</Text>}
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

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quản lý dữ liệu</Text>

        <TouchableOpacity style={styles.exportButton} onPress={exportCSV}>
          <Icon name="download" size={24} color="#2196F3" />
          <Text style={styles.exportButtonText}>Xuất dữ liệu CSV</Text>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, styles.exportButtonSpacing]}
          onPress={() => (nav as any).navigate('Budget')}
        >
          <Icon name="wallet-outline" size={24} color="#2196F3" />
          <Text style={styles.exportButtonText}>Quản lý Ngân sách</Text>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, styles.exportButtonSpacing]}
          onPress={() => (nav as any).navigate('Goals')}
        >
          <Icon name="target-variant" size={24} color="#2196F3" />
          <Text style={styles.exportButtonText}>Quản lý Mục tiêu</Text>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Category Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quản lý danh mục</Text>

        <View style={styles.addCategoryContainer}>
          <TextInput
            style={styles.categoryInput}
            placeholder="Tên danh mục"
            value={catName}
            onChangeText={setCatName}
          />
          <TouchableOpacity
            style={[styles.typeToggleButton, catType === 'expense' && styles.typeToggleButtonActive]}
            onPress={() => setCatType(catType === 'expense' ? 'income' : 'expense')}
          >
            <Icon name={catType === 'expense' ? 'trending-down' : 'trending-up'} size={16} color={catType === 'expense' ? 'white' : '#666'} />
            <Text style={[styles.typeToggleText, catType === 'expense' && styles.typeToggleTextActive]}>
              {catType === 'expense' ? 'Chi' : 'Thu'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.colorPickerContainer}>
          <Text style={styles.colorPickerLabel}>Màu sắc:</Text>
          <View style={styles.colorPicker}>
            {predefinedColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }, catColor === color && styles.colorOptionSelected]}
                onPress={() => setCatColor(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.iconInputContainer}>
          <TextInput
            style={styles.iconInput}
            placeholder="Tên icon (Material Community Icons)"
            value={catIcon}
            onChangeText={setCatIcon}
          />
          <TouchableOpacity style={styles.addCategoryButton} onPress={addNewCategory}>
            <Icon name="plus" size={20} color="white" />
            <Text style={styles.addCategoryButtonText}>Thêm</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryColorDot, { backgroundColor: item.color }]} />
                <Icon name={item.icon || 'shape'} size={20} color="#666" />
                <Text style={styles.categoryName}>{item.name}</Text>
              </View>
              <View style={styles.categoryRight}>
                <View style={[styles.categoryTypeBadge, item.type === 'income' ? styles.categoryTypeIncome : styles.categoryTypeExpense]}>
                  <Text style={styles.categoryTypeText}>
                    {item.type === 'income' ? 'Thu' : 'Chi'}
                  </Text>
                </View>
                {item.custom && (
                  <TouchableOpacity onPress={() => removeCategory(item.id)} style={styles.deleteCategoryButton}>
                    <Icon name="delete-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  // Sections
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

  // Setting Items
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

  // Currency Buttons
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

  // PIN Section
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

  // Export Button
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exportButtonSpacing: {
    marginTop: 12,
  },
  exportButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },

  // Category Management
  addCategoryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  categoryInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  typeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  typeToggleButtonActive: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  typeToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  typeToggleTextActive: {
    color: 'white',
  },

  // Color Picker
  colorPickerContainer: {
    marginBottom: 16,
  },
  colorPickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#2196F3',
    borderWidth: 3,
  },

  // Icon Input
  iconInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  iconInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    gap: 6,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addCategoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  // Category List
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 8,
    flex: 1,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTypeIncome: {
    backgroundColor: '#e8f5e8',
  },
  categoryTypeExpense: {
    backgroundColor: '#ffebee',
  },
  categoryTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  deleteCategoryButton: {
    padding: 4,
  },
});
