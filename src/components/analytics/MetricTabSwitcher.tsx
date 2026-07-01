import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ANALYTICS_TABS } from '../../constants/analyticsData';
import type { AnalyticsTabId } from '../../types/analytics';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

type MetricTabSwitcherProps = {
  activeTab: AnalyticsTabId;
  onTabChange: (tab: AnalyticsTabId) => void;
};

export function MetricTabSwitcher({ activeTab, onTabChange }: MetricTabSwitcherProps) {
  const { theme, isDark } = useTheme();

  return (
    <GlassPanel borderRadius={20} style={{ marginBottom: 16 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 8, gap: 8 }}
      >
        {ANALYTICS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="active:opacity-80"
            >
              <View
                style={[
                  styles.tab,
                  isActive
                    ? {
                        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.18)' : 'rgba(119, 93, 216, 0.12)',
                        borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : 'rgba(119, 93, 216, 0.28)',
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isDark ? 0.55 : 0.2,
                        shadowRadius: 12,
                      }
                    : {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.ringTrack,
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.borderSubtle,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? theme.textPrimary : theme.textMuted },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  tab: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});
