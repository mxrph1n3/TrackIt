import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { MenuHeaderButton } from '../../navigation/MenuHeaderButton';
import { useTheme } from '../../../theme/ThemeContext';

type StatisticsOverviewHeaderProps = {
  onMenuPress?: () => void;
};

export function StatisticsOverviewHeader({ onMenuPress }: StatisticsOverviewHeaderProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          paddingHorizontal: 2,
        },
        spacer: {
          width: 40,
          height: 40,
        },
        title: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 2.8,
          textTransform: 'uppercase',
          color: theme.textPrimary,
          textAlign: 'center',
          flex: 1,
          marginHorizontal: 8,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.wrap}>
      <MenuHeaderButton onPress={onMenuPress} size={20} />

      <Text style={styles.title}>{t('analytics.statisticsOverview')}</Text>

      <View style={styles.spacer} />
    </View>
  );
}
