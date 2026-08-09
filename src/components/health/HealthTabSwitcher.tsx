import { CalendarDays } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import { triggerHaptic } from '../../lib/platform/haptics';
import type { HealthTabId } from '../../types/health';
import { MenuHeaderButton } from '../navigation/MenuHeaderButton';

const TABS: HealthTabId[] = ['workouts', 'nutrition'];

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
  const { t } = useTranslation();
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((ht) => ({
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
      color: ht.ink,
      letterSpacing: -0.8,
      marginBottom: 4,
    },
    screenSubtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: ht.slate,
    },
    calendarBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: ht.card,
      borderWidth: 1,
      borderColor: ht.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: ht.card,
      borderRadius: 16,
      padding: 4,
      borderWidth: 1,
      borderColor: ht.cardBorder,
      marginBottom: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: ht.accentSoft,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
      color: ht.slate,
    },
    tabTextActive: {
      color: ht.ink,
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
            {activeTab === 'workouts' ? t('health.workouts') : t('health.nutrition')}
          </Text>
          <Text style={styles.screenSubtitle}>
            {activeTab === 'workouts' ? t('health.todaysTraining') : t('health.todaysSummary')}
          </Text>
        </View>
        {activeTab === 'nutrition' ? (
          <Pressable
            onPress={() => {
              void triggerHaptic('selection');
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
        {TABS.map((tabId) => {
          const isActive = activeTab === tabId;
          return (
            <Pressable
              key={tabId}
              onPress={() => {
                void triggerHaptic('selection');
                onTabChange(tabId);
              }}
              style={[styles.tab, isActive && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tabId === 'workouts' ? t('health.workouts') : t('health.nutrition')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
