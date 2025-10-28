import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceStore } from '../store';
import { Goal } from '../models/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function GoalsScreen() {
  const goals = useFinanceStore((s) => s.goals);
  const addGoal = useFinanceStore((s) => s.addGoal);
  const updateGoal = useFinanceStore((s) => s.updateGoal);
  const [title, setTitle] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [errors, setErrors] = React.useState<{ title?: string, target?: string }>({});

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const validateForm = () => {
    const newErrors: { title?: string, target?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tên mục tiêu';
    }
    if (!target.trim()) {
      newErrors.target = 'Vui lòng nhập số tiền mục tiêu';
    } else if (isNaN(Number(target)) || Number(target) <= 0) {
      newErrors.target = 'Số tiền phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGoal = () => {
    if (!validateForm()) return;

    addGoal({ title: title.trim(), targetAmount: Number(target) });
    setTitle('');
    setTarget('');
    setErrors({});
  };

  const formatAmount = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mục tiêu tiết kiệm</Text>
          <Text style={styles.subtitle}>Theo dõi tiến độ hoàn thành mục tiêu</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Icon name="target" size={24} color="#2196F3" />
            <Text style={styles.summaryTitle}>Tổng quan mục tiêu</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tổng mục tiêu</Text>
              <Text style={styles.summaryValue}>
                {totalTarget.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Đã tiết kiệm</Text>
              <Text style={styles.summaryValue}>
                {totalSaved.toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </View>
          <View style={styles.overallProgress}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ tổng thể</Text>
              <Text style={styles.progressPercentage}>{overallProgress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
            </View>
          </View>
        </View>

        {/* Add Goal Form */}
        <View style={styles.addGoalSection}>
          <Text style={styles.sectionTitle}>Thêm mục tiêu mới</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên mục tiêu *</Text>
              <TextInput
                style={[styles.textInput, errors.title && styles.inputError]}
                placeholder="Ví dụ: Mua laptop, Du lịch..."
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholderTextColor="#999"
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số tiền mục tiêu *</Text>
              <View style={[styles.amountContainer, errors.target && styles.inputError]}>
                <Text style={styles.currencySymbol}>đ</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={target}
                  onChangeText={(text) => {
                    setTarget(formatAmount(text));
                    if (errors.target) setErrors({ ...errors, target: undefined });
                  }}
                  placeholderTextColor="#999"
                />
              </View>
              {errors.target && <Text style={styles.errorText}>{errors.target}</Text>}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
              <Icon name="plus" size={20} color="white" />
              <Text style={styles.addButtonText}>Thêm mục tiêu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Danh sách mục tiêu</Text>

          {goals.length > 0 ? (
            <View style={styles.goalsList}>
              {goals.map((goal) => (
                <GoalRow key={goal.id} item={goal} onUpdate={updateGoal} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="target-variant" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có mục tiêu nào</Text>
              <Text style={styles.emptySubtext}>Hãy thêm mục tiêu đầu tiên của bạn</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalRow({ item, onUpdate }: { item: Goal; onUpdate: (id: string, g: Partial<Goal>) => void }) {
  const percent = Math.min(100, Math.round((item.savedAmount / Math.max(item.targetAmount, 1)) * 100));
  const [isEditing, setIsEditing] = React.useState(false);
  const [editAmount, setEditAmount] = React.useState('');

  const handleQuickAdd = (amount: number) => {
    onUpdate(item.id, { savedAmount: item.savedAmount + amount });
  };

  const handleCustomAdd = () => {
    const amount = Number(editAmount) || 0;
    if (amount > 0) {
      onUpdate(item.id, { savedAmount: item.savedAmount + amount });
      setEditAmount('');
      setIsEditing(false);
    }
  };

  const formatAmount = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalIcon}>
          <Icon name="target-variant" size={24} color="#2196F3" />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          <Text style={styles.goalProgress}>
            {item.savedAmount.toLocaleString('vi-VN')} / {item.targetAmount.toLocaleString('vi-VN')} đ
          </Text>
        </View>
        <Text style={[styles.goalPercentage, percent >= 100 ? styles.goalComplete : styles.goalInProgress]}>
          {percent}%
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
      </View>

      <View style={styles.goalActions}>
        <View style={styles.quickAddButtons}>
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => handleQuickAdd(100000)}
          >
            <Text style={styles.quickAddText}>+100k</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => handleQuickAdd(500000)}
          >
            <Text style={styles.quickAddText}>+500k</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => handleQuickAdd(1000000)}
          >
            <Text style={styles.quickAddText}>+1tr</Text>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.customAddContainer}>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>đ</Text>
              <TextInput
                style={styles.customAmountInput}
                placeholder="Nhập số tiền"
                keyboardType="numeric"
                value={editAmount}
                onChangeText={(text) => setEditAmount(formatAmount(text))}
                autoFocus
              />
            </View>
            <View style={styles.customAddButtons}>
              <TouchableOpacity
                style={styles.cancelCustomButton}
                onPress={() => {
                  setIsEditing(false);
                  setEditAmount('');
                }}
              >
                <Text style={styles.cancelCustomText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmCustomButton}
                onPress={handleCustomAdd}
              >
                <Text style={styles.confirmCustomText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.customAddButton}
            onPress={() => setIsEditing(true)}
          >
            <Icon name="plus-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.customAddText}>Thêm số tiền tùy chỉnh</Text>
          </TouchableOpacity>
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
    marginBottom: 16,
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
  overallProgress: {
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
    color: '#2196F3',
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
    backgroundColor: '#2196F3',
  },

  // Add Goal Section
  addGoalSection: {
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
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#ffebee',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    gap: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Goals Section
  goalsSection: {
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
    marginBottom: 20,
  },
  goalsList: {
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

  // Goal Card
  goalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 12,
    color: '#666',
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalComplete: {
    color: '#4CAF50',
  },
  goalInProgress: {
    color: '#2196F3',
  },
  progressContainer: {
    marginBottom: 16,
  },

  // Goal Actions
  goalActions: {
    gap: 12,
  },
  quickAddButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAddButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
    alignItems: 'center',
  },
  quickAddText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  customAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  customAddText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196F3',
  },
  customAddContainer: {
    gap: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  customAmountInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  customAddButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelCustomButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelCustomText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  confirmCustomButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  confirmCustomText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});
