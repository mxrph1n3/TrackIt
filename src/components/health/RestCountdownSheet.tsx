import { BlurView } from 'expo-blur';
import { Text, View } from 'react-native';

import { supportsNativeBlur } from '../../lib/platform/blur';
import { GlassPanel } from '../GlassPanel';

function formatRest(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type RestCountdownSheetProps = {
  visible: boolean;
  secondsRemaining: number;
  restTargetSeconds: number;
};

export function RestCountdownSheet({
  visible,
  secondsRemaining,
  restTargetSeconds,
}: RestCountdownSheetProps) {
  if (!visible) return null;

  const progress = restTargetSeconds > 0 ? 1 - secondsRemaining / restTargetSeconds : 0;

  return (
    <View className="absolute inset-x-0 bottom-0 z-20">
      {supportsNativeBlur() ? (
        <BlurView
          intensity={30}
          tint="light"
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }}
        >
          <GlassPanel borderRadius={0} style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <View className="items-center px-6 pb-8 pt-5">
              <View className="mb-4 h-1 w-10 rounded-full bg-obsidian-border" />
              <Text className="text-[11px] font-bold uppercase tracking-widest text-ethereal-slate">
                Rest between sets
              </Text>
              <Text className="mt-2 text-5xl font-black text-obsidian-primary">
                {formatRest(secondsRemaining)}
              </Text>
              <View className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <View
                  className="h-full rounded-full bg-obsidian-primary"
                  style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
                />
              </View>
              <Text className="mt-3 text-xs text-ethereal-slate">
                Recommended 90–120 seconds · 70% 1RM
              </Text>
            </View>
          </GlassPanel>
        </BlurView>
      ) : (
        <GlassPanel borderRadius={0} style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View className="items-center px-6 pb-8 pt-5">
            <View className="mb-4 h-1 w-10 rounded-full bg-obsidian-border" />
            <Text className="text-[11px] font-bold uppercase tracking-widest text-ethereal-slate">
              Rest between sets
            </Text>
            <Text className="mt-2 text-5xl font-black text-obsidian-primary">
              {formatRest(secondsRemaining)}
            </Text>
            <View className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <View
                className="h-full rounded-full bg-obsidian-primary"
                style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
              />
            </View>
            <Text className="mt-3 text-xs text-ethereal-slate">
              Recommended 90–120 seconds · 70% 1RM
            </Text>
          </View>
        </GlassPanel>
      )}
    </View>
  );
}
