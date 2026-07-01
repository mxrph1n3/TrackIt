import * as Haptics from 'expo-haptics';
import { CalendarDays } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import type { HealthTabId } from '../../types/health';
import { MenuHeaderButton } from '../navigation/MenuHeaderButton';

const TABS: { id: HealthTabId; label: string }[] = [
  { id: 'workouts', label: 'Workouts' },
  { id: 'nutrition', label: 'Nutrition' },
];

type HealthTabSwitcherProps = {
  activeTab: HealthTabId;
  onTabChange: (tab: HealthTabId) => void;
  onCalendarPress?: () => void;
  onMenuPress?: () => void;
};

export function HealthTabSwitcher({
  activeTab,
  onTabChange,
  onCalendarPress,
  onMenuPress,
}: HealthTabSwitcherProps) {
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((t) => ({
    wrap: {
      marginBottom: 8,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 4,
    },
    menuSlot: {
      marginTop: 2,
    },
    titleCopy: {
      flex: 1,
      paddingRight: 12,
    },
    screenTitle: {
      fontSize: 32,
      fontWeight: '900',
      color: t.ink,
      letterSpacing: -0.8,
      marginBottom: 4,
    },
    screenSubtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: t.slate,
    },
    calendarBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 4,
      borderWidth: 1,
      borderColor: t.cardBorder,
      marginBottom: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: t.accentSoft,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
      color: t.slate,
    },
    tabTextActive: {
      color: t.ink,
    },
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.menuSlot}>
          <MenuHeaderButton onPress={onMenuPress} />
        </View>
        <View style={styles.titleCopy}>
          <Text style={styles.screenTitle}>
            {activeTab === 'workouts' ? 'Workouts' : 'Nutrition'}
          </Text>
          <Text style={styles.screenSubtitle}>
            {activeTab === 'workouts' ? "Today's training" : "Today's summary"}
          </Text>
        </View>
        {activeTab === 'nutrition' ? (
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              onCalendarPress?.();
            }}
            style={styles.calendarBtn}
            hitSlop={8}
          >
            <CalendarDays color={healthTheme.ink} size={20} strokeWidth={2} />
          </Pressable>
        ) : (
          <View style={{ width: 40, height: 40 }} />
        )}
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                void Haptics.selectionAsync();
                onTabChange(tab.id);
              }}
              style={[styles.tab, isActive && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
