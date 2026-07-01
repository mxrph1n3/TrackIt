import Svg, { Polygon } from 'react-native-svg';

type CrystalEmblemIconProps = {
  size?: number;
  color?: string;
};

/** Sharp geometric diamond used in the central tab-bar emblem. */
export function CrystalEmblemIcon({ size = 22, color = '#1E1A3E' }: CrystalEmblemIconProps) {
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
