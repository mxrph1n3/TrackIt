import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';

export function ActionHubExpandedHeader() {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          alignItems: 'center',
          marginBottom: 12,
        },
        title: {
          fontSize: 28,
          fontWeight: '900',
          letterSpacing: -0.6,
          color: theme.textPrimary,
          textTransform: 'uppercase',
        },
        subtitle: {
          marginTop: 4,
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 2.8,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Action Hub</Text>
      <Text style={styles.subtitle}>Expanded</Text>
    </View>
  );
}
