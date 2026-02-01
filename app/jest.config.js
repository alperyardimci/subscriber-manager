module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-screens|react-native-safe-area-context|@notifee|react-native-quick-sqlite|react-native-keychain|@react-native-clipboard|@react-native-community|@react-native-vector-icons)/)',
  ],
  moduleNameMapper: {
    '\\.(ttf|otf)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
