/* eslint-disable react/no-unstable-nested-components */
/**
 * App Navigation
 * --------------------------------------
 * - Bottom Tabs: Dashboard, Transactions (stack), Statistics, Settings
 * - Root Stack: Onboarding (walkthrough) -> Tabs -> (Budget, Goals)
 *
 * Initial route is decided by settings.seenOnboarding (Zustand store).
 * We use a small badge on Transactions and a simple active indicator under the tab icon.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsStack from './TransactionsStack';
import StatisticsScreen from '../screens/StatisticsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SettingsScreen from '../screens/settings';
import QuickAddModal from '../components/QuickAddModal';
import HomeIcon from '../components/icons/HomeIcon';
import TransactionsIcon from '../components/icons/TransactionsIcon';
import StatsIcon from '../components/icons/StatsIcon';
import SettingsIcon from '../components/icons/SettingsIcon';
import { useFinanceStore } from '../store';
import { useAnimatedScale } from '../hooks/useAnimatedScale';
import { useTodayTransactionsCount } from '../hooks/useTransactionStats';
import { colors } from '../styles/theme';

export type RootTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Statistics: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  Budget: undefined;
  Goals: undefined;
  Onboarding: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Memoized TabIcon component to prevent unnecessary re-renders
const TabIcon = React.memo(({ route, color, size, focused }: { readonly route: keyof RootTabParamList; readonly color: string; readonly size: number; readonly focused?: boolean }) => {
  const scaleAnim = useAnimatedScale(focused || false);
  const iconSize = focused ? size + 2 : size;
  const iconColor = focused ? colors.primary : color;

  const renderIcon = React.useCallback(() => {
    if (route === 'Dashboard') return <HomeIcon color={iconColor} size={iconSize} />;
    if (route === 'Transactions') return <TransactionsIcon color={iconColor} size={iconSize} />;
    if (route === 'Statistics') return <StatsIcon color={iconColor} size={iconSize} />;
    return <SettingsIcon color={iconColor} size={iconSize} />;
  }, [route, iconColor, iconSize]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {renderIcon()}
    </Animated.View>
  );
});

// Separate component for badge logic to avoid selector issues
const TransactionsBadge = React.memo(() => {
  const transactions = useFinanceStore((s) => s.transactions);
  const todayCount = useTodayTransactionsCount(transactions);

  if (todayCount === 0) return null;

  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.badgeText}>
        {todayCount > 9 ? '9+' : todayCount}
      </Text>
    </View>
  );
});

// Memoized TabIconWithBadge
const TabIconWithBadge = React.memo(({ route, color, size, focused }: { readonly route: keyof RootTabParamList; readonly color: string; readonly size: number; readonly focused?: boolean }) => {
  return (
    <View style={badgeStyles.container}>
      <TabIcon route={route} color={color} size={size} focused={focused} />
      {route === 'Transactions' && <TransactionsBadge />}
      {/* Active indicator */}
      {focused ? <View style={badgeStyles.activeIndicator} /> : null}
    </View>
  );
});

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => (
          <TabIconWithBadge route={route.name} color={color} size={size} focused={focused} />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingTop: 8,
          // Add safe area bottom inset to avoid overlap with system gesture area
          paddingBottom: Math.max(insets.bottom, 8),
          height: 62 + Math.max(insets.bottom, 8),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsStack as any} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const seenOnboarding = useFinanceStore((s) => s.settings?.seenOnboarding);
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={seenOnboarding ? 'Tabs' : 'Onboarding'}>
        <Stack.Screen name="Onboarding" component={require('../screens/onboarding/WalkthroughScreen').default} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Budget" component={BudgetScreen} />
        <Stack.Screen name="Goals" component={GoalsScreen} />
      </Stack.Navigator>
      <QuickAddModal />
    </>
  );
}

// Badge styles
const badgeStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#F44336',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
