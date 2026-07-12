import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { BodyView as MuscleDiagramView } from '@musclemap/assets';

import { highlightToMuscleMapValues } from '../../lib/health/muscleMapAdapter';
import { mergeMuscleHighlights } from '../../lib/health/muscleMap';
import { useHealthIsDark } from '../../hooks/useHealthIsDark';
import { useHealthTheme } from '../../hooks/useHealthTheme';
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
  const isDark = useHealthIsDark();
  const healthTheme = useHealthTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        canvas: {
          backgroundColor: healthTheme.canvas,
        },
        dualCanvas: {
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        figureSlot: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        figureSlotLeft: {
          marginRight: -DUAL_CENTER_PULL,
          zIndex: 1,
        },
        figureSlotRight: {
          marginLeft: -DUAL_CENTER_PULL,
          zIndex: 1,
        },
        centerSlot: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
          maxWidth: '40%',
          zIndex: 2,
        },
        toggleRow: {
          flexDirection: 'row',
          gap: 8,
          marginBottom: 8,
        },
        toggleBtn: {
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 4,
        },
        toggleLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }),
    [healthTheme.canvas],
  );

  const dualFigureWidth = Math.min(
    DUAL_FIGURE_MAX_WIDTH,
    Math.round(screenWidth * DUAL_FIGURE_SCREEN_RATIO),
  );
  const figureWidth = compact ? (layout === 'dual' ? dualFigureWidth : 128) : 190;

  const values = useMemo(() => highlightToMuscleMapValues(highlight), [highlight]);

  if (layout === 'dual') {
    const figureHeight = figureWidth * 1.45;

    return (
      <View
        style={[styles.dualCanvas, styles.canvas, { minHeight: figureHeight + 8 }]}
      >
        <View style={styles.row}>
          <View style={[styles.figureSlot, styles.figureSlotLeft]}>
            <MuscleMapBodyFigure view="FRONT" values={values} width={figureWidth} />
          </View>

          <View style={styles.centerSlot}>{centerContent}</View>

          <View style={[styles.figureSlot, styles.figureSlotRight]}>
            <MuscleMapBodyFigure view="BACK" values={values} width={figureWidth} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.canvas, { alignItems: 'center' }]}>
      <View style={styles.toggleRow}>
        {(['FRONT', 'BACK'] as MuscleDiagramView[]).map((side) => {
          const isActive = view === side;
          return (
            <Pressable
              key={side}
              onPress={() => setView(side)}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: isActive
                    ? `${healthTheme.accent}33`
                    : isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.04)',
                },
              ]}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  { color: isActive ? healthTheme.accent : healthTheme.slate },
                ]}
              >
                {side === 'FRONT' ? 'Front' : 'Back'}
              </Text>
            </Pressable>
          );
        })}
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
