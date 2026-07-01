/** TrackIt Action Hub — premium light glass tokens. */
export const ACTION_HUB = {
  medallionSize: 70,
  medallionOverlap: 21,
  crystalPurple: '#7C5CFC',
  crystalInk: '#1E1A3E',
  glassBorder: 'rgba(255, 255, 255, 0.72)',
  glassEdge: 'rgba(119, 93, 216, 0.12)',
  scrim: 'rgba(30, 26, 62, 0.28)',
  petalWidth: 220,
  petalHeight: 64,
  openDurationMs: 300,
  closeDurationMs: 260,
  crystalRotationDeg: 20,
  /** Optical centering tweak for crystal medallions. */
  crystalNudgeX: 0,
  crystalNudgeY: 0,
  petalStaggerMs: [30, 50, 70, 90, 110, 130] as const,
} as const;

export type PetalSlotId = 'top' | 'left' | 'right' | 'bottomLeft' | 'bottomRight' | 'bottom';
