import Svg, { Polyline } from 'react-native-svg';
import { View } from 'react-native';

type BalanceTrendSparklineProps = {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
};

export function BalanceTrendSparkline({
  points,
  width = 120,
  height = 36,
  color = '#775DD8',
}: BalanceTrendSparklineProps) {
  if (points.length < 2) {
    return <View style={{ width, height }} />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const normalized = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={normalized.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
