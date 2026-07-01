import { useEffect, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { MOTION_DURATION, timingLoop, timingProgress } from '../../theme/motion';

type WaveFillBarProps = {
  percent: number;
  color: string;
};

export function WaveFillBar({ percent, color }: WaveFillBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);
  const waveShift = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    progress.value = withTiming(Math.min(100, percent), timingProgress());
  }, [percent, progress]);

  useEffect(() => {
    waveShift.value = withRepeat(
      withTiming(1, timingLoop(MOTION_DURATION.ambient)),
      -1,
      true,
    );
  }, [waveShift]);

  const fillStyle = useAnimatedStyle(() => ({
    width: (progress.value / 100) * trackWidth,
    transform: [{ translateX: waveShift.value * 4 }],
  }));

  return (
    <View
      onLayout={onLayout}
      className="h-1.5 overflow-hidden rounded-full border border-white/5 bg-white/[0.06]"
    >
      <Animated.View
        className="h-full rounded-full"
        style={[
          {
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.55,
            shadowRadius: 8,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
