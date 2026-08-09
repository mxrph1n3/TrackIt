import { AlertTriangle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GlassPanel } from '../GlassPanel';

type DomsDelayBannerProps = {
  visible: boolean;
  onDelay: () => void;
  onDismiss: () => void;
};

export function DomsDelayBanner({ visible, onDelay, onDismiss }: DomsDelayBannerProps) {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <GlassPanel borderRadius={18} style={{ marginBottom: 16 }}>
      <View className="flex-row gap-3 p-4">
        <AlertTriangle color="#F59E0B" size={20} />
        <View className="flex-1">
          <Text className="text-sm font-bold text-ethereal-ink">{t('health.severeSoreness')}</Text>
          <Text className="mt-1 text-xs leading-5 text-ethereal-slate">
            {t('health.domsBody')}
          </Text>
          <View className="mt-3 flex-row gap-2">
            <Pressable
              onPress={onDelay}
              className="rounded-xl bg-obsidian-primary/15 px-3 py-2 active:opacity-85"
            >
              <Text className="text-xs font-bold text-obsidian-primary">{t('health.postponeDay')}</Text>
            </Pressable>
            <Pressable onPress={onDismiss} className="rounded-xl bg-white/5 px-3 py-2 active:opacity-85">
              <Text className="text-xs font-semibold text-ethereal-slate">{t('health.continue')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </GlassPanel>
  );
}
