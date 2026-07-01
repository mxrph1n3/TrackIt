import { BarChart3, BookOpen, History, PlusCircle } from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';

import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

const ACTIONS = [
  { id: 'create', label: 'Create program', icon: PlusCircle },
  { id: 'history', label: 'History', icon: History },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'exercises', label: 'Exercises', icon: BookOpen },
] as const;

function showSoon(title: string) {
  Alert.alert(title, 'This section is coming in the next TrackIt update.');
}

export function WorkoutQuickActions() {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);

  return (
    <GlassPanel borderRadius={22} style={{ marginBottom: 16 }}>
      <View className="p-4">
        <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
          Quick actions
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ACTIONS.map(({ id, label, icon: Icon }) => (
            <Pressable
              key={id}
              onPress={() => showSoon(label)}
              className="min-w-[47%] flex-1 flex-row items-center gap-2 rounded-2xl border border-obsidian-border px-3 py-3 active:opacity-85"
              style={{ backgroundColor: surfaces.chip }}
            >
              <Icon color="#775DD8" size={16} />
              <Text className="flex-1 text-xs font-semibold text-ethereal-ink">{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </GlassPanel>
  );
}
