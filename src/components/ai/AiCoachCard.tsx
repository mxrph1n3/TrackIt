import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Brain, RefreshCw, Sparkles } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFeatureGate } from '../../hooks/useFeatureGate';
import { useAiCoach } from '../../hooks/useAiCoach';
import { PremiumBadge } from '../paywall/PremiumBadge';
import { BRAND, RADIUS } from '../../theme/designTokens';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

type AiCoachCardProps = {
  /** Reserved for future auto-fetch on mount. */
  autoLoad?: boolean;
};

export function AiCoachCard({ autoLoad: _autoLoad = false }: AiCoachCardProps) {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const { isPro, requirePro } = useFeatureGate('ai_coach');
  const { advice, isLoading, error, analyze } = useAiCoach();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: { marginBottom: 14 },
        gradient: {
          padding: 18,
          borderRadius: RADIUS.inset,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        title: {
          fontSize: 15,
          fontWeight: '800',
          color: theme.textPrimary,
          letterSpacing: 0.2,
        },
        subtitle: {
          fontSize: 11,
          fontWeight: '600',
          color: theme.textMuted,
          marginBottom: 14,
        },
        refreshButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: surfaces.chip,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        },
        messageBox: {
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: surfaces.inset,
          padding: 14,
        },
        placeholder: {
          fontSize: 13,
          lineHeight: 20,
          color: theme.textSecondary,
        },
        adviceScroll: { maxHeight: 280 },
        adviceText: {
          fontSize: 13,
          lineHeight: 21,
          color: theme.textPrimary,
        },
        errorText: {
          fontSize: 13,
          lineHeight: 20,
          color: '#F59E0B',
        },
        primaryButton: {
          marginTop: 12,
          borderRadius: 14,
          backgroundColor: BRAND.primary,
          paddingVertical: 12,
          alignItems: 'center',
        },
        primaryButtonLabel: {
          fontSize: 13,
          fontWeight: '800',
          color: surfaces.onPrimary,
        },
        retryButton: { marginTop: 10, alignSelf: 'flex-start' },
        retryLabel: {
          fontSize: 12,
          fontWeight: '700',
          color: theme.primaryNeon,
        },
        pressed: { opacity: 0.85 },
      }),
    [isDark, surfaces, theme],
  );

  const handleAnalyze = () => {
    requirePro(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void analyze();
    });
  };

  const gradientColors = isDark
    ? (['rgba(119, 93, 216, 0.22)', 'rgba(15, 15, 25, 0.55)'] as const)
    : (['rgba(119, 93, 216, 0.14)', 'rgba(255,255,255,0.55)'] as const);

  return (
    <GlassPanel borderRadius={RADIUS.inset} style={styles.shell}>
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Brain color={BRAND.primary} size={18} strokeWidth={2.2} />
            <Text style={styles.title}>AI Coach</Text>
            {!isPro ? <PremiumBadge /> : null}
            <Sparkles color={BRAND.primaryLight} size={14} />
          </View>
          <Pressable
            onPress={handleAnalyze}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Refresh AI Coach analysis"
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
          >
            {isLoading ? (
              <ActivityIndicator color={BRAND.primary} size="small" />
            ) : (
              <RefreshCw color={BRAND.primary} size={16} strokeWidth={2.2} />
            )}
          </Pressable>
        </View>

        <Text style={styles.subtitle}>Battle plan from your live logs · Gemini Flash</Text>

        {error ? (
          <View style={styles.messageBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={handleAnalyze} style={styles.retryButton}>
              <Text style={styles.retryLabel}>Try again</Text>
            </Pressable>
          </View>
        ) : advice ? (
          <ScrollView style={styles.adviceScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <Text style={styles.adviceText} selectable>
              {advice}
            </Text>
          </ScrollView>
        ) : (
          <View style={styles.messageBox}>
            <Text style={styles.placeholder}>
              {isPro
                ? "Tap refresh to generate a compact CLASS OS dashboard and today's quests from your tasks, habits, workouts, nutrition, and finance logs."
                : 'TrackIt Pro unlocks AI Coach — personalized guidance across every module in your life OS.'}
            </Text>
            <Pressable onPress={handleAnalyze} style={styles.primaryButton}>
              <Text style={styles.primaryButtonLabel}>
                {isPro ? 'Generate battle plan' : 'Unlock AI Coach'}
              </Text>
            </Pressable>
          </View>
        )}
      </LinearGradient>
    </GlassPanel>
  );
}
