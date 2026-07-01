import { View, type ViewStyle } from 'react-native';

import { BRAND } from '../../theme/designTokens';
import { resolveTrackItIcon } from '../../constants/trackItIcons';

type TrackItIconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Optional circular badge behind the icon. */
  badge?: boolean;
  badgeColor?: string;
  badgeSize?: number;
  style?: ViewStyle;
};

export function TrackItIcon({
  name,
  size = 20,
  color = BRAND.primary,
  strokeWidth = 2,
  badge = false,
  badgeColor,
  badgeSize,
  style,
}: TrackItIconProps) {
  const Icon = resolveTrackItIcon(name);
  const shell = badgeSize ?? size + 14;

  if (!badge) {
    return (
      <View style={style}>
        <Icon size={size} color={color} strokeWidth={strokeWidth} />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: shell,
          height: shell,
          borderRadius: shell / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: badgeColor ?? `${color}18`,
        },
        style,
      ]}
    >
      <Icon size={size} color={color} strokeWidth={strokeWidth} />
    </View>
  );
}
