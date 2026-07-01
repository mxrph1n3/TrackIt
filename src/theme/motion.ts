import { Easing, FadeIn, FadeOut, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';

/** Unified motion durations (ms). */
export const MOTION_DURATION = {
  instant: 140,
  fast: 220,
  normal: 300,
  medium: 420,
  slow: 560,
  progress: 640,
  chart: 760,
  reveal: 720,
  ambient: 2400,
  loop: 10000,
} as const;

/** Shared easing curves for premium, fluid motion. */
export const MOTION_EASING = {
  entrance: Easing.out(Easing.cubic),
  exit: Easing.in(Easing.cubic),
  standard: Easing.bezier(0.25, 0.1, 0.25, 1),
  loop: Easing.inOut(Easing.sin),
  emphasis: Easing.out(Easing.quad),
} as const;

/** Default spring — soft settle for panels and petals. */
export const premiumSpringConfig: WithSpringConfig = {
  mass: 1,
  damping: 18,
  stiffness: 120,
  overshootClamping: false,
};

/** Snappy spring — tabs, toggles, quick UI feedback. */
export const premiumQuickSpringConfig: WithSpringConfig = {
  mass: 0.85,
  damping: 20,
  stiffness: 260,
  overshootClamping: false,
};

export const drawerOpenSpring: WithSpringConfig = {
  damping: 22,
  stiffness: 210,
  mass: 0.85,
};

export const drawerCloseSpring: WithSpringConfig = {
  damping: 28,
  stiffness: 260,
  mass: 0.9,
};

export const celebrateSpring: WithSpringConfig = {
  damping: 16,
  stiffness: 140,
  mass: 0.85,
};

export const pressInSpring: WithSpringConfig = {
  damping: 18,
  stiffness: 340,
  mass: 0.8,
};

export const pressOutSpring: WithSpringConfig = {
  damping: 16,
  stiffness: 260,
  mass: 0.85,
};

export const toggleSpring: WithSpringConfig = {
  damping: 14,
  stiffness: 220,
  mass: 0.85,
};

export function timingEntrance(duration: number = MOTION_DURATION.normal): WithTimingConfig {
  return { duration, easing: MOTION_EASING.entrance };
}

export function timingExit(duration: number = MOTION_DURATION.fast): WithTimingConfig {
  return { duration, easing: MOTION_EASING.exit };
}

export function timingProgress(duration: number = MOTION_DURATION.progress): WithTimingConfig {
  return { duration, easing: MOTION_EASING.entrance };
}

export function timingStandard(duration: number = MOTION_DURATION.normal): WithTimingConfig {
  return { duration, easing: MOTION_EASING.standard };
}

export function timingLoop(duration: number = MOTION_DURATION.ambient): WithTimingConfig {
  return { duration, easing: MOTION_EASING.loop };
}

/** Layout animation presets for overlays and modals. */
export const overlayEnter = FadeIn.duration(MOTION_DURATION.fast).easing(MOTION_EASING.entrance);
export const overlayExit = FadeOut.duration(MOTION_DURATION.instant).easing(MOTION_EASING.exit);

export const FAB_ROTATION_MS = MOTION_DURATION.normal;
export const ACTION_SHEET_STAGGER_MS = 30;
export const ACTION_HUB_PETAL_STAGGER_MS = [30, 50, 70, 90, 110, 130] as const;
