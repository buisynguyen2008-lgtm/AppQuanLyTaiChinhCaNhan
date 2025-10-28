import React from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useFinanceStore } from '../store';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { TransactionsStackParamList } from '../navigation/TransactionsStack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function TransactionFormScreen() {
  const route = useRoute<RouteProp<TransactionsStackParamList, 'TransactionForm'>>();
  const nav = useNavigation();
  const transactions = useFinanceStore((s) => s.transactions);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const categories = useFinanceStore((s) => s.categories);

  const editing = route.params?.id ? transactions.find((t) => t.id === route.params?.id) : undefined;

  const [amount, setAmount] = React.useState(editing ? String(editing.amount) : '');
  const [type, setType] = React.useState(editing ? editing.type : 'expense');
  const [categoryId, setCategoryId] = React.useState(editing ? editing.categoryId : categories.find((c) => c.type !== 'income')?.id || 'cat_other');
  const [note, setNote] = React.useState(editing?.note ?? '');
  const [wallet, setWallet] = React.useState(editing?.wallet ?? '');
  const [date, setDate] = React.useState(editing ? new Date(editing.datetime) : new Date());
  const [showDate, setShowDate] = React.useState(false);
  const [showTime, setShowTime] = React.useState(false);

  const onSave = () => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return;
    const datetimeISO = date.toISOString();
    if (editing) {
      updateTransaction(editing.id, { amount: amt, type: type as any, categoryId, note, wallet, datetime: datetimeISO });
    } else {
      addTransaction({ amount: amt, type: type as any, categoryId, note, wallet, datetime: datetimeISO });
    }
    // @ts-ignore
    nav.goBack();
  };

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDate(false);
    if (selected) {
      const d = new Date(date);
      d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDate(d);
      if (Platform.OS === 'android') setShowTime(true);
    }
  };

  const onTimeChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowTime(false);
    if (selected) {
      const d = new Date(date);
      d.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setDate(d);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Số tiền</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} />

      <Text style={styles.label}>Loại</Text>
      <View style={styles.row}>
        <Button title="Chi" onPress={() => setType('expense')} color={type === 'expense' ? '#d33' : undefined} />
        <Button title="Thu" onPress={() => setType('income')} color={type === 'income' ? '#2a2' : undefined} />
      </View>

      <Text style={styles.label}>Danh mục</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {categories
          .filter((c) => (type === 'income' ? (c.type === 'income' || c.type === 'both') : (c.type === 'expense' || c.type === 'both')))
          .map((c) => (
            <TouchableOpacity key={c.id} style={[styles.chip, categoryId === c.id && styles.chipActive]} onPress={() => setCategoryId(c.id)}>
              <Text>{c.name}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      <Text style={styles.label}>Ngày giờ</Text>
      <View style={styles.rowGap}>
        <Button title={date.toLocaleString('vi-VN')} onPress={() => (Platform.OS === 'ios' ? setShowDate(true) : setShowDate(true))} />
        {showDate && (
          <DateTimePicker mode="date" value={date} onChange={onDateChange} />
        )}
        {showTime && (
          <DateTimePicker mode="time" value={date} onChange={onTimeChange} />
        )}
        {Platform.OS === 'ios' ? (
          <>
            <Text style={styles.smallHint}>Chọn ngày trước, sau đó chọn giờ.</Text>
          </>
        ) : null}
      </View>

      <Text style={styles.label}>Ghi chú</Text>
      <TextInput style={styles.input} value={note} onChangeText={setNote} />

      <Text style={styles.label}>Ví/Tài khoản</Text>
      <TextInput style={styles.input} value={wallet} onChangeText={setWallet} placeholder="Tiền mặt, ngân hàng, Momo..." />

      <View style={styles.actions}>
        <Button title="Lưu" onPress={onSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 10 },
  row: { flexDirection: 'row', gap: 8 },
  rowGap: { gap: 8 },
  chips: { gap: 8 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#eee' },
  actions: { marginTop: 16 },
  smallHint: { color: '#666', fontSize: 12 },
});
