import { LinearGradient } from 'expo-linear-gradient';
import { Lightbulb } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { formatFinanceTip } from '../../i18n/helpers';
import type { FinanceTip } from '../../types/finance';

type FinanceTipsCardProps = {
  tips: FinanceTip[];
};

/** Rule-based finance suggestions — not an LLM. */
export function FinanceTipsCard({ tips }: FinanceTipsCardProps) {
  const { t } = useTranslation();

  return (
    <View className="overflow-hidden rounded-3xl border border-obsidian-primary/25">
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.22)', 'rgba(168, 85, 247, 0.12)', 'rgba(7, 7, 10, 0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        <View className="mb-1 flex-row items-center gap-2">
          <Lightbulb color="#775DD8" size={18} />
          <Text className="text-[11px] font-bold uppercase tracking-widest text-obsidian-primary">
            {t('finance.smartTips')}
          </Text>
        </View>
        <Text className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-ethereal-slate/80">
          {t('finance.smartTipsHint')}
        </Text>

        {tips.map((tip, index) => {
          const text = formatFinanceTip(t, tip);
          return (
            <View
              key={`${tip.id}-${index}`}
              className={`rounded-2xl border border-white/5 bg-black/20 px-4 py-3 ${
                index < tips.length - 1 ? 'mb-3' : ''
              }`}
            >
              <Text className="text-sm leading-5 text-ethereal-ink/90">{text}</Text>
            </View>
          );
        })}
      </LinearGradient>
    </View>
  );
}
