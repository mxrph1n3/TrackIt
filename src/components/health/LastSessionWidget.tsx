import { Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useHealthStore } from '../../stores/useHealthStore';
import { getWorkoutTracks } from '../../constants/workoutPrograms';
import { tRelativeDay, tWorkoutFocusName } from '../../i18n/helpers';
import { GlassPanel } from '../GlassPanel';

export function LastSessionWidget() {
  const { t } = useTranslation();
  const lastSession = useHealthStore((s) => s.lastSession);
  const localizedTitle = (() => {
    for (const track of getWorkoutTracks()) {
      const translated = tWorkoutFocusName(t, lastSession.title, track.days, track.id);
      if (translated !== lastSession.title) return translated;
    }
    return lastSession.title;
  })();

  return (
    <GlassPanel borderRadius={20}>
      <View className="flex-row items-center p-4">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-obsidian-primary/30 bg-obsidian-primary/10">
          <Clock color="#775DD8" size={18} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
            {t('health.lastWorkout')}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-ethereal-ink">
            {t('health.lastSessionMeta', {
              title: localizedTitle,
              day: tRelativeDay(t, lastSession.relativeDay),
              minutes: lastSession.durationMinutes,
              xp: lastSession.xpEarned,
            })}
          </Text>
        </View>
      </View>
    </GlassPanel>
  );
}
