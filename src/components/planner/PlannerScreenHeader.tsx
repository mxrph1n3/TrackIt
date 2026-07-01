import { Bell } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { formatPlannerHeaderDate } from '../../utils/plannerDates';
import { BRAND } from '../../theme/designTokens';
import { MenuHeaderButton } from '../navigation/MenuHeaderButton';
import { PLANNER_COPY } from './plannerTheme';

type PlannerScreenHeaderProps = {
  selectedDayKey: string;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onTodayPress?: () => void;
};

export function PlannerScreenHeader({
  selectedDayKey,
  onMenuPress,
  onNotificationsPress,
  onTodayPress,
}: PlannerScreenHeaderProps) {
  const { theme, surfaces } = usePlannerTheme();
  const dateLine = formatPlannerHeaderDate(selectedDayKey);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginBottom: 20,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        },
        iconButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: surfaces.chipStrong,
          borderWidth: 1,
          borderColor: surfaces.border,
        },
        titleBlock: {
          gap: 6,
        },
        screenTitle: {
          fontSize: 34,
          fontWeight: '900',
          letterSpacing: 1.2,
          color: theme.textPrimary,
        },
        dateLine: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.textSecondary,
          lineHeight: 20,
        },
        pressed: {
          opacity: 0.88,
        },
      }),
    [surfaces, theme],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <MenuHeaderButton onPress={onMenuPress} />

        <Pressable
          onPress={onNotificationsPress}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Bell color={BRAND.primary} size={20} strokeWidth={2} />
        </Pressable>
      </View>

      <Pressable onPress={onTodayPress} disabled={!onTodayPress} style={styles.titleBlock}>
        <Text style={styles.screenTitle}>{PLANNER_COPY.screenTitle}</Text>
        <Text style={styles.dateLine}>{dateLine}</Text>
      </Pressable>
    </View>
  );
}
