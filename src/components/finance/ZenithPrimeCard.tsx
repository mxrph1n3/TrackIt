import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CreditCard } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { formatMoneyCompact } from '../../constants/financeCategories';
import { navigateTab } from '../../navigation/navigationRef';
import { useProfileModuleStore } from '../../stores/useProfileModuleStore';
import { useTheme } from '../../theme/ThemeContext';
import type { FinanceOverview } from '../../types/finance';

type ZenithPrimeCardProps = {
  overview: FinanceOverview;
  cardholder: string;
};

const QUICK_ACTIONS = [
  { id: 'habits', label: 'Habit' },
  { id: 'focus', label: 'Focus' },
  { id: 'journal', label: 'Journal' },
  { id: 'stats', label: 'Stats' },
  { id: 'goals', label: 'Finance' },
] as const;

export function ZenithPrimeCard({ overview, cardholder }: ZenithPrimeCardProps) {
  const { theme } = useTheme();
  const openModule = useProfileModuleStore((s) => s.openModule);

  const handleAction = (id: (typeof QUICK_ACTIONS)[number]['id']) => {
    void Haptics.selectionAsync();
    switch (id) {
      case 'habits':
        openModule('habits');
        break;
      case 'focus':
        openModule('focus');
        break;
      case 'journal':
        openModule('journal');
        break;
      case 'stats':
        navigateTab('Analytics');
        break;
      case 'goals':
        openModule('finance');
        break;
      default:
        break;
    }
  };

  return (
    <View className="mb-5 overflow-hidden rounded-3xl">
      <LinearGradient
        colors={['#1E1B4B', '#312E81', '#4338CA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20, borderRadius: 24 }}
      >
        <View className="mb-6 flex-row items-start justify-between">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-200/70">
              Zenith Prime
            </Text>
            <Text className="mt-1 text-lg font-black text-white">{cardholder}</Text>
          </View>
          <CreditCard color="#C4B5FD" size={28} strokeWidth={1.6} />
        </View>

        <View
          className="mb-4 self-start rounded-md px-2 py-1"
          style={{ backgroundColor: 'rgba(251, 191, 36, 0.85)' }}
        >
          <View className="h-3 w-5 rounded-sm" style={{ backgroundColor: '#78350F' }} />
        </View>

        <Text className="text-lg font-bold tracking-[0.18em] text-white/90">
          4582 2456 7896 5412
        </Text>

        <View className="mt-4 flex-row items-end justify-between">
          <View>
            <Text className="text-[9px] font-bold uppercase tracking-widest text-indigo-200/60">
              Balance
            </Text>
            <Text className="mt-0.5 text-2xl font-black text-white">
              {formatMoneyCompact(overview.balance, overview.displayCurrency)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[9px] font-bold uppercase tracking-widest text-indigo-200/60">
              Valid Thru
            </Text>
            <Text className="mt-0.5 text-sm font-bold text-white/90">12/28</Text>
          </View>
        </View>
      </LinearGradient>

      <View
        className="flex-row justify-between rounded-b-3xl px-2 py-3"
        style={{ backgroundColor: `${theme.primary}10` }}
      >
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => handleAction(action.id)}
            className="flex-1 items-center active:opacity-80"
          >
            <Text className="text-[10px] font-bold" style={{ color: theme.primary }}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
