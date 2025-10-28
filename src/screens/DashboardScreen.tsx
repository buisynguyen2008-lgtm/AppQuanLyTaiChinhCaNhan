import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuickAddFab from '../components/QuickAddFab';
import { useFinanceStore } from '../store';
import { format } from 'date-fns';
import PieChart from '../components/charts/PieChart';
import { Transaction } from '../models/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency, formatCurrencyWithSign } from '../utils/format';
import { useTransactionStats, useRecentTransactions } from '../hooks/useTransactionStats';

export default function DashboardScreen() {
  const transactions = useFinanceStore((s) => s.transactions);
  const openQuickAdd = useFinanceStore((s) => s.openQuickAdd);

  const now = useMemo(() => new Date(), []);
  const stats = useTransactionStats(transactions, now);
  const recent = useRecentTransactions(transactions, 5);

  const pieData = useMemo(() => 
    stats.byCat.map((x) => ({ x: x.category.name, y: x.total })),
    [stats.byCat]
  );

  // no-op

  const handleQuickAdd = useCallback(() => {
    openQuickAdd();
  }, [openQuickAdd]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào! 👋</Text>
        <Text style={styles.title}>Tháng {format(new Date(), 'MM/yyyy')}</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <Icon name="wallet" size={24} color="#4CAF50" />
          <Text style={styles.balanceLabel}>Số dư tháng này</Text>
        </View>
        <Text style={[styles.balanceAmount, stats.balance >= 0 ? styles.positiveAmount : styles.negativeAmount]}>
          {formatCurrencyWithSign(stats.balance)}
        </Text>
      </View>

      {/* Income/Expense Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.incomeCard]}>
          <View style={styles.statHeader}>
            <Icon name="trending-up" size={20} color="#4CAF50" />
            <Text style={styles.statLabel}>Thu nhập</Text>
          </View>
          <Text style={styles.statAmount}>{formatCurrency(stats.income)}</Text>
        </View>
        
        <View style={[styles.statCard, styles.expenseCard]}>
          <View style={styles.statHeader}>
            <Icon name="trending-down" size={20} color="#F44336" />
            <Text style={styles.statLabel}>Chi tiêu</Text>
          </View>
          <Text style={styles.statAmount}>{formatCurrency(stats.expense)}</Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Tỷ lệ chi tiêu</Text>
        {pieData.length > 0 ? (
          <View style={styles.chartContainer}>
            {/* PieChart: ưu tiên Victory (PolarChart/Pie) nếu khả dụng, fallback SVG nếu không */}
            <PieChart 
              data={stats.byCat.map((c) => ({ label: c.category.name, value: c.total, color: c.category.color }))}
              size={220}
              innerRadius={0}
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Icon name="chart-pie" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
          </View>
        )}

        {/* Legend */}
        {pieData.length > 0 && (
          <View style={styles.legendContainer}>
            {stats.byCat.map((c) => {
              const pct = stats.expense > 0 ? Math.round((c.total / stats.expense) * 100) : 0;
              return (
                <View key={c.category.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: c.category.color || '#9AA0A6' }]} />
                  <Text style={styles.legendLabel}>{c.category.name}</Text>
                  <Text style={styles.legendPercent}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        )}
        
        {stats.topCategoryLabel ? (
          <View style={styles.hintCard}>
            <Icon name="lightbulb-outline" size={16} color="#FF9800" />
            <Text style={styles.hintText}>Tháng này bạn chi nhiều nhất cho {stats.topCategoryLabel}.</Text>
          </View>
        ) : (
          <View style={styles.hintCard}>
            <Icon name="plus-circle-outline" size={16} color="#2196F3" />
            <Text style={styles.hintText}>Hãy thêm giao dịch để bắt đầu theo dõi.</Text>
          </View>
        )}
      </View>

      {/* Recent Transactions */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
          <TouchableOpacity onPress={handleQuickAdd}>
            <Icon name="plus-circle" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
        
        {recent.length > 0 ? (
          <View style={styles.transactionsList}>
            {recent.map((item) => <RecentRow key={item.id} item={item} />)}
          </View>
        ) : (
          <View style={styles.emptyTransactions}>
            <Icon name="receipt" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có giao dịch</Text>
          </View>
        )}
      </View>
        </ScrollView>
        {/* Floating Quick Add FAB to avoid overlap with TabBar and stick to screen, not scroll */}
        <QuickAddFab />
      </View>
    </SafeAreaView>
  );
}

// Memoized RecentRow component
const RecentRow = React.memo(({ item }: { readonly item: Transaction }) => {
  const categories = useFinanceStore((s) => s.categories);
  const category = categories.find(c => c.id === item.categoryId);
  
  return (
    <View style={styles.transactionRow}> 
      <View style={styles.transactionLeft}>
        <View style={[styles.categoryDot, { backgroundColor: category?.color || '#ccc' }]} />
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionNote}>{item.note || category?.name || 'Giao dịch'}</Text>
          <Text style={styles.transactionDate}>{format(new Date(item.datetime), 'dd/MM HH:mm')}</Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, item.type === 'expense' ? styles.expenseAmount : styles.incomeAmount]}>
        {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  screen: {
    flex: 1,
    position: 'relative',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1a1a1a',
  },
  
  // Balance Card
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  
  // Chart Section
  chartSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legendContainer: {
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    color: '#333',
  },
  legendPercent: {
    color: '#666',
    fontWeight: '600',
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  hintText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
  },
  
  // Recent Section
  recentSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsList: {
    gap: 12,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  },
  
  // Transaction Row
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseAmount: {
    color: '#F44336',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  
});
