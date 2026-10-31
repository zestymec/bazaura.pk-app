import React, { useState } from 'react';
import { Image, ImageResizeMode, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Package } from '../icons';
import { colors } from '../../theme/colors';
import { optimizeImageUrl } from '../../utils/images';

interface Props {
  uri: string | null | undefined;
  /** Rendered width in dp — used to request a right-sized image. */
  width: number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  quality?: number;
}

/** Network image with a resized URL and a quiet fallback when it fails to load. */
export const RemoteImage: React.FC<Props> = React.memo(({ uri, width, style, resizeMode = 'cover', quality }) => {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.fallback, style as StyleProp<ViewStyle>]}>
        <Package size={Math.min(28, width / 4)} color={colors.neutral[300]} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri: optimizeImageUrl(uri, width, quality) }}
      style={[styles.image, style]}
      resizeMode={resizeMode}
      fadeDuration={150}
      onError={() => setFailed(true)}
    />
  );
});

/** Bottom-up dark gradient so white text stays readable on any photo. */
export const Shade: React.FC<{ from?: number; to?: number; style?: StyleProp<ViewStyle> }> = ({ from = 0.75, to = 0, style }) => (
  <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="shade" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#0C0A09" stopOpacity={from} />
          <Stop offset="1" stopColor="#0C0A09" stopOpacity={to} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#shade)" />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  image: { backgroundColor: colors.neutral[100] },
  fallback: { backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center' },
});
