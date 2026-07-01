import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToastStore } from '../../stores/useToastStore';

const TYPE_STYLES = {
  error: {
    backgroundColor: 'rgba(127, 29, 29, 0.95)',
    borderColor: 'rgba(248, 113, 113, 0.45)',
  },
  success: {
    backgroundColor: 'rgba(6, 95, 70, 0.95)',
    borderColor: 'rgba(52, 211, 153, 0.45)',
  },
  info: {
    backgroundColor: 'rgba(49, 46, 129, 0.95)',
    borderColor: 'rgba(129, 140, 248, 0.45)',
  },
} as const;

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const message = useToastStore((state) => state.message);
  const type = useToastStore((state) => state.type);
  const dismiss = useToastStore((state) => state.dismiss);

  if (!message) {
    return null;
  }

  const palette = TYPE_STYLES[type];

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 12 }]}>
      <Pressable onPress={dismiss} style={[styles.toast, palette]}>
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
