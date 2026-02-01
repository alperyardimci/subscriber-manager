import React from 'react';
import {render} from '@testing-library/react-native';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  useFocusEffect: jest.fn(),
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn()}),
  useRoute: () => ({params: {}}),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: () => null,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: () => null,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn().mockResolvedValue(''),
}));

import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
  });
});
