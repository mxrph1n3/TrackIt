import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useHealthStore } from '../../../stores/useHealthStore';
import { timingProgress } from '../../../theme/motion';
import { PremiumCard } from '../ui/PremiumCard';

type MacroTileProps = {
  label: string;
  current: number;
  target: number;
  color: string;
};

function MacroTile({ label, current, target, color }: MacroTileProps) {
  const percent = Math.min(100, Math.round((current / target) * 100));
  const width = useSharedValue(0);
  const styles = useHealthStyles((t) => ({
    tile: {},
    tileLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: t.slate,
      marginBottom: 6,
    },
    tileValue: {
      fontSize: 20,
      fontWeight: '900',
      color: t.ink,
      marginBottom: 10,
    },
    tileTarget: {
      fontSize: 13,
      fontWeight: '600',
      color: t.slate,
    },
    track: {
      height: 5,
      borderRadius: 3,
      backgroundColor: t.accentSoft,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 3,
    },
  }));

  useEffect(() => {
    width.value = withTiming(percent, timingProgress());
  }, [percent, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>
        {Math.round(current)}
        <Text style={styles.tileTarget}> /{target}g</Text>
      </Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
      </View>
    </View>
  );
}

export function MacroCardsRow() {
  const dietPlan = useHealthStore((s) => s.dietPlan);
  const consumed = useHealthStore((s) => s.consumedMacros);
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles(() => ({
    row: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 0,
    },
    card: {
      flex: 1,
      marginBottom: 16,
    },
  }));

  return (
    <View style={styles.row}>
      <PremiumCard style={styles.card} padding={16}>
        <MacroTile
          label="Protein"
          current={consumed.protein}
          target={dietPlan.protein_target}
          color={healthTheme.macro.protein}
        />
      </PremiumCard>
      <PremiumCard style={styles.card} padding={16}>
        <MacroTile
          label="Fat"
          current={consumed.fat}
          target={dietPlan.fat_target}
          color={healthTheme.macro.fat}
        />
      </PremiumCard>
      <PremiumCard style={styles.card} padding={16}>
        <MacroTile
          label="Carbs"
          current={consumed.carbs}
          target={dietPlan.carb_target}
          color={healthTheme.macro.carbs}
        />
      </PremiumCard>
    </View>
  );
}
