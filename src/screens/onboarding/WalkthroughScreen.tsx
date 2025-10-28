/**
 * WalkthroughScreen (Onboarding)
 * --------------------------------------
 * A simple 3-slide onboarding shown once.
 * Gate is `settings.seenOnboarding` in the store; when done/skip -> set true and navigate to Tabs.
 */
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFinanceStore } from '../../store';
import { colors } from '../../styles/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: 'track',
    title: 'Theo dõi chi tiêu',
    desc: 'Ghi lại thu chi mỗi ngày một cách nhanh chóng và trực quan.',
    icon: 'calendar-check',
    color: '#E3F2FD',
  },
  {
    key: 'analyze',
    title: 'Phân tích thông minh',
    desc: 'Biểu đồ, danh mục và số liệu giúp bạn hiểu dòng tiền.',
    icon: 'chart-donut-variant',
    color: '#E8F5E9',
  },
  {
    key: 'goal',
    title: 'Mục tiêu và ngân sách',
    desc: 'Đặt ngân sách, theo dõi mục tiêu để đạt kế hoạch tài chính.',
    icon: 'target-variant',
    color: '#FFF8E1',
  },
];

export default function WalkthroughScreen({ navigation }: any) {
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const updateSettings = useFinanceStore((s) => s.updateSettings);

  const onNext = () => {
    if (index < slides.length - 1) {
      const next = index + 1;
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      onDone();
    }
  };

  const onSkip = () => onDone();
  const onDone = () => {
    updateSettings({ seenOnboarding: true });
    navigation.replace('Tabs');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}> 
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          data={slides}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}> 
              <View style={[styles.art, { backgroundColor: item.color }]}> 
                <Icon name={item.icon as any} size={84} color={colors.primary} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
          )}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(i);
          }}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.actions}>
            {index < slides.length - 1 ? (
              <TouchableOpacity onPress={onSkip} style={[styles.button, styles.linkButton]}> 
                <Text style={styles.linkText}>Bỏ qua</Text>
              </TouchableOpacity>
            ) : <View style={styles.spacer80} />}

            <TouchableOpacity onPress={onNext} style={[styles.button, styles.primaryButton]}> 
              <Text style={styles.primaryText}>{index < slides.length - 1 ? 'Tiếp' : 'Bắt đầu'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  slide: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  art: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
  footer: { paddingHorizontal: 24, paddingVertical: 16 },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e0e0e0', marginHorizontal: 4 },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  actions: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  linkButton: { backgroundColor: '#fff' },
  linkText: { color: '#666', fontWeight: '600' },
  primaryButton: { backgroundColor: colors.primary },
  primaryText: { color: '#fff', fontWeight: '700' },
  spacer80: { width: 80 },
});
