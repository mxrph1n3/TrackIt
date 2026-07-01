import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useHealthTheme } from '../../../hooks/useHealthTheme';

type HealthScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
};

export function HealthScreenHeader({ title, subtitle, onBack, rightSlot }: HealthScreenHeaderProps) {
  const healthTheme = useHealthTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginBottom: 20,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        backBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: healthTheme.card,
          borderWidth: 1,
          borderColor: healthTheme.cardBorder,
          alignItems: 'center',
          justifyContent: 'center',
        },
        backPlaceholder: {
          width: 40,
          height: 40,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: 8,
        },
        right: {
          width: 40,
          alignItems: 'flex-end',
        },
        title: {
          fontSize: 20,
          fontWeight: '800',
          color: healthTheme.ink,
          letterSpacing: -0.3,
        },
        subtitle: {
          marginTop: 2,
          fontSize: 13,
          fontWeight: '500',
          color: healthTheme.slate,
        },
      }),
    [healthTheme],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
            <ChevronLeft color={healthTheme.ink} size={22} strokeWidth={2.4} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.right}>{rightSlot ?? <View style={styles.backPlaceholder} />}</View>
      </View>
    </View>
  );
}
