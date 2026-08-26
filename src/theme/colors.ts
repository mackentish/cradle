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
  sage400: '#9FB899',
  sage500: '#7E9C79',
  sage600: '#647F60',

  // Tertiary: lavender (birth prep's identity, and the postpartum accent)
  lavender50: '#F7F5FB',
  lavender100: '#EFEBF6',
  lavender300: '#CDC3E0',
  lavender400: '#ACA1C4',
  lavender500: '#8B7FA8',
  lavender600: '#6F6389',

  // Neutrals, warmed slightly so nothing reads as gray-blue
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

/**
 * Each program's identity color. Pelvic floor keeps the app's primary, since it
 * was the whole app before the others existed. `ring` is the saturated version
 * the day tracker draws with; `tint`/`ink` match the `stageColors` shape.
 *
 * Deliberately separate from `stageColors` — a stage says *when* she is, a
 * program says *what* she's doing, and the two are not interchangeable.
 *
 * Five fields rather than three, because a control that acts on one program is
 * tinted by it: `ring`/`pressed` build a filled button, `tint`/`softBorder` a
 * soft one, `ink` the label on top. Pelvic floor's five are value-identical to
 * `primary`/`primaryPressed`/`primarySoft`/`primarySoftBorder`, so it looks
 * exactly as it always has. Sage and lavender have no 200 step, so the 300
 * stands in as their soft border — that's cheaper than inventing two palette
 * entries for one edge.
 *
 * It stops at the chrome. The session player's ring stays on `colors.phase*`,
 * for the reason spelled out where `PHASE_COLORS` is declared.
 */
export const programColors = {
  'pelvic-floor': {
    ring: palette.blush500,
    pressed: palette.blush600,
    tint: palette.blush100,
    softBorder: palette.blush200,
    ink: palette.blush600,
  },
  core: {
    ring: palette.sage500,
    pressed: palette.sage600,
    tint: palette.sage100,
    softBorder: palette.sage300,
    ink: palette.sage600,
  },
  'birth-prep': {
    ring: palette.lavender500,
    pressed: palette.lavender600,
    tint: palette.lavender100,
    softBorder: palette.lavender300,
    ink: palette.lavender600,
  },
} as const;

export type ProgramColorKey = keyof typeof programColors;

/**
 * The session ring, per program. The ring is the program's color at every phase
 * — in core it is sage from the first breath to the last — so the phase reads as
 * lightness within one family rather than as a jump to another hue.
 *
 * It darkens as the work intensifies: `rest` lightest, then `release`, `lift`,
 * and `hold` darkest. That ordering is the whole point, so keep the four rungs
 * one palette step apart and don't collapse two phases onto the same value —
 * the ring is the only thing telling her whether to be working right now.
 *
 * This replaced a single cross-family scale (lift blush, release lavender, rest
 * sage). That scale drew the phase with hue, which read well in pelvic floor and
 * badly everywhere else: sage `rest` and lavender `release` were the *other two
 * programs'* identity colors, so a core session went sage on rest for reasons
 * that had nothing to do with core.
 */
export const programPhaseColors = {
  'pelvic-floor': {
    rest: palette.blush300,
    release: palette.blush400,
    lift: palette.blush500,
    hold: palette.blush600,
  },
  core: {
    rest: palette.sage300,
    release: palette.sage400,
    lift: palette.sage500,
    hold: palette.sage600,
  },
  'birth-prep': {
    rest: palette.lavender300,
    release: palette.lavender400,
    lift: palette.lavender500,
    hold: palette.lavender600,
  },
} as const;
