import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, ViewStyle, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  edges?: ("top" | "right" | "bottom" | "left")[];
  contentContainerStyle?: ViewStyle;
};

/**
 * Screen: Layout wrapper cho các màn hình, áp dụng SafeArea + KeyboardAvoidingView
 */
export default function Screen({
  children,
  style,
  scrollable = false,
  edges = ['top', 'left', 'right'],
  contentContainerStyle,
}: ScreenProps) {
  const content = scrollable ? (
    <ScrollView style={styles.flex} contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.root, style]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  flex: {
    flex: 1,
  },
});
