/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme, Modal, View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
// Some editors occasionally fail to resolve folder index files; using explicit index helps.
import { useFinanceStore } from './src/store/index';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <PinGate>
          <RootNavigator />
        </PinGate>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

function PinGate({ children }: { children: React.ReactNode }) {
  // Select primitives separately to avoid creating a new object each render,
  // which can trip React 19's useSyncExternalStore snapshot check.
  const pinEnabled = useFinanceStore((s) => s.settings.pinEnabled);
  const pinCode = useFinanceStore((s) => s.settings.pinCode);
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Reset state when PIN is disabled
  React.useEffect(() => {
    if (!pinEnabled) {
      setUnlocked(false);
      setInput('');
      setAttempts(0);
      setIsLocked(false);
    }
  }, [pinEnabled]);

  // Lock after 3 failed attempts
  React.useEffect(() => {
    if (attempts >= 3) {
      setIsLocked(true);
      // Auto unlock after 30 seconds
      const timer = setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [attempts]);

  const handleUnlock = () => {
    if (isLocked) return;
    
    if (input === pinCode) {
      setUnlocked(true);
      setInput('');
      setAttempts(0);
    } else {
      setAttempts(prev => prev + 1);
      setInput('');
    }
  };

  const handleInputChange = (text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setInput(numericText);
    }
  };

  if (!pinEnabled || (pinEnabled && unlocked)) return children as any;

  return (
    <>
      {children}
      <Modal visible animationType="fade" transparent>
        <View style={stylesGate.backdrop}>
          <View style={stylesGate.card}>
            <View style={stylesGate.header}>
              <Text style={stylesGate.title}>Nhập mã PIN</Text>
              <Text style={stylesGate.subtitle}>Để truy cập ứng dụng</Text>
            </View>
            
            {isLocked ? (
              <View style={stylesGate.lockedContainer}>
                <Text style={stylesGate.lockedIcon}>🔒</Text>
                <Text style={stylesGate.lockedTitle}>Tài khoản bị khóa</Text>
                <Text style={stylesGate.lockedText}>
                  Bạn đã nhập sai PIN 3 lần liên tiếp.{'\n'}
                  Vui lòng thử lại sau 30 giây.
                </Text>
              </View>
            ) : (
              <>
                <View style={stylesGate.inputContainer}>
                  <TextInput
                    style={stylesGate.input}
                    keyboardType="numeric"
                    secureTextEntry
                    value={input}
                    onChangeText={handleInputChange}
                    placeholder="Nhập PIN"
                    placeholderTextColor="#999"
                    maxLength={6}
                    autoFocus
                  />
                  {attempts > 0 && (
                    <Text style={stylesGate.errorText}>
                      PIN không đúng ({attempts}/3)
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={[stylesGate.unlockButton, input.length === 0 && stylesGate.unlockButtonDisabled]} 
                  onPress={handleUnlock}
                  disabled={input.length === 0}
                >
                  <Text style={[stylesGate.unlockButtonText, input.length === 0 && stylesGate.unlockButtonTextDisabled]}>
                    Mở khóa
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const stylesGate = StyleSheet.create({
  backdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  card: { 
    width: '85%', 
    backgroundColor: 'white', 
    padding: 24, 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  inputContainer: {
    marginBottom: 20,
  },
  input: { 
    borderWidth: 2, 
    borderColor: '#e0e0e0', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 8,
  },
  unlockButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  unlockButtonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  unlockButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  unlockButtonTextDisabled: {
    color: '#999',
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  lockedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F44336',
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
