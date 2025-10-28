import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceStore } from '../store';
import { Budget, Category } from '../models/types';
import { selectors } from '../store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function BudgetScreen() {
  const budgets = useFinanceStore((s) => s.budgets);
  const categories = useFinanceStore((s) => s.categories);
  const setBudget = useFinanceStore((s) => s.setBudget);
  const removeBudget = useFinanceStore((s) => s.removeBudget);

  const expenseCategories = categories.filter((c) => c.type !== 'income');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ngân sách</Text>
          <Text style={styles.subtitle}>Quản lý hạn mức chi tiêu theo danh mục</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Icon name="wallet-outline" size={24} color="#2196F3" />
            <Text style={styles.summaryTitle}>Tổng quan ngân sách</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tổng hạn mức</Text>
              <Text style={styles.summaryValue}>
                {budgets.reduce((sum, b) => sum + b.limit, 0).toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Đã chi tiêu</Text>
              <Text style={styles.summaryValue}>
                {budgets.reduce((sum, b) => {
                  const month = selectors.byMonth(useFinanceStore.getState().transactions, new Date());
                  const spent = month.filter((t) => t.type === 'expense' && t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0);
                  return sum + spent;
                }, 0).toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </View>
        </View>

        {/* Budget List */}
        <View style={styles.budgetSection}>
          <Text style={styles.sectionTitle}>Hạn mức theo danh mục</Text>

          {expenseCategories.length > 0 ? (
            <View style={styles.budgetList}>
              {expenseCategories.map((category) => (
                <BudgetRow
                  key={category.id}
                  category={category}
                  budget={budgets.find((b) => b.categoryId === category.id)}
                  onSave={(limit) => setBudget({ id: `budget_${category.id}`, categoryId: category.id, limit })}
                  onRemove={() => removeBudget(`budget_${category.id}`)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="wallet-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có danh mục chi tiêu</Text>
              <Text style={styles.emptySubtext}>Hãy thêm danh mục trong Cài đặt</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BudgetRow({ category, budget, onSave, onRemove }: { category: Category; budget?: Budget; onSave: (limit: number) => void; onRemove: () => void }) {
  const [value, setValue] = React.useState(budget?.limit?.toString() ?? '');
  const [isEditing, setIsEditing] = React.useState(false);
  const transactions = useFinanceStore((s) => s.transactions);

  const spent = useMemo(() => {
    const month = selectors.byMonth(transactions, new Date());
    return month.filter((t) => t.type === 'expense' && t.categoryId === category.id).reduce((s, t) => s + t.amount, 0);
  }, [transactions, category.id]);

  const limit = budget?.limit ?? 0;
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const warn = pct >= 80 && pct < 100;
  const over = pct >= 100;

  const handleSave = () => {
    const numValue = Number(value) || 0;
    onSave(numValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(budget?.limit?.toString() ?? '');
    setIsEditing(false);
  };

  return (
    <View style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <View style={styles.categoryInfo}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
            <Icon name={category.icon || 'shape'} size={20} color="white" />
          </View>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categorySpent}>
              Đã chi: {spent.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>

        {budget && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
          >
            <Icon name="delete-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.budgetContent}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.limitInput}
              placeholder="Nhập hạn mức"
              keyboardType="numeric"
              value={value}
              onChangeText={setValue}
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.limitButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.limitText}>
              {limit > 0 ? `${limit.toLocaleString('vi-VN')} đ` : 'Chưa đặt hạn mức'}
            </Text>
            <Icon name="pencil" size={16} color="#666" />
          </TouchableOpacity>
        )}

        {limit > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ</Text>
              <Text style={[
                styles.progressPercentage,
                over ? styles.progressOverText : warn ? styles.progressWarnText : styles.progressOkText
              ]}>
                {pct}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${pct}%` },
                  over ? styles.progressOver : warn ? styles.progressWarn : styles.progressOk
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {spent.toLocaleString('vi-VN')} / {limit.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        )}
      </View>
    </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },

  // Summary Card
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 20,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  // Budget Section
  budgetSection: {
    marginHorizontal: 20,
    marginTop: 16,
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
  budgetList: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },

  // Budget Card
  budgetCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
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
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  categorySpent: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },

  // Budget Content
  budgetContent: {
    gap: 12,
  },
  editContainer: {
    gap: 12,
  },
  limitInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  limitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  limitText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },

  // Progress
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressOverText: {
    color: '#F44336',
  },
  progressWarnText: {
    color: '#FF9800',
  },
  progressOkText: {
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressOk: {
    backgroundColor: '#4CAF50',
  },
  progressWarn: {
    backgroundColor: '#FF9800',
  },
  progressOver: {
    backgroundColor: '#F44336',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
