import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { triggerHaptic } from '../../lib/platform/haptics';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useTheme } from '../../theme/ThemeContext';
import { DismissibleOverlay } from '../ui/DismissibleOverlay';

const LIGHT_PANEL_GRADIENT = ['rgba(255,255,255,0.98)', 'rgba(243,245,250,0.96)', '#F3F5FA'] as const;
const DARK_PANEL_GRADIENT = ['rgba(28, 24, 48, 0.98)', 'rgba(22, 18, 38, 0.96)', '#12101F'] as const;

export function LevelUpModal() {
  const insets = useAppSafeAreaInsets();
  const { isDark } = useTheme();
  const celebration = useGamificationStore((s) => s.levelUpCelebration);
  const dismissLevelUp = useGamificationStore((s) => s.dismissLevelUp);

  useEffect(() => {
    if (celebration) {
      void triggerHaptic('success');
    }
  }, [celebration]);

  if (!celebration) {
    return null;
  }

  return (
    <DismissibleOverlay
      visible
      onDismiss={dismissLevelUp}
      placement="center"
      isolateContent
      accessibilityLabel="Dismiss level up celebration"
      contentStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="w-full overflow-hidden rounded-3xl border border-[rgba(168,85,247,0.35)]">
        <LinearGradient
          colors={isDark ? [...DARK_PANEL_GRADIENT] : [...LIGHT_PANEL_GRADIENT]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ padding: 28 }}
        >
          <View className="items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full border border-obsidian-primary/50 bg-obsidian-primary/20">
              <Sparkles color="#775DD8" size={30} strokeWidth={2.2} />
            </View>

            <Text className="text-[11px] font-bold uppercase tracking-[0.4em] text-obsidian-primary">
              Level Up
            </Text>
            <Text
              className="mt-3 text-center text-4xl font-black text-ethereal-ink"
              style={{
                textShadowColor: 'rgba(119, 93, 216, 0.25)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 12,
              }}
            >
              LEVEL {celebration.newLevel}
            </Text>
            <Text className="mt-3 text-center text-sm text-ethereal-slate">
              {celebration.actionName} pushed you to the next tier.
            </Text>

            <Pressable
              onPress={dismissLevelUp}
              className="mt-8 w-full active:opacity-85"
              accessibilityRole="button"
              accessibilityLabel="Dismiss level up celebration"
            >
              <LinearGradient
                colors={['#9580E8', '#775DD8', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text className="text-sm font-bold text-white">Continue</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </DismissibleOverlay>
  );
}
