import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, typography, shadows } from '../../styles/theme';

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
};

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, left, right, style, elevated = false }) => {
  return (
    <View style={[styles.container, elevated ? styles.elevated : undefined, style]}>
      <View style={styles.row}>
        <View style={styles.left}>{left}</View>
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
};

export default React.memo(AppHeader);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  elevated: {
    ...shadows.md,
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {},
  center: { flex: 1 },
  right: { width: 40, alignItems: 'flex-end' },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
