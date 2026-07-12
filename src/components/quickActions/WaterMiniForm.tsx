import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useProgression } from '../../hooks/useProgression';
import { triggerHaptic } from '../../lib/platform/haptics';
import { finalizeQuickActionSuccess } from '../../lib/quickActions/finalize';
import { insertWaterLog, toQuickActionErrorMessage } from '../../lib/quickActions/service';
import { ObsidianTheme } from '../../theme/obsidian';
import { WATER_PRESETS_ML } from '../../types/quickActionRecords';

type WaterMiniFormProps = {
  onSuccess: () => void;
  onBack: () => void;
};

function formatPresetLabel(amountMl: number): string {
  if (amountMl >= 1000) {
    return '1 L';
  }
  return `${amountMl} ml`;
}

export function WaterMiniForm({ onSuccess, onBack }: WaterMiniFormProps) {
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { awardXp } = useProgression();

  const handlePresetPress = async (amountMl: number) => {
    if (activePreset !== null) {
      return;
    }

    setActivePreset(amountMl);
    setError(null);

    try {
      void triggerHaptic('light');
      await insertWaterLog({ amountMl });
      await awardXp('FOOD_OR_WATER_LOG');
      await finalizeQuickActionSuccess(onSuccess);
    } catch (submitError) {
      setError(toQuickActionErrorMessage(submitError));
      setActivePreset(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Quick Water</Text>
      <Text style={styles.heading}>Log hydration</Text>
      <Text style={styles.subtitle}>Tap a preset to save instantly.</Text>

      <View style={styles.presetRow}>
        {WATER_PRESETS_ML.map((amountMl) => {
          const isSaving = activePreset === amountMl;

          return (
            <Pressable
              key={amountMl}
              onPress={() => void handlePresetPress(amountMl)}
              disabled={activePreset !== null}
              style={[styles.presetChip, isSaving && styles.presetChipActive]}
            >
              {isSaving ? (
                <ActivityIndicator color={ObsidianTheme.primary} size="small" />
              ) : (
                <Text style={styles.presetText}>{formatPresetLabel(amountMl)}</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  kicker: {
    color: ObsidianTheme.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heading: {
    color: ObsidianTheme.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  subtitle: {
    color: ObsidianTheme.textSecondary,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 18,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetChip: {
    minWidth: '30%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    minHeight: 56,
  },
  presetChipActive: {
    borderColor: 'rgba(168, 85, 247, 0.45)',
    backgroundColor: 'rgba(168, 85, 247, 0.14)',
  },
  presetText: {
    color: ObsidianTheme.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  error: {
    color: '#F87171',
    fontSize: 13,
    marginTop: 14,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 10,
  },
  backText: {
    color: ObsidianTheme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
