import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFloatingTabBarStyles } from '../navigation/hooks/useFloatingTabBarStyles';

/** Footer padding when a modal sheet covers the full screen bottom. */
export function useBottomSheetLayout() {
  const insets = useSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();

  return useMemo(
    () => ({
      /** Space occupied by the floating tab bar — used only if sheet sits above it. */
      tabBarInset: scrollContentPaddingBottom,
      footerPaddingBottom: Math.max(insets.bottom, 12) + 10,
    }),
    [insets.bottom, scrollContentPaddingBottom],
  );
}
