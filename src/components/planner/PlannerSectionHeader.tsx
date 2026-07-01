import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';

type PlannerSectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function PlannerSectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: PlannerSectionHeaderProps) {
  const { theme } = usePlannerTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 14,
        },
        copy: {
          flex: 1,
          paddingRight: 12,
        },
        title: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 2.4,
          textTransform: 'uppercase',
          color: theme.textPrimary,
        },
        subtitle: {
          marginTop: 4,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textMuted,
        },
        action: {
          fontSize: 12,
          fontWeight: '700',
          color: theme.textMuted,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
