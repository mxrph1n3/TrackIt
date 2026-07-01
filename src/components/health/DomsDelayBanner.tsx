import { AlertTriangle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { GlassPanel } from '../GlassPanel';

type DomsDelayBannerProps = {
  visible: boolean;
  onDelay: () => void;
  onDismiss: () => void;
};

export function DomsDelayBanner({ visible, onDelay, onDismiss }: DomsDelayBannerProps) {
  if (!visible) return null;

  return (
    <GlassPanel borderRadius={18} style={{ marginBottom: 16 }}>
      <View className="flex-row gap-3 p-4">
        <AlertTriangle color="#F59E0B" size={20} />
        <View className="flex-1">
          <Text className="text-sm font-bold text-ethereal-ink">Severe muscle soreness?</Text>
          <Text className="mt-1 text-xs leading-5 text-ethereal-slate">
            With significant DOMS, postpone your workout and let muscles recover.
          </Text>
          <View className="mt-3 flex-row gap-2">
            <Pressable
              onPress={onDelay}
              className="rounded-xl bg-obsidian-primary/15 px-3 py-2 active:opacity-85"
            >
              <Text className="text-xs font-bold text-obsidian-primary">Postpone day</Text>
            </Pressable>
            <Pressable onPress={onDismiss} className="rounded-xl bg-white/5 px-3 py-2 active:opacity-85">
              <Text className="text-xs font-semibold text-ethereal-slate">Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </GlassPanel>
  );
}
