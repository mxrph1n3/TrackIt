import { ChevronLeft } from 'lucide-react-native';
import type { PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';

type ScreenHeaderProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
}>;

export function ScreenHeader({ title, subtitle, onBack, children }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 18 }} className="mb-4">
      <View className="flex-row items-center">
        {onBack ? (
          <Pressable
            onPress={onBack}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full active:opacity-80"
            style={{ backgroundColor: `${theme.primary}18` }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft color={theme.primary} size={22} strokeWidth={2.5} />
          </Pressable>
        ) : null}

        <View className="flex-1">
          <Text
            className="text-[11px] font-bold uppercase tracking-[2px]"
            style={{ color: theme.textMuted }}
          >
            {subtitle ?? 'Profile Module'}
          </Text>
          <Text className="mt-1 text-2xl font-black" style={{ color: theme.textPrimary }}>
            {title}
          </Text>
        </View>

        {children}
      </View>
    </View>
  );
}
