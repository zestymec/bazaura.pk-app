import { TextStyle } from 'react-native';

/**
 * Brand typefaces.
 *  - Fredoka: rounded display face that echoes the bubbly "BazAura" wordmark.
 *    Used automatically for headings (see resolveFontFamily).
 *  - Nunito: rounded, highly legible body face for everything else.
 *
 * Names are the PostScript names of the files in assets/fonts, which is what
 * both iOS and Android resolve `fontFamily` against.
 */
export const fonts = {
  body: {
    regular: 'Nunito-Regular',
    medium: 'Nunito-Medium',
    semibold: 'Nunito-SemiBold',
    bold: 'Nunito-Bold',
    extrabold: 'Nunito-ExtraBold',
    black: 'Nunito-Black',
  },
  display: {
    medium: 'Fredoka-Medium',
    semibold: 'Fredoka-SemiBold',
    bold: 'Fredoka-Bold',
  },
} as const;

const BODY_BY_WEIGHT: Record<string, string> = {
  '100': fonts.body.regular,
  '200': fonts.body.regular,
  '300': fonts.body.regular,
  '400': fonts.body.regular,
  normal: fonts.body.regular,
  '500': fonts.body.medium,
  '600': fonts.body.semibold,
  '700': fonts.body.bold,
  bold: fonts.body.bold,
  '800': fonts.body.extrabold,
  '900': fonts.body.black,
};

/**
 * Picks the brand font file for a given weight/size. Large, heavy text gets
 * the display face so headings carry the logo's personality without every
 * screen having to opt in.
 */
export function resolveFontFamily(fontWeight: TextStyle['fontWeight'], fontSize = 14): string {
  const w = String(fontWeight ?? '400');
  const numeric = w === 'bold' ? 700 : w === 'normal' ? 400 : Number(w) || 400;
  if ((fontSize >= 16 && numeric >= 700) || (fontSize >= 18 && numeric >= 600)) {
    return numeric >= 700 ? fonts.display.bold : fonts.display.semibold;
  }
  return BODY_BY_WEIGHT[w] ?? fonts.body.regular;
}

export const typography = {
  size: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  weight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extrabold: '800' as TextStyle['fontWeight'],
    black: '900' as TextStyle['fontWeight'],
  },

  lineHeight: {
    tight: 1.15,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export type Typography = typeof typography;
