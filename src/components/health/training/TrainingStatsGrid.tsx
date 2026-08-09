import { Dumbbell, Hourglass, Medal, TrendingUp } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useHealthStore } from '../../../stores/useHealthStore';
import { PremiumCard } from '../ui/PremiumCard';

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const styles = useHealthStyles((ht) => ({
    tile: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: ht.accentSoft,
      paddingVertical: 12,
      paddingHorizontal: 6,
      alignItems: 'center',
    },
    iconWrap: {
      marginBottom: 6,
    },
    tileValue: {
      fontSize: 18,
      fontWeight: '900',
      color: ht.ink,
      letterSpacing: -0.4,
    },
    tileLabel: {
      marginTop: 2,
      fontSize: 9,
      fontWeight: '700',
      color: ht.slate,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textAlign: 'center',
    },
  }));

  return (
    <View style={styles.tile}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

export function TrainingStatsGrid() {
  const { t } = useTranslation();
  const stats = useHealthStore((s) => s.lifetimeStats);
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles(() => ({
    grid: {
      flexDirection: 'row',
      gap: 8,
    },
  }));

  const hours = Math.round(stats.totalMinutes / 60);
  const volumeT = (stats.totalTonnageKg / 1000).toFixed(0);
  const prCount = stats.personalRecordCount;

  return (
    <PremiumCard padding={14}>
      <View style={styles.grid}>
        <StatTile
          icon={<Dumbbell color={healthTheme.accent} size={16} />}
          label={t('health.stats.workouts')}
          value={String(stats.totalWorkouts)}
        />
        <StatTile
          icon={<Hourglass color={healthTheme.accent} size={16} />}
          label={t('health.stats.hours')}
          value={String(hours)}
        />
        <StatTile
          icon={<TrendingUp color={healthTheme.accent} size={16} />}
          label={t('health.stats.volume')}
          value={`${volumeT}t`}
        />
        <StatTile
          icon={<Medal color={healthTheme.accent} size={16} />}
          label={t('health.stats.prs')}
          value={String(prCount)}
        />
      </View>
    </PremiumCard>
  );
}
