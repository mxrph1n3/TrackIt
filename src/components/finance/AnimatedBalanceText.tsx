import { useEffect, useRef, useState } from 'react';
import { Text, type TextStyle } from 'react-native';

import { formatMoney } from '../../constants/financeCategories';
import { DEFAULT_CURRENCY } from '../../lib/finance/currency';
import { MOTION_DURATION } from '../../theme/motion';

type AnimatedBalanceTextProps = {
  value: number;
  currency?: string;
  style?: TextStyle;
  className?: string;
};

export function AnimatedBalanceText({
  value,
  currency = DEFAULT_CURRENCY,
  style,
  className,
}: AnimatedBalanceTextProps) {
  const animatedFrom = useRef(value);
  const [displayValue, setDisplayValue] = useState(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = animatedFrom.current;
    const to = value;
    if (from === to) return;

    const duration = MOTION_DURATION.progress;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + (to - from) * eased);
      setDisplayValue(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        animatedFrom.current = to;
      }
    };

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);

  return (
    <Text className={className} style={style}>
      {formatMoney(displayValue, currency)}
    </Text>
  );
}
