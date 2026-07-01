import { Clock } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useHealthStore } from '../../stores/useHealthStore';
import { GlassPanel } from '../GlassPanel';

export function LastSessionWidget() {
  const lastSession = useHealthStore((s) => s.lastSession);

  return (
    <GlassPanel borderRadius={20}>
      <View className="flex-row items-center p-4">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-obsidian-primary/30 bg-obsidian-primary/10">
          <Clock color="#775DD8" size={18} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
            Last workout
          </Text>
          <Text className="mt-1 text-sm font-semibold text-ethereal-ink">
            {lastSession.title} · {lastSession.relativeDay} · {lastSession.durationMinutes} min ·
            +{lastSession.xpEarned} XP
          </Text>
        </View>
      </View>
    </GlassPanel>
  );
}
