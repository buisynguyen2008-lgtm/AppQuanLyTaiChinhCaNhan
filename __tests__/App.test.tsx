/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({ children }: any) => children,
    DefaultTheme: {},
    DarkTheme: {},
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('victory-native', () => ({
  VictoryPie: 'VictoryPie',
  VictoryBar: 'VictoryBar',
  VictoryChart: 'VictoryChart',
  VictoryTheme: {},
}));

jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: () => {
      const Navigator = ({ children }: any) => children;
      const Screen = ({ children }: any) => children;
      return { Navigator, Screen } as any;
    },
  };
});

jest.mock('@react-navigation/native-stack', () => {
  return {
    createNativeStackNavigator: () => {
      const Navigator = ({ children }: any) => children;
      const Screen = ({ children }: any) => children;
      return { Navigator, Screen } as any;
    },
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
