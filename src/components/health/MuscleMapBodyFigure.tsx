import {
  getMonochromeColor,
  getVisibleMuscleGroups,
  type MuscleGroup,
  type MuscleMapValues,
} from '@musclemap/core';
import { getBodyDiagram, type BodyDiagram, type BodyView } from '@musclemap/assets';
import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { useHealthIsDark } from '../../hooks/useHealthIsDark';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import { TRACKIT_MUSCLE_COLOR } from '../../lib/health/muscleMapAdapter';
import { OBSIDIAN_BODY_MAP } from './ui/healthTheme';

type ExpandedMuscle = {
  key: string;
  group: MuscleGroup;
  d: string;
  mirrored: boolean;
  score: number | null;
};

type BodyFigurePalette = {
  canvas: string;
  outlineTop: string;
  outlineBottom: string;
  muscleRest: string;
  stroke: string;
  muscleBase: string;
};

function buildPalette(isDark: boolean, canvas: string): BodyFigurePalette {
  if (isDark) {
    return {
      canvas: OBSIDIAN_BODY_MAP.canvas,
      outlineTop: OBSIDIAN_BODY_MAP.silhouette,
      outlineBottom: OBSIDIAN_BODY_MAP.silhouetteDeep,
      muscleRest: OBSIDIAN_BODY_MAP.muscleIdle,
      stroke: OBSIDIAN_BODY_MAP.muscleStroke,
      muscleBase: OBSIDIAN_BODY_MAP.muscleBase,
    };
  }

  return {
    canvas,
    outlineTop: '#E8EDF5',
    outlineBottom: '#CBD5E1',
    muscleRest: 'rgba(148, 163, 184, 0.28)',
    stroke: 'rgba(26, 21, 44, 0.12)',
    muscleBase: '#CBD5E1',
  };
}

function expandMuscle(
  path: BodyDiagram['muscles'][number],
  index: number,
): Array<Omit<ExpandedMuscle, 'score'>> {
  if (path.side === 'CENTER') {
    return [{ key: `${path.group}-${index}-c`, group: path.group, d: path.d, mirrored: false }];
  }

  return [
    { key: `${path.group}-${index}-l`, group: path.group, d: path.d, mirrored: false },
    { key: `${path.group}-${index}-r`, group: path.group, d: path.d, mirrored: true },
  ];
}

function mirrorTransform(centerX: number): string {
  return `matrix(-1 0 0 1 ${centerX * 2} 0)`;
}

function resolveMuscles(
  diagram: BodyDiagram,
  values: MuscleMapValues,
  visibleGroups: ReadonlySet<MuscleGroup>,
): ExpandedMuscle[] {
  return diagram.muscles.flatMap(expandMuscle).map((muscle) => {
    const visible = visibleGroups.has(muscle.group);
    const value = values[muscle.group];
    const score = visible && value ? value.score : null;
    return { ...muscle, score };
  });
}

type MuscleMapBodyFigureProps = {
  view: BodyView;
  values: MuscleMapValues;
  width: number;
};

export function MuscleMapBodyFigure({ view, values, width }: MuscleMapBodyFigureProps) {
  const isDark = useHealthIsDark();
  const healthTheme = useHealthTheme();
  const palette = useMemo(
    () => buildPalette(isDark, healthTheme.canvas),
    [healthTheme.canvas, isDark],
  );
  const diagram = useMemo(() => getBodyDiagram('MALE', view), [view]);
  const visibleGroups = useMemo(
    () => new Set(getVisibleMuscleGroups(view, 'FULL_BODY')),
    [view],
  );

  const muscles = useMemo(
    () => resolveMuscles(diagram, values, visibleGroups),
    [diagram, values, visibleGroups],
  );

  const [, , vbW, vbH] = diagram.viewBox.split(/\s+/).map(Number);
  const height = width * (vbH / vbW);

  return (
    <View style={{ backgroundColor: palette.canvas, alignItems: 'center' }}>
      <Svg
        width={width}
        height={height}
        viewBox={diagram.viewBox}
      >
      <Rect
        x={0}
        y={0}
        width={vbW}
        height={vbH}
        fill={palette.canvas}
      />
      <G>
        {diagram.outline.map((part) => (
          <G key={part.id}>
            <Path
              d={part.d}
              fill={palette.outlineTop}
              stroke={palette.stroke}
              strokeWidth={0.6}
            />
            {part.side === 'LEFT' ? (
              <Path
                d={part.d}
                fill={palette.outlineBottom}
                stroke={palette.stroke}
                strokeWidth={0.6}
                transform={mirrorTransform(diagram.centerX)}
              />
            ) : null}
          </G>
        ))}

        {muscles.map((muscle) => {
          const fill =
            muscle.score != null
              ? getMonochromeColor(muscle.score, TRACKIT_MUSCLE_COLOR, palette.muscleBase)
              : palette.muscleRest;

          return (
            <Path
              key={muscle.key}
              d={muscle.d}
              fill={fill}
              stroke={palette.stroke}
              strokeWidth={muscle.score != null ? 0.9 : 0.5}
              opacity={muscle.score != null ? 1 : 0.85}
              transform={muscle.mirrored ? mirrorTransform(diagram.centerX) : undefined}
            />
          );
        })}
      </G>
    </Svg>
    </View>
  );
}
