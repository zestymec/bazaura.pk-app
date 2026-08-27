import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  required,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredMark}> *</Text>}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          !!error && styles.errorWrapper,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.neutral[400]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
  },
  requiredMark: {
    color: colors.primary[500],
    fontWeight: typography.weight.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    paddingHorizontal: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focusedWrapper: {
    borderColor: colors.primary[500],
    backgroundColor: colors.neutral.white,
  },
  errorWrapper: {
    borderColor: colors.error.DEFAULT,
    backgroundColor: '#FEF2F2',
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[900],
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 11,
    color: colors.error.DEFAULT,
    marginTop: 3,
    marginLeft: 2,
  },
  helperText: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 3,
    marginLeft: 2,
  },
});
