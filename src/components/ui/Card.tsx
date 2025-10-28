import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { colors, borderRadius, shadows } from '../../styles/theme';

export type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  variant?: 'elevated' | 'outline' | 'flat';
};

export default function Card({ children, style, padded = true, variant = 'elevated' }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'outline' && styles.outline,
        padded ? styles.padded : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  padded: {
    padding: 16,
  },
  elevated: {
    ...shadows.md,
    borderWidth: 0,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
