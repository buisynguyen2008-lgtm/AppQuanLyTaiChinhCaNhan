/**
 * DataManagementSection
 * --------------------------------------
 * Provides:
 * - CSV export (existing behavior)
 * - JSON backup: copies a full-state JSON to clipboard
 * - JSON restore: paste JSON into a modal and import with validation/safety remap
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { copyJsonToClipboard, importFromJson } from '../../services/backup';

const DataManagementSection: React.FC = () => {
  const nav = useNavigation();
  const [importVisible, setImportVisible] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const exportCSV = () => {
    Alert.alert(
      'Xuất dữ liệu CSV', 
      'Dữ liệu đã được chuẩn bị. Bạn có thể sao chép nội dung này để lưu vào file CSV.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Sao chép', onPress: () => {
          Alert.alert('Thành công', 'Dữ liệu đã được sao chép vào clipboard');
        }}
      ]
    );
  };

  const exportJSON = () => {
    copyJsonToClipboard();
    Alert.alert('Thành công', 'Đã sao chép bản sao lưu JSON vào clipboard.');
  };

  const onImport = () => {
    if (!jsonText.trim()) {
      Alert.alert('Thiếu dữ liệu', 'Vui lòng dán nội dung JSON trước khi khôi phục.');
      return;
    }
    const res = importFromJson(jsonText);
    if (res.ok) {
      setImportVisible(false);
      setJsonText('');
      Alert.alert('Khôi phục thành công', 'Dữ liệu đã được khôi phục từ JSON.');
    } else {
      Alert.alert('Lỗi', res.error || 'Không thể khôi phục từ JSON');
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quản lý dữ liệu</Text>

      <TouchableOpacity style={styles.exportButton} onPress={exportCSV}>
        <Icon name="download" size={24} color="#2196F3" />
        <Text style={styles.exportButtonText}>Xuất dữ liệu CSV</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.exportButton, styles.exportButtonSpaced]}
        onPress={exportJSON}
      >
        <Icon name="content-copy" size={24} color="#2196F3" />
        <Text style={styles.exportButtonText}>Sao lưu JSON (Sao chép)</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.exportButton, styles.exportButtonSpaced]}
        onPress={() => setImportVisible(true)}
      >
        <Icon name="upload" size={24} color="#2196F3" />
        <Text style={styles.exportButtonText}>Khôi phục từ JSON</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.exportButton, styles.exportButtonSpaced]}
        onPress={() => (nav as any).navigate('Budget')}
      >
        <Icon name="wallet-outline" size={24} color="#2196F3" />
        <Text style={styles.exportButtonText}>Quản lý Ngân sách</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.exportButton, styles.exportButtonSpaced]}
        onPress={() => (nav as any).navigate('Goals')}
      >
        <Icon name="target-variant" size={24} color="#2196F3" />
        <Text style={styles.exportButtonText}>Quản lý Mục tiêu</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>

      <Modal visible={importVisible} transparent animationType="fade" onRequestClose={() => setImportVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Dán JSON để khôi phục</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Dán nội dung JSON tại đây"
              placeholderTextColor="#999"
              value={jsonText}
              onChangeText={setJsonText}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setImportVisible(false)}>
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalPrimary]} onPress={onImport}>
                <Text style={[styles.modalButtonText, styles.modalPrimaryText]}>Khôi phục</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default React.memo(DataManagementSection);

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
  exportButtonSpaced: {
    marginTop: 12,
  },
  exportButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 260,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    color: '#1a1a1a',
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12 as any,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancel: {
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  modalPrimary: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  modalButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  modalPrimaryText: {
    color: '#1565C0',
  },
});