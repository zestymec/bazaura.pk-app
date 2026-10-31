import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from './AppText';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

export type BadgeVariant =
  | 'express'
  | 'hot'
  | 'bestSeller'
  | 'discount'
  | 'success'
  | 'warning'
  | 'outline'
  | 'gold';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'express',
  size = 'md',
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'express':
        return {
          container: { backgroundColor: colors.delivery.expressBg },
          text: { color: colors.delivery.expressText, fontWeight: typography.weight.bold },
        };
      case 'hot':
        return {
          container: { backgroundColor: '#FEE2E2' },
          text: { color: '#DC2626', fontWeight: typography.weight.bold },
        };
      case 'bestSeller':
        return {
          container: { backgroundColor: '#EFF6FF' },
          text: { color: '#2563EB', fontWeight: typography.weight.bold },
        };
      case 'gold':
        return {
          container: { backgroundColor: colors.secondary[100] },
          text: { color: colors.secondary[700], fontWeight: typography.weight.bold },
        };
      case 'discount':
        return {
          container: { backgroundColor: colors.primary[500] },
          text: { color: colors.neutral.white, fontWeight: typography.weight.bold },
        };
      case 'success':
        return {
          container: { backgroundColor: colors.success.light },
          text: { color: colors.success.dark, fontWeight: typography.weight.semibold },
        };
      case 'warning':
        return {
          container: { backgroundColor: colors.warning.light },
          text: { color: colors.warning.dark, fontWeight: typography.weight.semibold },
        };
      case 'outline':
      default:
        return {
          container: { backgroundColor: colors.neutral[100] },
          text: { color: colors.neutral[700], fontWeight: typography.weight.medium },
        };
    }
  };

  const vStyles = getVariantStyles();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: isSm ? 6 : 8,
          paddingVertical: isSm ? 2 : 3,
          borderRadius: radii.sm,
        },
        vStyles.container,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            fontSize: isSm ? 10 : 11,
          },
          vStyles.text,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 3,
  },
  text: {
    letterSpacing: 0.1,
  },
});
