import { LinearGradient } from 'expo-linear-gradient';
import { Lightbulb } from 'lucide-react-native';
import { Text, View } from 'react-native';

type FinanceTipsCardProps = {
  tips: string[];
};

/** Rule-based finance suggestions — not an LLM. */
export function FinanceTipsCard({ tips }: FinanceTipsCardProps) {
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
            Smart tips
          </Text>
        </View>
        <Text className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-ethereal-slate/80">
          Based on your spending patterns
        </Text>

        {tips.map((tip, index) => (
          <View
            key={`${index}-${tip.slice(0, 12)}`}
            className={`rounded-2xl border border-white/5 bg-black/20 px-4 py-3 ${
              index < tips.length - 1 ? 'mb-3' : ''
            }`}
          >
            <Text className="text-sm leading-5 text-ethereal-ink/90">{tip}</Text>
          </View>
        ))}
      </LinearGradient>
    </View>
  );
}
