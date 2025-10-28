import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/layout/AppHeader';
import { colors } from '../styles/theme';
import { useFinanceStore, selectors } from '../store';
import { Transaction } from '../models/types';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency, formatCurrencyWithSign } from '../utils/format';
import { useDebounce } from '../hooks/useDebounce';

export default function TransactionsScreen() {
  const transactions = useFinanceStore((s) => s.transactions);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const categories = useFinanceStore((s) => s.categories);
  const openQuickAdd = useFinanceStore((s) => s.openQuickAdd);

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCat, setFilterCat] = useState<string | 'all'>('all');
  const [onlyThisMonth, setOnlyThisMonth] = useState(true);
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 300);

  const list = useMemo(() => {
    const base = onlyThisMonth ? selectors.byMonth(transactions, new Date()) : transactions;
    return base.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCat !== 'all' && t.categoryId !== filterCat) return false;
      if (debouncedQ && !(t.note || '').toLowerCase().includes(debouncedQ.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filterType, filterCat, onlyThisMonth, debouncedQ]);

  const totalAmount = useMemo(() => {
    return list.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [list]);

  const handleQuickAdd = useCallback(() => {
    openQuickAdd();
  }, [openQuickAdd]);

  const renderItem = useCallback(({ item }: { item: Transaction }) => (
    <TransactionRow item={item} onDelete={deleteTransaction} />
  ), [deleteTransaction]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <AppHeader
          title="Giao dịch"
          right={(
            <TouchableOpacity style={styles.addButton} onPress={handleQuickAdd}>
              <Icon name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          elevated
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm giao dịch..."
              value={q}
              onChangeText={setQ}
              placeholderTextColor="#999"
            />
            {q.length > 0 && (
              <TouchableOpacity onPress={() => setQ('')}>
                <Icon name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterTabText, filterType === 'all' && styles.filterTabTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filterType === 'income' && styles.filterTabActive]}
              onPress={() => setFilterType('income')}
            >
              <Icon name="trending-up" size={16} color={filterType === 'income' ? 'white' : '#4CAF50'} />
              <Text style={[styles.filterTabText, filterType === 'income' && styles.filterTabTextActive]}>Thu nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filterType === 'expense' && styles.filterTabActive]}
              onPress={() => setFilterType('expense')}
            >
              <Icon name="trending-down" size={16} color={filterType === 'expense' ? 'white' : '#F44336'} />
              <Text style={[styles.filterTabText, filterType === 'expense' && styles.filterTabTextActive]}>Chi tiêu</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChips}>
            <TouchableOpacity
              style={[styles.categoryChip, filterCat === 'all' && styles.categoryChipActive]}
              onPress={() => setFilterCat('all')}
            >
              <Text style={[styles.categoryChipText, filterCat === 'all' && styles.categoryChipTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.categoryChip, filterCat === c.id && styles.categoryChipActive]}
                onPress={() => setFilterCat(c.id)}
              >
                <View style={[styles.categoryDot, { backgroundColor: c.color }]} />
                <Text style={[styles.categoryChipText, filterCat === c.id && styles.categoryChipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Filter */}
        <View style={styles.timeFilterContainer}>
          <TouchableOpacity
            style={[styles.timeFilterButton, onlyThisMonth && styles.timeFilterButtonActive]}
            onPress={() => setOnlyThisMonth(true)}
          >
            <Icon name="calendar-month" size={16} color={onlyThisMonth ? 'white' : '#666'} />
            <Text style={[styles.timeFilterText, onlyThisMonth && styles.timeFilterTextActive]}>Tháng này</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeFilterButton, !onlyThisMonth && styles.timeFilterButtonActive]}
            onPress={() => setOnlyThisMonth(false)}
          >
            <Icon name="calendar" size={16} color={!onlyThisMonth ? 'white' : '#666'} />
            <Text style={[styles.timeFilterText, !onlyThisMonth && styles.timeFilterTextActive]}>Tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {list.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng cộng:</Text>
              <Text style={[styles.summaryAmount, totalAmount >= 0 ? styles.positiveAmount : styles.negativeAmount]}>
                {formatCurrencyWithSign(totalAmount)}
              </Text>
            </View>
            <Text style={styles.summaryCount}>{list.length} giao dịch</Text>
          </View>
        )}

        {/* Transactions List */}
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={EmptyListComponent}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

import { useNavigation } from '@react-navigation/native';

// Memoized Empty List Component
const EmptyListComponent = React.memo(() => (
  <View style={styles.emptyContainer}>
    <Icon name="receipt" size={64} color="#ccc" />
    <Text style={styles.emptyText}>Không có giao dịch nào</Text>
    <Text style={styles.emptySubtext}>Hãy thêm giao dịch đầu tiên của bạn</Text>
  </View>
));

// Memoized Transaction Row Component
const TransactionRow = React.memo(({ item, onDelete }: { item: Transaction; onDelete: (id: string) => void }) => {
  const nav = useNavigation();
  const categories = useFinanceStore((s) => s.categories);
  const category = categories.find(c => c.id === item.categoryId);

  return (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => (nav as any).navigate('Transactions', { screen: 'TransactionForm', params: { id: item.id } })}
    >
      <View style={styles.transactionLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: category?.color || '#ccc' }]}>
          <Icon name={category?.icon || 'shape'} size={20} color="white" />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.note || category?.name || 'Giao dịch'}</Text>
          <Text style={styles.transactionSubtitle}>
            {format(new Date(item.datetime), 'dd/MM/yyyy • HH:mm')}
            {item.wallet && ` • ${item.wallet}`}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, item.type === 'expense' ? styles.expenseAmount : styles.incomeAmount]}>
          {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <Icon name="delete-outline" size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },

  // Filter Tabs
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTabs: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTabTextActive: {
    color: 'white',
  },

  // Category Filter
  categoryFilterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryChips: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 12,
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

  // Time Filter
  timeFilterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  timeFilterButtonActive: {
    backgroundColor: '#2196F3',
  },
  timeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  timeFilterTextActive: {
    color: 'white',
  },

  // Summary
  summaryCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  summaryCount: {
    fontSize: 12,
    color: '#666',
  },

  // List
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },

  // Transaction Card
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  expenseAmount: {
    color: '#F44336',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  deleteButton: {
    padding: 4,
  },
});
