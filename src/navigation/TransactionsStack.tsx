import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransactionsScreen from '../screens/TransactionsScreen';
import TransactionFormScreen from '../screens/TransactionFormScreen';

export type TransactionsStackParamList = {
  TransactionsHome: undefined;
  TransactionForm: { id?: string } | undefined;
};

const Stack = createNativeStackNavigator<TransactionsStackParamList>();

export default function TransactionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TransactionsHome" component={TransactionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TransactionForm" component={TransactionFormScreen} options={{ title: 'Thêm/Sửa giao dịch' }} />
    </Stack.Navigator>
  );
}
