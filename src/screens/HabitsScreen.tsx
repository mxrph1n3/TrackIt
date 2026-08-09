import { Target } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';

import { HabitCard } from '../components/habits/HabitCard';
import { GlassPanel } from '../components/GlassPanel';
import { IsolatedScreenLayout } from '../components/layout/IsolatedScreenShell';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useHabits } from '../hooks/useHabits';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { reportSyncError } from '../lib/sync/reportSyncError';
import { useTheme } from '../theme/ThemeContext';

export function HabitsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const closeModule = useProfileModuleStore((s) => s.closeModule);
  const { habits, isLoading, isMutating, refresh, toggleDay, addHabit } = useHabits();
  const [draftTitle, setDraftTitle] = useState('');

  const handleAddHabit = useCallback(async () => {
    if (!draftTitle.trim()) {
      return;
    }

    try {
      await addHabit(draftTitle);
      setDraftTitle('');
    } catch (error) {
      reportSyncError('Habits', error, t('toasts.habitCreateError'));
    }
  }, [addHabit, draftTitle]);

  const handleRefresh = () => {
    void refresh().catch((error) => {
      reportSyncError('Habits', error, t('toasts.habitRefreshError'));
    });
  };

  return (
    <IsolatedScreenLayout
      header={<ScreenHeader title={t('habits.title')} subtitle={t('habits.subtitle')} onBack={closeModule} />}
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={theme.primary} />
        ),
      }}
    >
      <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
        <View className="flex-row items-center gap-2 p-3">
          <TextInput
            value={draftTitle}
            onChangeText={setDraftTitle}
            placeholder={t('habits.placeholder')}
            placeholderTextColor={theme.textMuted}
            className="flex-1 px-3 py-3 text-base font-semibold"
            style={{ color: theme.textPrimary }}
            maxLength={64}
          />
          <Pressable
            onPress={() => void handleAddHabit()}
            className="rounded-2xl px-4 py-3 active:opacity-85"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-sm font-bold text-ethereal-ink">{t('habits.add')}</Text>
          </Pressable>
        </View>
      </GlassPanel>

      {isLoading && habits.length === 0 ? (
        <View className="items-center py-16">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}

      {!isLoading && habits.length === 0 ? (
        <GlassPanel borderRadius={24}>
          <View className="items-center p-8">
            <Target color={theme.primary} size={40} strokeWidth={2} />
            <Text className="mt-4 text-center text-base font-semibold" style={{ color: theme.textPrimary }}>
              {t('habits.empty')}
            </Text>
          </View>
        </GlassPanel>
      ) : null}

      {habits.map((item) => (
        <HabitCard
          key={item.habit.id}
          item={item}
          disabled={isMutating}
          onToggleDay={(habitId, dayKey, next) => {
            void toggleDay(habitId, dayKey, next).catch((error) => {
              console.warn('[HabitsScreen] toggle failed:', error);
            });
          }}
        />
      ))}
    </IsolatedScreenLayout>
  );
}
