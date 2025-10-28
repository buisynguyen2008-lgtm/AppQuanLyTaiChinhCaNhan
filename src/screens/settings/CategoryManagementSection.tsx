import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFinanceStore } from '../../store';

const CategoryManagementSection: React.FC = () => {
  const categories = useFinanceStore((s) => s.categories);
  const removeCategory = useFinanceStore((s) => s.removeCategory);
  const resetCategoriesToDefault = useFinanceStore((s) => s.resetCategoriesToDefault);

  const confirmReset = () => {
    Alert.alert(
      'Khôi phục danh mục',
      'Bạn có chắc muốn khôi phục về các danh mục mặc định? Các giao dịch thuộc danh mục tùy chỉnh sẽ chuyển về “Khác”.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Khôi phục', style: 'destructive', onPress: () => resetCategoriesToDefault() },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quản lý danh mục</Text>

      <TouchableOpacity style={styles.resetButton} onPress={confirmReset}>
        <Icon name="backup-restore" size={20} color="#2196F3" />
        <Text style={styles.resetButtonText}>Khôi phục danh mục mặc định</Text>
      </TouchableOpacity>

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
  );
};

export default React.memo(CategoryManagementSection);

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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  resetButtonText: { color: '#2196F3', fontWeight: '600' },
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