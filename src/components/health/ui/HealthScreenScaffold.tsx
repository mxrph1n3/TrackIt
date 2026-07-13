import type { PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';

import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useTheme } from '../../../theme/ThemeContext';
import { resolveWebSceneBackground } from '../../../theme/resolveWebBackground';

type HealthScreenRootProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

/** Full-screen health module root — always paints the themed canvas (fixes web white bleed). */
export function HealthScreenRoot({ children, style }: HealthScreenRootProps) {
  const healthTheme = useHealthTheme();
  const { mode } = useTheme();
  const canvas = resolveWebSceneBackground(healthTheme.background, mode);

  return (
    <View style={[styles.root, { backgroundColor: canvas }, style]}>
      {children}
    </View>
  );
}

type HealthScrollViewProps = PropsWithChildren<
  Omit<ScrollViewProps, 'contentContainerStyle'> & {
    contentContainerStyle?: StyleProp<ViewStyle>;
  }
>;

/** ScrollView with themed viewport + content background (RN Web defaults to white). */
export function HealthScrollView({
  children,
  style,
  contentContainerStyle,
  ...scrollProps
}: HealthScrollViewProps) {
  const healthTheme = useHealthTheme();
  const { mode } = useTheme();
  const canvas = resolveWebSceneBackground(healthTheme.background, mode);

  return (
    <ScrollView
      {...(Platform.OS === 'web' ? { nativeID: 'health-scroll', testID: 'health-scroll' } : {})}
      style={[styles.scroll, { backgroundColor: canvas }, style]}
      contentContainerStyle={[
        { backgroundColor: canvas },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
