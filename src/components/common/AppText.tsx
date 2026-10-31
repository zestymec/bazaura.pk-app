import React, { forwardRef, useMemo } from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  TextProps,
  TextInputProps,
  StyleSheet,
  StyleProp,
  TextStyle,
} from 'react-native';
import { resolveFontFamily } from '../../theme/typography';

/**
 * Drop-in replacements for RN's Text / TextInput that apply the brand fonts.
 *
 * Custom fonts on Android can't synthesise weights, so every weight is its own
 * file. Rather than touching hundreds of `fontWeight` declarations, we map the
 * flattened weight + size to the right font file here, in one place.
 */
function useBrandFont(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  return useMemo(() => {
    const flat = StyleSheet.flatten(style) || {};
    if (flat.fontFamily) return style;
    return [style, { fontFamily: resolveFontFamily(flat.fontWeight, flat.fontSize), fontWeight: 'normal' }];
  }, [style]);
}

// Large accessibility font sizes are honoured, but capped so layouts don't break.
const MAX_FONT_SCALE = 1.35;

export const Text = forwardRef<RNText, TextProps>(({ style, ...rest }, ref) => {
  const brandStyle = useBrandFont(style);
  return <RNText ref={ref} maxFontSizeMultiplier={MAX_FONT_SCALE} {...rest} style={brandStyle} />;
});
Text.displayName = 'Text';

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({ style, ...rest }, ref) => {
  const brandStyle = useBrandFont(style);
  return <RNTextInput ref={ref} maxFontSizeMultiplier={MAX_FONT_SCALE} {...rest} style={brandStyle} />;
});
TextInput.displayName = 'TextInput';
