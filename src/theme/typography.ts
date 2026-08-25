import { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Quicksand (rounded geometric) for display text, Nunito (rounded humanist) for
 * body copy — Quicksand gets thin at small sizes, so it stays on headings.
 */
export const fonts = {
  displayMedium: 'Quicksand_500Medium',
  displaySemibold: 'Quicksand_600SemiBold',
  displayBold: 'Quicksand_700Bold',
  bodyRegular: 'Nunito_400Regular',
  bodyMedium: 'Nunito_500Medium',
  bodySemibold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
} as const;

export const textStyles = {
  hero: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    lineHeight: 41,
    color: colors.text,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    lineHeight: 33,
    color: colors.text,
  },
  heading: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    lineHeight: 27,
    color: colors.text,
  },
  subheading: {
    fontFamily: fonts.displaySemibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    lineHeight: 25,
    color: colors.textSoft,
  },
  bodyStrong: {
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    lineHeight: 25,
    color: colors.text,
  },
  small: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
  },
  smallStrong: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.textFaint,
  },
  timer: {
    fontFamily: fonts.displayBold,
    fontSize: 76,
    lineHeight: 84,
    color: colors.text,
  },
} satisfies Record<string, TextStyle>;
