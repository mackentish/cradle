/**
 * Cradle's palette. A dusty-rose primary with a sage secondary, on warm cream.
 * Everything is deliberately low-saturation — the app should feel calm, not clinical.
 */
export const palette = {
  // Primary: dusty rose
  blush50: '#FDF6F6',
  blush100: '#F8E7E8',
  blush200: '#F0D0D3',
  blush300: '#E4B0B5',
  blush400: '#D9959C',
  blush500: '#C9787F',
  blush600: '#AE5F67',

  // Secondary: sage
  sage50: '#F4F8F2',
  sage100: '#EAF1E7',
  sage300: '#C0D4BA',
  sage500: '#7E9C79',
  sage600: '#647F60',

  // Tertiary: lavender (used for release / rest / postpartum)
  lavender50: '#F7F5FB',
  lavender100: '#EFEBF6',
  lavender300: '#CDC3E0',
  lavender500: '#8B7FA8',

  // Neutrals, warmed slightly so nothing reads as grey-blue
  cream: '#FDFAF7',
  surface: '#FFFFFF',
  border: '#F0E7E4',
  ink: '#3D3238',
  inkSoft: '#6E5F65',
  inkFaint: '#A2939A',
  white: '#FFFFFF',
} as const;

export const colors = {
  background: palette.cream,
  surface: palette.surface,
  surfaceSunken: palette.blush50,
  border: palette.border,

  primary: palette.blush500,
  primaryPressed: palette.blush600,
  primarySoft: palette.blush100,
  primarySoftBorder: palette.blush200,
  onPrimary: palette.white,

  accent: palette.sage500,
  accentSoft: palette.sage100,

  text: palette.ink,
  textSoft: palette.inkSoft,
  textFaint: palette.inkFaint,

  /** Session player phase colors — lift is effort, release is letting go. */
  phaseLift: palette.blush400,
  phaseHold: palette.blush500,
  phaseRelease: palette.lavender500,
  phaseRest: palette.sage500,
} as const;

/** Each program stage gets a soft identity color, used on cards and the timeline. */
export const stageColors = {
  foundation: { tint: palette.blush100, ink: palette.blush600 },
  build: { tint: palette.sage100, ink: palette.sage600 },
  sustain: { tint: palette.lavender100, ink: palette.lavender500 },
  prepare: { tint: palette.blush50, ink: palette.blush500 },
  recover: { tint: palette.lavender50, ink: palette.lavender500 },
  reconnect: { tint: palette.sage50, ink: palette.sage600 },
  rebuild: { tint: palette.blush100, ink: palette.blush600 },
} as const;

export type StageColorKey = keyof typeof stageColors;
