import { Search } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuHeaderButton } from '../../navigation/MenuHeaderButton';
import { useTheme } from '../../../theme/ThemeContext';

type StatisticsOverviewHeaderProps = {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
};

export function StatisticsOverviewHeader({ onMenuPress, onSearchPress }: StatisticsOverviewHeaderProps) {
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
        iconButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.cardFrosted,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
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

      <Text style={styles.title}>Statistics Overview</Text>

      <Pressable
        onPress={onSearchPress}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="Search statistics"
      >
        <Search color={theme.textPrimary} size={20} strokeWidth={1.8} />
      </Pressable>
    </View>
  );
}
