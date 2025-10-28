import React, { useCallback } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { useFinanceStore } from '../store';
import { TransactionType } from '../models/types';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatAmountInput, validateAmount } from '../utils/format';

export default function QuickAddModal() {
  const quickAddOpen = useFinanceStore((s) => s.quickAddOpen);
  const closeQuickAdd = useFinanceStore((s) => s.closeQuickAdd);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const categories = useFinanceStore((s) => s.categories);
  
  const [amount, setAmount] = React.useState('');
  const [type, setType] = React.useState<TransactionType>('expense');
  const [note, setNote] = React.useState('');
  const [categoryId, setCategoryId] = React.useState(categories.find((c) => c.type === 'expense')?.id || 'cat_other');
  const [date, setDate] = React.useState(new Date());
  const [showDate, setShowDate] = React.useState(false);
  const [showTime, setShowTime] = React.useState(false);
  const [errors, setErrors] = React.useState<{amount?: string}>({});
  
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (quickAddOpen) {
      setAmount('');
      setType('expense');
      setNote('');
      setCategoryId(categories.find((c) => c.type === 'expense')?.id || 'cat_other');
      setDate(new Date());
      setErrors({});
      
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [quickAddOpen, categories, slideAnim]);

  const handleValidateAndSave = useCallback(() => {
    const validation = validateAmount(amount);
    
    if (!validation.valid) {
      setErrors({ amount: validation.error });
      return;
    }
    
    const amt = Number(amount);
    addTransaction({ amount: amt, type, categoryId, datetime: date.toISOString(), note });
    closeQuickAdd();
  }, [amount, type, categoryId, date, note, addTransaction, closeQuickAdd]);

  const onDateChange = useCallback((_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDate(false);
    if (selected) {
      const d = new Date(date);
      d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDate(d);
      if (Platform.OS === 'android') setShowTime(true);
    }
  }, [date]);

  const onTimeChange = useCallback((_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowTime(false);
    if (selected) {
      const d = new Date(date);
      d.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setDate(d);
    }
  }, [date]);

  const handleAmountChange = useCallback((text: string) => {
    setAmount(formatAmountInput(text));
  }, []);

  const handleTypeChange = useCallback((newType: TransactionType) => {
    setType(newType);
    const firstCategory = categories.find((c) => c.type === newType);
    if (firstCategory) setCategoryId(firstCategory.id);
  }, [categories]);

  return (
    <Modal visible={quickAddOpen} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Thêm giao dịch</Text>
            <TouchableOpacity onPress={closeQuickAdd} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số tiền *</Text>
              <View style={[styles.inputContainer, errors.amount && styles.inputError]}>
                <Text style={styles.currencySymbol}>đ</Text>
                <TextInput 
                  style={styles.amountInput} 
                  keyboardType="numeric" 
                  value={amount} 
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
            </View>

            {/* Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại giao dịch</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity 
                  style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]} 
                  onPress={() => handleTypeChange('expense')}
                >
                  <Icon name="trending-down" size={20} color={type === 'expense' ? 'white' : '#F44336'} />
                  <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>Chi tiêu</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeButton, type === 'income' && styles.typeButtonActive]} 
                  onPress={() => handleTypeChange('income')}
                >
                  <Icon name="trending-up" size={20} color={type === 'income' ? 'white' : '#4CAF50'} />
                  <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>Thu nhập</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Danh mục</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {categories
                  .filter((c) => (type === 'income' ? c.type === 'income' : c.type === 'expense'))
                  .map((c) => (
                    <TouchableOpacity 
                      key={c.id} 
                      style={[styles.categoryChip, categoryId === c.id && styles.categoryChipActive]} 
                      onPress={() => setCategoryId(c.id)}
                    >
                      <View style={[styles.categoryDot, { backgroundColor: c.color }]} />
                      <Text style={[styles.categoryChipText, categoryId === c.id && styles.categoryChipTextActive]}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>

            {/* Note Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput 
                style={styles.textInput} 
                value={note} 
                onChangeText={setNote}
                placeholder="Nhập ghi chú (tùy chọn)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Date/Time Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày giờ</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDate(true)}>
                <Icon name="calendar" size={20} color="#666" />
                <Text style={styles.dateButtonText}>{date.toLocaleString('vi-VN')}</Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {showDate && (
                <DateTimePicker mode="date" value={date} onChange={onDateChange} />
              )}
              {showTime && (
                <DateTimePicker mode="time" value={date} onChange={onTimeChange} />
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={closeQuickAdd}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleValidateAndSave}>
              <Icon name="check" size={20} color="white" />
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContainer: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  
  // Content
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  
  // Amount Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#ffebee',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  
  // Type Buttons
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  
  // Category Selection
  categoryScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#2196F3',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Text Input
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    textAlignVertical: 'top',
  },
  
  // Date Button
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  
  // Actions
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    gap: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
