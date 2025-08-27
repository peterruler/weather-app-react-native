import '@testing-library/jest-native/extend-expect';

// Basic fetch mock
if (!global.fetch) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = jest.fn();
}

// Mock Expo StatusBar to avoid RN hooks requirements in test env
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Silence animated warnings and avoid native animated dependency
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Force a stable color scheme in tests
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => 'light',
}));

// Replace TouchableOpacity with a simple mock to avoid Animated hooks
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
  const React = require('react');
  return function MockTouchableOpacity(props: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { children, ...rest } = props;
    return React.createElement('RNMockTouchableOpacity', rest, children);
  };
});

// Simplify FlatList to avoid VirtualizedList hooks during tests
jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  return function MockFlatList() {
    return null;
  };
});
