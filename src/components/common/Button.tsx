import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';
import { Text } from './AppText';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  enableHaptics?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  enableHaptics = true,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    if (enableHaptics) haptic.light();
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: disabled ? colors.neutral[300] : colors.primary[500],
          },
          text: { color: colors.neutral.white },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.neutral[100],
          },
          text: { color: colors.neutral[900] },
        };
      case 'gold':
        return {
          container: {
            backgroundColor: colors.secondary[100],
          },
          text: { color: colors.secondary[700] },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: colors.neutral[200],
            borderWidth: 1,
          },
          text: { color: colors.neutral[900] },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.error.DEFAULT,
          },
          text: { color: colors.neutral.white },
        };
      case 'ghost':
      default:
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.primary[500] },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radii.md },
          text: { fontSize: typography.size.xs },
        };
      case 'lg':
        return {
          container: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: radii.lg },
          text: { fontSize: typography.size.sm, fontWeight: typography.weight.bold },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: radii.md },
          text: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        sStyles.container,
        vStyles.container,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' || variant === 'secondary' ? colors.neutral[900] : colors.neutral.white}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.text, sStyles.text, vStyles.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
  text: {
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
