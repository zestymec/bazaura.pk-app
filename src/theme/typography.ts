import { TextStyle } from 'react-native';

export const typography = {
  // Font Sizes
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

  // Font Weights
  weight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extrabold: '800' as TextStyle['fontWeight'],
    black: '900' as TextStyle['fontWeight'],
  },

  // Line Heights
  lineHeight: {
    tight: 1.15,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export type Typography = typeof typography;
