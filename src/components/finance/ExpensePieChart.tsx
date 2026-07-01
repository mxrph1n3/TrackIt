import { Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import type { ExpenseCategoryStat } from '../../types/finance';

type ExpensePieChartProps = {
  data: ExpenseCategoryStat[];
  size?: number;
};

export function ExpensePieChart({ data, size = 168 }: ExpensePieChartProps) {
  const radius = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  let cursor = 0;

  return (
    <View className="items-center">
      <Svg width={size} height={size}>
        <G>
          {data.map((segment) => {
            const start = cursor;
            const sweep = (segment.percentage / 100) * 360;
            cursor += sweep;
            return (
              <Circle
                key={segment.id}
                cx={cx}
                cy={cy}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={18}
                strokeDasharray={`${(segment.percentage / 100) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`}
                strokeDashoffset={-((start / 360) * 2 * Math.PI * radius)}
                rotation={-90}
                origin={`${cx}, ${cy}`}
              />
            );
          })}
        </G>
        <Circle cx={cx} cy={cy} r={radius - 22} fill="#07070A" />
      </Svg>

      <View className="mt-4 w-full gap-2">
        {data.slice(0, 3).map((segment) => (
          <View key={segment.id} className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <Text className="text-sm text-ethereal-ink">{segment.name}</Text>
            </View>
            <Text className="text-sm font-semibold text-ethereal-slate">
              {segment.percentage}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
