import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useSchemaHealth } from '../../hooks/useSchemaHealth';
import { BRAND } from '../../theme/designTokens';

type SchemaStatusBannerProps = {
  enabled?: boolean;
};

export function SchemaStatusBanner({ enabled = true }: SchemaStatusBannerProps) {
  const insets = useAppSafeAreaInsets();
  const { isChecking, isHealthy, message, refresh } = useSchemaHealth(enabled);

  if (isChecking || isHealthy || !message) {
    return null;
  }

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.banner}>
        <Text style={styles.title}>Database setup required</Text>
        <Text style={styles.body}>{message}</Text>
        <Pressable onPress={() => void refresh()} style={styles.button}>
          <Text style={styles.buttonLabel}>Recheck</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    paddingHorizontal: 16,
  },
  banner: {
    borderRadius: 16,
    backgroundColor: '#1F1635',
    borderWidth: 1,
    borderColor: 'rgba(119, 93, 216, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.72)',
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: BRAND.primary,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
