import { ChevronDown } from 'lucide-react-native';
import { useState, type PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { GlassPanel } from '../GlassPanel';
import { timingStandard } from '../../theme/motion';
import { useTheme } from '../../theme/ThemeContext';

type ExpandableSectionProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
}>;

export function ExpandableSection({
  title,
  subtitle,
  defaultExpanded = true,
  children,
}: ExpandableSectionProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 180 : 0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    rotation.value = withTiming(next ? 180 : 0, timingStandard());
  };

  return (
    <GlassPanel borderRadius={20} style={{ marginBottom: 16 }}>
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between px-4 py-4 active:opacity-80"
      >
        <View className="flex-1 pr-3">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-ethereal-ink">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-xs text-ethereal-slate">{subtitle}</Text>
          ) : null}
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronDown color={theme.textSecondary} size={18} />
        </Animated.View>
      </Pressable>
      {expanded ? <View className="px-4 pb-4">{children}</View> : null}
    </GlassPanel>
  );
}
