import { BarChart3, BookOpen, History, PlusCircle } from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

const ACTIONS = [
  { id: 'create', key: 'health.quickActions.createProgram', icon: PlusCircle },
  { id: 'history', key: 'health.quickActions.history', icon: History },
  { id: 'stats', key: 'health.quickActions.stats', icon: BarChart3 },
  { id: 'exercises', key: 'health.quickActions.exercises', icon: BookOpen },
] as const;

function showSoon(title: string, body: string) {
  Alert.alert(title, body);
}

export function WorkoutQuickActions() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);

  return (
    <GlassPanel borderRadius={22} style={{ marginBottom: 16 }}>
      <View className="p-4">
        <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
          {t('health.quickActionsTitle')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ACTIONS.map(({ id, key, icon: Icon }) => {
            const label = t(key);
            return (
              <Pressable
                key={id}
                onPress={() => showSoon(label, t('health.comingSoon'))}
                className="min-w-[47%] flex-1 flex-row items-center gap-2 rounded-2xl border border-obsidian-border px-3 py-3 active:opacity-85"
                style={{ backgroundColor: surfaces.chip }}
              >
                <Icon color="#775DD8" size={16} />
                <Text className="flex-1 text-xs font-semibold text-ethereal-ink">{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </GlassPanel>
  );
}
