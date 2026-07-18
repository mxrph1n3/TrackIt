import { StyleSheet, useColorScheme, View } from 'react-native';

/**
 * Minimal hold screen that matches the native splash background.
 * Prefer keeping the native splash visible via expo-splash-screen instead of showing a card.
 */
export function AuthBootScreen() {
  const scheme = useColorScheme();
  const backgroundColor = scheme === 'dark' ? '#07070A' : '#F3F5FA';

  return <View style={[styles.root, { backgroundColor }]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
