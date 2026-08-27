export const colors = {
  // Bazaura Primary Brand (Used selectively for CTAs, active highlights & badges)
  primary: {
    50: '#FFF5F0',
    100: '#FFE8DF',
    200: '#FFCBB9',
    300: '#FFA388',
    400: '#FF7A54',
    500: '#FF5B24', // Signature Bazaura Orange
    600: '#E8450F',
    700: '#BF3305',
    800: '#962804',
    900: '#7A2207',
    DEFAULT: '#FF5B24',
  },

  // Subtle Gold Accent (Sourcing Concierge highlights)
  secondary: {
    50: '#FDFBF7',
    100: '#FAF3E3',
    200: '#F4E4C1',
    300: '#E8CE92',
    400: '#DCB562',
    500: '#D4AF37', // Signature Gold
    600: '#B89223',
    700: '#917116',
    DEFAULT: '#D4AF37',
  },

  // Delivery Indicators
  delivery: {
    express: '#FF5B24',
    expressBg: '#FFF2EC',
    expressText: '#D9420D',
    standard: '#0284C7',
    standardBg: '#F0F9FF',
    standardText: '#0369A1',
    guarantee: '#10B981',
    guaranteeBg: '#ECFDF5',
  },

  // Status & Utility
  success: {
    light: '#ECFDF5',
    DEFAULT: '#10B981',
    dark: '#047857',
  },
  warning: {
    light: '#FFFBEB',
    DEFAULT: '#F59E0B',
    dark: '#B45309',
  },
  error: {
    light: '#FEF2F2',
    DEFAULT: '#EF4444',
    dark: '#B91C1C',
  },
  info: {
    light: '#EFF6FF',
    DEFAULT: '#3B82F6',
    dark: '#1D4ED8',
  },

  // Apple-inspired Clean Neutrals & Typography
  neutral: {
    50: '#F8F9FA', // Main Canvas Background
    100: '#F2F2F7', // iOS Grouped / Fill Background
    200: '#E5E5EA', // iOS Hairline Separators
    300: '#D1D1D6', // Borders
    400: '#9CA3AF', // Inactive Icons
    500: '#6B7280', // Secondary / Subtitle Text
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827', // High-contrast Title Text
    950: '#030712',
    white: '#FFFFFF',
    black: '#000000',
  },

  // Surfaces & iOS Backgrounds
  surface: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    secondary: '#F2F2F7',
    border: 'rgba(0, 0, 0, 0.05)',
    borderLight: '#F2F2F7',
    divider: '#E5E5EA',
    backdrop: 'rgba(0, 0, 0, 0.45)',
  },

  // Text Roles
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    brand: '#FF5B24',
    link: '#FF5B24',
  },
};

export type Colors = typeof colors;
