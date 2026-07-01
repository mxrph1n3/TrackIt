import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import type { BodyView as MuscleDiagramView } from '@musclemap/assets';

import { highlightToMuscleMapValues } from '../../lib/health/muscleMapAdapter';
import { mergeMuscleHighlights } from '../../lib/health/muscleMap';
import type { MuscleHighlight, MuscleId } from '../../types/workout';
import { MuscleMapBodyFigure } from './MuscleMapBodyFigure';

const DUAL_FIGURE_SCREEN_RATIO = 0.28;
const DUAL_FIGURE_MAX_WIDTH = 118;
const DUAL_CENTER_PULL = 14;

type MuscleMapHighlighterProps = {
  highlight: MuscleHighlight;
  compact?: boolean;
  /** Toggle single view, or show front + back with optional center slot. */
  layout?: 'toggle' | 'dual';
  centerContent?: ReactNode;
};

export function MuscleMapHighlighter({
  highlight,
  compact = false,
  layout = 'toggle',
  centerContent,
}: MuscleMapHighlighterProps) {
  const [view, setView] = useState<MuscleDiagramView>('FRONT');
  const { width: screenWidth } = useWindowDimensions();

  const dualFigureWidth = Math.min(
    DUAL_FIGURE_MAX_WIDTH,
    Math.round(screenWidth * DUAL_FIGURE_SCREEN_RATIO),
  );
  const figureWidth = compact ? (layout === 'dual' ? dualFigureWidth : 128) : 190;

  const values = useMemo(() => highlightToMuscleMapValues(highlight), [highlight]);

  if (layout === 'dual') {
    const figureHeight = figureWidth * 1.45;

    return (
      <View className="w-full items-center justify-center" style={{ minHeight: figureHeight + 8 }}>
        <View className="flex-row items-center justify-center">
          <View
            className="items-center justify-center"
            style={{ marginRight: -DUAL_CENTER_PULL, zIndex: 1 }}
          >
            <MuscleMapBodyFigure view="FRONT" values={values} width={figureWidth} />
          </View>

          <View
            className="items-center justify-center px-1"
            style={{ maxWidth: '40%', zIndex: 2 }}
          >
            {centerContent}
          </View>

          <View
            className="items-center justify-center"
            style={{ marginLeft: -DUAL_CENTER_PULL, zIndex: 1 }}
          >
            <MuscleMapBodyFigure view="BACK" values={values} width={figureWidth} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="items-center">
      <View className="mb-2 flex-row gap-2">
        {(['FRONT', 'BACK'] as MuscleDiagramView[]).map((side) => (
          <Pressable
            key={side}
            onPress={() => setView(side)}
            className={`rounded-full px-3 py-1 ${
              view === side ? 'bg-obsidian-primary/20' : 'bg-white/5'
            }`}
          >
            <Text
              className={`text-[10px] font-bold uppercase tracking-wider ${
                view === side ? 'text-obsidian-primary' : 'text-ethereal-slate'
              }`}
            >
              {side === 'FRONT' ? 'Front' : 'Back'}
            </Text>
          </Pressable>
        ))}
      </View>

      <MuscleMapBodyFigure view={view} values={values} width={figureWidth} />
    </View>
  );
}

export function highlightFromExercise(
  primary: MuscleId[],
  secondary: MuscleId[] = [],
): MuscleHighlight {
  return { primary, secondary };
}

export function highlightFromExercises(
  items: Array<{ primaryMuscles?: MuscleId[]; secondaryMuscles?: MuscleId[] }>,
): MuscleId[] {
  return mergeMuscleHighlights(
    items.map((item) => ({
      primary: item.primaryMuscles ?? [],
      secondary: item.secondaryMuscles ?? [],
    })),
  );
}
