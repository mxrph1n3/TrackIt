import { Pressable, ScrollView, Text } from 'react-native';

import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { triggerHaptic } from '../../../lib/platform/haptics';

export type DateRibbonDay = {
  key: string;
  weekday: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
};

type HealthDateRibbonProps = {
  days: DateRibbonDay[];
  onSelect: (index: number) => void;
};

export function HealthDateRibbon({ days, onSelect }: HealthDateRibbonProps) {
  const styles = useHealthStyles((t) => ({
    content: {
      gap: 10,
      paddingVertical: 4,
      marginBottom: 20,
    },
    chip: {
      width: 52,
      height: 68,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipActive: {
      backgroundColor: t.accent,
      borderColor: t.accent,
    },
    weekday: {
      fontSize: 11,
      fontWeight: '600',
      color: t.slate,
      marginBottom: 4,
    },
    dayNum: {
      fontSize: 17,
      fontWeight: '800',
      color: t.ink,
    },
    textActive: {
      color: t.ink,
    },
  }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {days.map((day, index) => {
        const active = day.isSelected || day.isToday;
        return (
          <Pressable
            key={day.key}
            onPress={() => {
              void triggerHaptic('selection');
              onSelect(index);
            }}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.weekday, active && styles.textActive]}>{day.weekday}</Text>
            <Text style={[styles.dayNum, active && styles.textActive]}>{day.dayNumber}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
