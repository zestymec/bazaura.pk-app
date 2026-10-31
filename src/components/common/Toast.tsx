import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { Text } from './AppText';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

const useToastStore = create<{ message: string | null; key: number }>(() => ({ message: null, key: 0 }));

/** Short confirmation at the bottom of the screen, e.g. "Added to bag". */
export function showToast(message: string) {
  useToastStore.setState((s) => ({ message, key: s.key + 1 }));
}

export const ToastHost: React.FC = () => {
  const { message, key } = useToastStore();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.delay(1800),
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [key, message, anim]);

  if (!message) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          bottom: insets.bottom + 84,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.neutral[900],
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.full,
    maxWidth: '86%',
  },
  text: { color: colors.neutral.white, fontSize: 14, fontWeight: typography.weight.semibold, textAlign: 'center' },
});
