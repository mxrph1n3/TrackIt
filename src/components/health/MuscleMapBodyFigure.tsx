import {
  getMonochromeColor,
  getVisibleMuscleGroups,
  type MuscleGroup,
  type MuscleMapValues,
} from '@musclemap/core';
import { getBodyDiagram, type BodyDiagram, type BodyView } from '@musclemap/assets';
import { useMemo } from 'react';
import Svg, { G, Path } from 'react-native-svg';

import { useTheme } from '../../theme/ThemeContext';
import {
  TRACKIT_MUSCLE_BASE_DARK,
  TRACKIT_MUSCLE_BASE_LIGHT,
  TRACKIT_MUSCLE_COLOR,
} from '../../lib/health/muscleMapAdapter';

type ExpandedMuscle = {
  key: string;
  group: MuscleGroup;
  d: string;
  mirrored: boolean;
  score: number | null;
};

type BodyFigurePalette = {
  outlineTop: string;
  outlineBottom: string;
  muscleRest: string;
  stroke: string;
  muscleBase: string;
};

const LIGHT_PALETTE: BodyFigurePalette = {
  outlineTop: '#E8EDF5',
  outlineBottom: '#CBD5E1',
  muscleRest: 'rgba(148, 163, 184, 0.28)',
  stroke: 'rgba(26, 21, 44, 0.12)',
  muscleBase: TRACKIT_MUSCLE_BASE_LIGHT,
};

const DARK_PALETTE: BodyFigurePalette = {
  outlineTop: '#151320',
  outlineBottom: '#0D0B14',
  muscleRest: 'rgba(255, 255, 255, 0.1)',
  stroke: 'rgba(255, 255, 255, 0.08)',
  muscleBase: TRACKIT_MUSCLE_BASE_DARK,
};

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
  const { isDark } = useTheme();
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
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
    <Svg width={width} height={height} viewBox={diagram.viewBox}>
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
  );
}
