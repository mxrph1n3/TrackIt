import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { getDashboardTierTheme, tierCapsuleShadow } from '../../lib/dashboard/tierTheme';

type TierBadgeProps = {
  level: number;
  compact?: boolean;
};

export function TierBadge({ level, compact = false }: TierBadgeProps) {
  const theme = getDashboardTierTheme(level);
  const label = `TIER ${theme.code}`;

  const text = (
    <Text
      className={`font-black uppercase ${compact ? 'text-[9px] tracking-[0.14em]' : 'text-[10px] tracking-[0.18em]'}`}
      style={{ color: theme.useGoldGradient ? '#FFF7CC' : theme.primary }}
    >
      {label}
    </Text>
  );

  if (theme.useGoldGradient) {
    return (
      <LinearGradient
        colors={['#FFD700', '#F59E0B', '#FFD700']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          {
            borderRadius: 999,
            paddingHorizontal: compact ? 8 : 10,
            paddingVertical: compact ? 3 : 4,
            borderWidth: 1,
            borderColor: theme.capsuleBorder,
          },
          tierCapsuleShadow(theme),
        ]}
      >
        {text}
      </LinearGradient>
    );
  }

  return (
    <View
      className="rounded-full"
      style={[
        {
          paddingHorizontal: compact ? 8 : 10,
          paddingVertical: compact ? 3 : 4,
          backgroundColor: theme.capsuleBackground,
          borderWidth: 1,
          borderColor: theme.capsuleBorder,
        },
        tierCapsuleShadow(theme),
      ]}
    >
      {text}
    </View>
  );
}
