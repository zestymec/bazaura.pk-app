/**
 * Bazaura brand palette.
 *
 * Everything is derived from the logo: a single deep-orange (#FF5722) on white.
 * Neutrals are warm (stone) rather than cool grey so they sit comfortably next
 * to the orange, and the "secondary" ramp is the soft peach from the brand
 * banner gradient — used for concierge / premium surfaces.
 */
export const colors = {
  // Logo orange — CTAs, active states, prices on sale, badges
  primary: {
    50: '#FFF4F0',
    100: '#FFE4D9',
    200: '#FFC7B2',
    300: '#FFA180',
    400: '#FF7A4D',
    500: '#FF5722', // Bazaura Orange (exact logo colour)
    600: '#F04A15',
    700: '#C93A0D',
    800: '#A0300F',
    900: '#7F2A11',
    DEFAULT: '#FF5722',
  },

  // Peach (brand banner gradient) — concierge & premium surfaces
  secondary: {
    50: '#FFF8F5',
    100: '#FFEDE5',
    200: '#FFDCCD',
    300: '#FFC2A8',
    400: '#FF9F78',
    500: '#E8673A',
    600: '#C2502A',
    700: '#9A3D1F',
    DEFAULT: '#FFDCCD',
  },

  // Delivery indicators
  delivery: {
    express: '#FF5722',
    expressBg: '#FFF1EB',
    expressText: '#D9430F',
    standard: '#0284C7',
    standardBg: '#F0F9FF',
    standardText: '#0369A1',
    guarantee: '#16A34A',
    guaranteeBg: '#F0FDF4',
  },

  // Status & utility
  success: {
    light: '#F0FDF4',
    DEFAULT: '#16A34A',
    dark: '#15803D',
  },
  warning: {
    light: '#FFFBEB',
    DEFAULT: '#F59E0B',
    dark: '#B45309',
  },
  error: {
    light: '#FEF2F2',
    DEFAULT: '#DC2626',
    dark: '#B91C1C',
  },
  info: {
    light: '#EFF6FF',
    DEFAULT: '#3B82F6',
    dark: '#1D4ED8',
  },

  // Warm neutrals
  neutral: {
    50: '#FAF8F6', // App canvas
    100: '#F4F1EE', // Fills, inputs, chips
    200: '#E9E4DF', // Hairlines
    300: '#D6CFC8', // Borders
    400: '#A8A097', // Inactive icons, placeholders
    500: '#78716C', // Secondary text
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917', // Titles
    950: '#0C0A09',
    white: '#FFFFFF',
    black: '#000000',
  },

  surface: {
    background: '#FAF8F6',
    card: '#FFFFFF',
    secondary: '#F4F1EE',
    border: 'rgba(28, 25, 23, 0.06)',
    borderLight: '#F4F1EE',
    divider: '#E9E4DF',
    backdrop: 'rgba(12, 10, 9, 0.45)',
  },

  text: {
    primary: '#1C1917',
    secondary: '#78716C',
    tertiary: '#A8A097',
    inverse: '#FFFFFF',
    brand: '#FF5722',
    link: '#FF5722',
  },
};

export type Colors = typeof colors;
