import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

import { triggerHaptic } from '../../lib/platform/haptics';
import { useTheme } from '../../theme/ThemeContext';

export type AuthMode = 'sign-in' | 'sign-up';

type AuthModeTabsProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

export function AuthModeTabs({ mode, onChange }: AuthModeTabsProps) {
  const { theme, isDark } = useTheme();

  const handlePress = (next: AuthMode) => {
    if (next === mode) {
      return;
    }
    void triggerHaptic('selection');
    onChange(next);
  };

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(119, 93, 216, 0.06)',
          borderColor: isDark ? 'rgba(149, 128, 232, 0.2)' : 'rgba(119, 93, 216, 0.1)',
        },
      ]}
    >
      {(['sign-in', 'sign-up'] as const).map((tab) => {
        const active = mode === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => handlePress(tab)}
            style={styles.tabHit}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            {active ? (
              <Animated.View
                entering={FadeIn.duration(180)}
                layout={Layout.springify().damping(18).stiffness(220)}
                style={[
                  styles.tabActive,
                  {
                    backgroundColor: isDark ? 'rgba(149, 128, 232, 0.28)' : '#FFFFFF',
                    shadowColor: '#775DD8',
                  },
                ]}
              />
            ) : null}
            <Text
              style={[
                styles.tabLabel,
                { color: active ? theme.ink : theme.textMuted },
                active && styles.tabLabelActive,
              ]}
            >
              {tab === 'sign-in' ? 'Sign in' : 'Create account'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    marginBottom: 22,
  },
  tabHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabActive: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
