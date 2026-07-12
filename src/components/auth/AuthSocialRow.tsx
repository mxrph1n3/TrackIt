import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Apple } from 'lucide-react-native';

import { triggerHaptic } from '../../lib/platform/haptics';
import { useTheme } from '../../theme/ThemeContext';

type AuthSocialRowProps = {
  appleAvailable: boolean;
  disabled?: boolean;
  onGoogle: () => void;
  onApple: () => void;
};

export function AuthSocialRow({ appleAvailable, disabled, onGoogle, onApple }: AuthSocialRowProps) {
  const { theme, isDark } = useTheme();
  const shellBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.78)';
  const border = isDark ? 'rgba(149, 128, 232, 0.22)' : 'rgba(119, 93, 216, 0.12)';

  const handlePress = (action: () => void) => {
    void triggerHaptic('light');
    action();
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Quick access</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => handlePress(onGoogle)}
          disabled={disabled}
          style={[styles.chip, { backgroundColor: shellBg, borderColor: border, opacity: disabled ? 0.55 : 1 }]}
          accessibilityLabel="Sign in with Google"
        >
          <View style={styles.googleMark}>
            <Text style={styles.googleLetter}>G</Text>
          </View>
          <Text style={[styles.chipText, { color: theme.textPrimary }]}>Google</Text>
        </Pressable>

        {appleAvailable ? (
          <Pressable
            onPress={() => handlePress(onApple)}
            disabled={disabled}
            style={[styles.chip, { backgroundColor: shellBg, borderColor: border, opacity: disabled ? 0.55 : 1 }]}
            accessibilityLabel="Sign in with Apple"
          >
            <Apple color={theme.textPrimary} size={17} strokeWidth={2.2} />
            <Text style={[styles.chipText, { color: theme.textPrimary }]}>Apple</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 22,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  googleMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLetter: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4285F4',
  },
});
