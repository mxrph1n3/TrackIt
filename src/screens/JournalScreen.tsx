import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { JournalEditSheet } from '../components/planner/JournalEditSheet';
import { ZenithPrimeCard } from '../components/finance/ZenithPrimeCard';
import { GlassPanel } from '../components/GlassPanel';
import { IsolatedScreenLayout } from '../components/layout/IsolatedScreenShell';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useFinanceLiveData } from '../hooks/useFinanceLiveData';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { useProgression } from '../hooks/useProgression';
import type { JournalCategory } from '../lib/journal/journalService';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { useTheme } from '../theme/ThemeContext';
import { toDayKey } from '../utils/plannerDates';

const CATEGORY_COLORS: Record<JournalCategory, string> = {
  Mindset: '#6366F1',
  Health: '#10B981',
  Motivation: '#F59E0B',
  Reflection: '#775DD8',
};

export function JournalScreen() {
  const { theme } = useTheme();
  const closeModule = useProfileModuleStore((state) => state.closeModule);
  const { entries, isLoading, refresh, saveEntry } = useJournalEntries();
  const { data: financeOverview } = useFinanceLiveData();
  const { profileStats } = useProgression();
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.dayKey === selectedDayKey) ?? null,
    [entries, selectedDayKey],
  );

  const openEditor = (dayKey: string) => {
    setSelectedDayKey(dayKey);
    setIsEditorOpen(true);
  };

  const openTodayEditor = () => {
    openEditor(toDayKey(new Date()));
  };

  return (
    <>
      <IsolatedScreenLayout
        header={<ScreenHeader title="JOURNAL" subtitle="Daily Reflection" onBack={closeModule} />}
        scrollProps={{
          refreshControl: (
            <RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor={theme.primary} />
          ),
        }}
      >
        <ZenithPrimeCard
          overview={financeOverview}
          cardholder={profileStats.username.toUpperCase()}
        />

        <Pressable
          onPress={openTodayEditor}
          className="mb-4 rounded-2xl px-4 py-3 active:opacity-85"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-center text-sm font-bold text-ethereal-ink">+ New entry for today</Text>
        </Pressable>

        {isLoading && entries.length === 0 ? (
          <ActivityIndicator color={theme.primary} className="py-16" />
        ) : null}

        {!isLoading && entries.length === 0 ? (
          <GlassPanel borderRadius={24}>
            <Text className="p-5 text-sm leading-6 text-ethereal-slate">
              No journal entries yet. Capture your mindset, health wins, and motivation here.
            </Text>
          </GlassPanel>
        ) : null}

        <View className="gap-3">
          {entries.map((entry) => (
            <Pressable key={entry.id} onPress={() => openEditor(entry.dayKey)}>
              <GlassPanel borderRadius={22}>
                <View className="gap-2 p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-bold uppercase tracking-[0.2em] text-ethereal-slate">
                      {entry.dateLabel}
                    </Text>
                    <Text className="text-xs text-ethereal-slate">{entry.timeLabel}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="rounded-full px-2 py-0.5"
                      style={{ backgroundColor: `${CATEGORY_COLORS[entry.category]}22` }}
                    >
                      <Text
                        className="text-[10px] font-bold uppercase tracking-[0.14em]"
                        style={{ color: CATEGORY_COLORS[entry.category] }}
                      >
                        {entry.category}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm leading-6 text-ethereal-ink" numberOfLines={4}>
                    {entry.body}
                  </Text>
                </View>
              </GlassPanel>
            </Pressable>
          ))}
        </View>
      </IsolatedScreenLayout>

      <JournalEditSheet
        visible={isEditorOpen}
        initialBody={selectedEntry?.body ?? ''}
        onClose={() => setIsEditorOpen(false)}
        onSave={async (body) => {
          if (!selectedDayKey) {
            return;
          }
          await saveEntry(selectedDayKey, body);
        }}
      />
    </>
  );
}
