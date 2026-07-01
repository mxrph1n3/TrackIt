import type { PropsWithChildren, ReactNode } from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useIsolatedScreenInsets } from '../../navigation/hooks/useFloatingTabBarStyles';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenAmbientBackground } from '../ui/ScreenAmbientBackground';

type IsolatedScreenShellProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

/** Full-viewport root for profile modules and modal-like screens. */
export function IsolatedScreenShell({ children, style }: IsolatedScreenShellProps) {
  const { mode, theme } = useTheme();

  return (
    <View
      style={[styles.root, { backgroundColor: theme.background }, style]}
      accessibilityViewIsModal
    >
      <ScreenAmbientBackground mode={mode} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

type IsolatedScrollProps = PropsWithChildren<
  Omit<ScrollViewProps, 'contentContainerStyle'> & {
    contentContainerStyle?: StyleProp<ViewStyle>;
    horizontalPadding?: number;
  }
>;

/** Scroll container with safe bottom inset for full-screen modules (no tab bar). */
export function IsolatedScrollView({
  children,
  contentContainerStyle,
  horizontalPadding = 18,
  style,
  ...scrollProps
}: IsolatedScrollProps) {
  const { scrollPaddingBottom } = useIsolatedScreenInsets();

  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[
        { paddingHorizontal: horizontalPadding, paddingBottom: scrollPaddingBottom },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  );
}

type IsolatedScreenLayoutProps = PropsWithChildren<{
  header: ReactNode;
  scrollProps?: Omit<IsolatedScrollProps, 'children'>;
}>;

export function IsolatedScreenLayout({ header, children, scrollProps }: IsolatedScreenLayoutProps) {
  return (
    <IsolatedScreenShell>
      {header}
      <IsolatedScrollView {...scrollProps}>{children}</IsolatedScrollView>
    </IsolatedScreenShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
});
