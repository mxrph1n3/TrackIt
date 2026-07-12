import Svg, { Polygon } from 'react-native-svg';

type CrystalEmblemIconProps = {
  size?: number;
  color?: string;
  variant?: 'default' | 'hero';
};

/** Sharp geometric diamond used in the central tab-bar emblem. */
export function CrystalEmblemIcon({
  size = 22,
  color = '#1E1A3E',
  variant = 'default',
}: CrystalEmblemIconProps) {
  if (variant === 'hero') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Polygon points="12,2 22,12 12,22 2,12" fill={color} opacity={0.94} />
        <Polygon points="12,2 22,12 12,12" fill="#FFFFFF" opacity={0.38} />
        <Polygon points="12,2 2,12 12,12" fill={color} opacity={0.58} />
        <Polygon points="12,12 22,12 12,22" fill={color} opacity={0.78} />
        <Polygon points="12,12 2,12 12,22" fill={color} opacity={0.92} />
        <Polygon points="12,8 16,12 12,16 8,12" fill="#FFFFFF" opacity={0.24} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="12,3 21,12 12,21 3,12"
        fill={color}
        opacity={0.95}
      />
      <Polygon
        points="12,7 17,12 12,17 7,12"
        fill={color}
        opacity={0.35}
      />
    </Svg>
  );
}
