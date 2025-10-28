import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceStore, selectors } from '../store';
import { VictoryPie } from 'victory-native';
import AppHeader from '../components/layout/AppHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, shadows, typography } from '../styles/theme';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import { format } from 'date-fns';

export default function StatisticsScreen() {
  const transactions = useFinanceStore((s) => s.transactions);
  const [range, setRange] = React.useState<'month' | 'week'>('month');
  const now = useMemo(() => new Date(), []);
  const startOfWeek = useMemo(() => {
    const d = new Date(now);
    // assume week starts on Monday
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);
  const weekTx = useMemo(() => transactions.filter(t => {
    const dt = new Date(t.datetime);
    return dt >= startOfWeek && dt <= now;
  }), [transactions, startOfWeek, now]);
  const monthTx = useMemo(() => selectors.byMonth(transactions, now), [transactions, now]);
  const tx = range === 'week' ? weekTx : monthTx;

  const byCat = useMemo(() => selectors.groupExpenseByCategory(tx), [tx]);
  const pieData = byCat.map((x) => ({ x: x.category.name, y: x.total }));
  const pieColors = byCat.map((x) => x.category.color || '#9AA0A6');
  const totalIncome = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  // Simple day aggregation for bar chart
  const dayMap: Record<string, { income: number; expense: number }> = {};
  tx.forEach((t) => {
    // Sử dụng ngày dạng số (1..31) để tương thích tốt hơn với CartesianChart
    const key = format(new Date(t.datetime), 'd');
    dayMap[key] = dayMap[key] || { income: 0, expense: 0 };
    dayMap[key][t.type] += t.amount;
  });
  const barData = Object.keys(dayMap)
    .sort()
    .map((day) => ({ day: Number(day), income: dayMap[day].income, expense: dayMap[day].expense }));

  // dữ liệu biểu đồ cột dùng dữ liệu thật
  const displayBarData = barData;

  const avgPerDay = barData.length > 0 ? Math.round(barData.reduce((s, it) => s + it.expense, 0) / barData.length) : 0;

  // Month comparison (expense totals)
  const prevMonth = useMemo(() => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }, [now]);
  const prevTx = useMemo(() => selectors.byMonth(transactions, prevMonth), [transactions, prevMonth]);
  const totalExpense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const changePct = prevExpense === 0 ? (totalExpense > 0 ? 100 : 0) : Math.round(((totalExpense - prevExpense) / prevExpense) * 100);
  const balance = totalIncome - totalExpense;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppHeader title={`Báo cáo ${range === 'week' ? 'tuần' : 'tháng'} ${format(now, 'MM/yyyy')}`} elevated />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Segmented toggle */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[styles.segmentButton, range === 'week' && styles.segmentActive]}
            onPress={() => setRange('week')}
          >
            <Text style={[styles.segmentText, range === 'week' && styles.segmentTextActive]}>Tuần</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, range === 'month' && styles.segmentActive]}
            onPress={() => setRange('month')}
          >
            <Text style={[styles.segmentText, range === 'month' && styles.segmentTextActive]}>Tháng</Text>
          </TouchableOpacity>
        </View>

        {/* Dev toggle đã bỏ để dùng dữ liệu thật */}

        {/* Summary list (stacked rows for long amounts) */}
        <View style={styles.summaryList}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryLeft}>
              <Icon name="trending-up" size={18} color={colors.success} />
              <Text style={styles.summaryLabel}>Thu</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: colors.success }]}>{totalIncome.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={styles.summaryLeft}>
              <Icon name="trending-down" size={18} color={colors.error} />
              <Text style={styles.summaryLabel}>Chi</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: colors.error }]}>{totalExpense.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={styles.summaryLeft}>
              <Icon name="scale-balance" size={18} color={balance >= 0 ? colors.success : colors.error} />
              <Text style={styles.summaryLabel}>Cân đối</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: balance >= 0 ? colors.success : colors.error }]}>{balance.toLocaleString('vi-VN')} đ</Text>
          </View>
        </View>
        {/* Pie Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tỷ lệ chi tiêu theo danh mục</Text>
          {pieData.length > 0 ? (
            <>
              <View style={styles.chartCenter}>
                {VictoryPie ? (
                  <VictoryPie data={pieData} colorScale={pieColors} height={240} padding={{ left: 32, right: 32, top: 16, bottom: 16 }} />
                ) : (
                  <PieChart data={byCat.map((c) => ({ label: c.category.name, value: c.total, color: c.category.color }))} size={240} innerRadius={0} />
                )}
              </View>
              {/* Legend cho pie theo màu danh mục */}
              <View style={styles.legendContainer}>
                {byCat.map((c) => {
                  const pct = totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0;
                  return (
                    <View key={c.category.id} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: c.category.color || '#9AA0A6' }]} />
                      <Text style={styles.legendLabel}>{c.category.name}</Text>
                      <Text style={styles.legendPercent}>{pct}%</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={styles.empty}>Chưa có dữ liệu</Text>
          )}
        </View>
        {/* Bar Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thu - chi từng ngày</Text>
          {/* Legend Thu/Chi cho bar (gọn, không chiếm toàn hàng) */}
          <View style={styles.barLegendRow}>
            <View style={styles.barLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.barLegendText}>Thu</Text>
            </View>
            <View style={styles.barLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.barLegendText}>Chi</Text>
            </View>
          </View>
          {displayBarData.length > 0 ? (
            <BarChart
              data={displayBarData}
              xKey="day"
              yKeys={["income", "expense"]}
              colors={[colors.success, colors.error]}
              height={260}
            />
          ) : (
            <Text style={styles.empty}>Chưa có dữ liệu</Text>
          )}
          {/* Hints */}
          <View style={styles.hints}>
            <Text style={styles.hint}>Trung bình: {avgPerDay.toLocaleString('vi-VN')} đ/ngày</Text>
            <Text style={styles.hint}>So với tháng trước: {changePct >= 0 ? '+' : ''}{changePct}% ({prevExpense.toLocaleString('vi-VN')} → {totalExpense.toLocaleString('vi-VN')} đ)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 24 },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 12,
    ...shadows.sm,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.white,
  },
  // sample toggle styles đã bỏ
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryLabel: { ...typography.body2, color: colors.textSecondary, fontWeight: '600' },
  summaryAmount: { ...typography.h3, color: colors.textPrimary },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  cardLabel: { ...typography.caption, color: colors.textSecondary },
  cardValue: { ...typography.h2, color: colors.textPrimary },
  incomeCard: {},
  expenseCard: {},
  balanceCard: {},
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    marginBottom: 12,
  },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 8 },
  chartCenter: { alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#666', textAlign: 'center', marginVertical: 8 },
  hints: { marginTop: 8 },
  hint: { marginTop: 4, color: colors.textSecondary },
  sampleHint: { marginTop: 6, color: colors.textSecondary, fontStyle: 'italic' },
  legendContainer: { marginTop: 4, marginBottom: 8, gap: 8 },
  barLegendRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  barLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, color: '#333' },
  barLegendText: { color: '#333' },
  legendPercent: { color: '#666', fontWeight: '600' },
});
