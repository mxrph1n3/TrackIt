import { BlurView } from 'expo-blur';
import { ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RecentActionEntry } from '../../constants/actionHubRadial';
import { supportsNativeBlur } from '../../lib/platform/blur';
import { RADIUS } from '../../theme/designTokens';
import { useTheme } from '../../theme/ThemeContext';
import { useActionHubTheme } from './useActionHubTheme';

type ActionHubRecentActionsProps = {
  items: RecentActionEntry[];
  onPressItem: (item: RecentActionEntry) => void;
};

export function ActionHubRecentActions({ items, onPressItem }: ActionHubRecentActionsProps) {
  const { theme } = useTheme();
  const hubTheme = useActionHubTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shadow: {
          marginTop: 8,
          width: '100%',
          maxWidth: 420,
          ...Platform.select({
            ios: {
              shadowColor: '#775DD8',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: hubTheme.isDark ? 0.18 : 0.06,
              shadowRadius: 18,
            },
            android: { elevation: 3 },
          }),
        },
        card: {
          borderRadius: RADIUS.card,
          borderWidth: 1,
          borderColor: hubTheme.glassEdge,
          backgroundColor: hubTheme.cardBg,
          overflow: 'hidden',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 6,
        },
        header: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          color: theme.textPrimary,
          marginBottom: 10,
        },
        empty: {
          fontSize: 13,
          fontWeight: '500',
          color: theme.textMuted,
          lineHeight: 20,
          paddingBottom: 14,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
        },
        rowBorder: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: hubTheme.rowDivider,
        },
        rowPressed: {
          opacity: 0.88,
        },
        iconWrap: {
          width: 34,
          height: 34,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        copy: {
          flex: 1,
        },
        title: {
          fontSize: 14,
          fontWeight: '700',
          color: theme.textPrimary,
        },
        meta: {
          marginTop: 2,
          fontSize: 12,
          fontWeight: '500',
          color: theme.textMuted,
        },
      }),
    [hubTheme, theme],
  );

  return (
    <View style={styles.shadow}>
      <View style={styles.card}>
        {supportsNativeBlur() ? (
          <BlurView intensity={hubTheme.isDark ? 36 : 22} tint={hubTheme.blurTint} style={StyleSheet.absoluteFill} />
        ) : null}
        <Text style={styles.header}>Recent Actions</Text>

        {items.length === 0 ? (
          <Text style={styles.empty}>Your recent quick actions will appear here after you create something.</Text>
        ) : (
          items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.id}
                onPress={() => onPressItem(item)}
                style={({ pressed }) => [
                  styles.row,
                  index < items.length - 1 && styles.rowBorder,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${item.accent}16` }]}>
                  <Icon color={item.accent} size={16} strokeWidth={1.8} />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {item.meta}
                  </Text>
                </View>
                <ChevronRight color={theme.textMuted} size={16} strokeWidth={2} />
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}
