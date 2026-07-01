import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useDefaultAvatarSource } from '../../lib/userAvatar';
import { neonPurpleGlow } from '../../theme/neonShadows';
import { useTheme } from '../../theme/ThemeContext';

/** Proportions aligned with the My Profile viewport blueprint. */
export const USER_AVATAR_SIZES = {
  profile: 112,
  deck: 54,
  header: 44,
  row: 40,
} as const;

export type UserAvatarSizeKey = keyof typeof USER_AVATAR_SIZES;

type UserAvatarProps = {
  size?: UserAvatarSizeKey | number;
  /** When set, renders initials inside the same premium frame instead of the photo. */
  fallbackInitials?: string;
  showFallbackInitials?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

function resolveAvatarDiameter(size: UserAvatarSizeKey | number): number {
  if (typeof size === 'number') {
    return size;
  }
  return USER_AVATAR_SIZES[size];
}

function resolveRingWidth(diameter: number): number {
  return Math.max(2, Math.round(diameter * 0.027));
}

type UserAvatarFrameProps = PropsWithChildren<{
  diameter: number;
  style?: StyleProp<ViewStyle>;
}>;

/** Shared multi-layer circular frame: neon outer glow + purple ring + inner edge. */
export function UserAvatarFrame({ diameter, style, children }: UserAvatarFrameProps) {
  const { isDark, theme } = useTheme();
  const ringWidth = resolveRingWidth(diameter);
  const framedDiameter = diameter + ringWidth * 2;
  const innerBackdrop = isDark ? '#14121E' : '#0A0A0F';
  const innerBorder = isDark ? 'rgba(149, 128, 232, 0.35)' : 'rgba(255, 255, 255, 0.2)';

  return (
    <View
      className="items-center justify-center"
      style={[{ width: framedDiameter, height: framedDiameter }, neonPurpleGlow, style]}
    >
      <LinearGradient
        colors={['#9580E8', '#775DD8', '#6366F1', '#775DD8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: framedDiameter,
          height: framedDiameter,
          borderRadius: framedDiameter / 2,
          padding: ringWidth,
          shadowColor: theme.shadowColor,
          shadowOpacity: isDark ? 0.45 : theme.shadowOpacity,
          shadowRadius: isDark ? 16 : 12,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <View
          className="overflow-hidden rounded-full"
          style={{
            width: diameter,
            height: diameter,
            backgroundColor: innerBackdrop,
            borderWidth: 1,
            borderColor: innerBorder,
          }}
        >
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

export function UserAvatar({
  size = 'profile',
  fallbackInitials,
  showFallbackInitials = false,
  accessibilityLabel = 'Profile avatar',
  style,
  onPress,
}: UserAvatarProps) {
  const diameter = resolveAvatarDiameter(size);
  const useInitials = showFallbackInitials && Boolean(fallbackInitials);
  const { theme } = useTheme();
  const avatarSource = useDefaultAvatarSource();

  const content = (
    <UserAvatarFrame diameter={diameter} style={style}>
      {useInitials ? (
        <View className="flex-1 items-center justify-center">
          <Text
            className="font-black"
            style={{ fontSize: Math.round(diameter * 0.34), color: theme.textPrimary }}
          >
            {fallbackInitials}
          </Text>
        </View>
      ) : (
        <Image
          source={avatarSource}
          style={{
            width: diameter,
            height: diameter * 1.14,
            transform: [{ translateY: -diameter * 0.09 }],
          }}
          resizeMode="cover"
          accessibilityLabel={accessibilityLabel}
        />
      )}
    </UserAvatarFrame>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className="active:opacity-85"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
