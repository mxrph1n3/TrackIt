import Svg, { Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** Dark fantasy torii gate landscape — matte overlay at 15% opacity. */
export function ToriiLandscapeBackdrop() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Defs>
        <LinearGradient id="mistFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#07070A" stopOpacity="0.55" />
          <Stop offset="55%" stopColor="#07070A" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#07070A" stopOpacity="0.92" />
        </LinearGradient>
        <LinearGradient id="skyGlow" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
          <Stop offset="100%" stopColor="#775DD8" stopOpacity="0.08" />
        </LinearGradient>
      </Defs>

      <Rect width="360" height="180" fill="url(#skyGlow)" />
      <Ellipse cx="180" cy="150" rx="220" ry="40" fill="rgba(168,85,247,0.08)" />
      <Path
        d="M0 130 Q90 110 180 125 T360 130 V180 H0 Z"
        fill="rgba(20,20,27,0.85)"
      />
      <Path
        d="M150 95 H210 V125 H150 Z M165 125 V155 H195 V125"
        fill="rgba(168,85,247,0.35)"
      />
      <Path d="M130 95 H230 V102 H130 Z" fill="rgba(192,132,252,0.45)" />
      <Path d="M118 102 H242 V108 H118 Z" fill="rgba(168,85,247,0.55)" />
      <Rect width="360" height="180" fill="url(#mistFade)" />
    </Svg>
  );
}
