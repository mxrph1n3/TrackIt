import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

/** Monochrome warrior silhouette with neon violet rim light. */
export function WarriorSilhouetteBackdrop() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 320 420"
      preserveAspectRatio="xMidYMax meet"
      style={{ position: 'absolute', bottom: 0, right: -20, opacity: 0.22 }}
    >
      <Defs>
        <LinearGradient id="warriorRim" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#9580E8" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.35" />
        </LinearGradient>
      </Defs>
      <Path
        d="M160 40 C145 55 138 72 140 95 L125 110 L118 180 L105 280 L95 400 L125 400 L135 290 L145 210 L155 400 L185 400 L195 210 L205 290 L215 400 L245 400 L235 280 L222 180 L215 110 L200 95 C202 72 195 55 180 40 C174 34 166 34 160 40 Z"
        fill="url(#warriorRim)"
      />
      <Path
        d="M128 118 L192 118 L185 95 L135 95 Z"
        fill="rgba(168,85,247,0.45)"
      />
    </Svg>
  );
}
