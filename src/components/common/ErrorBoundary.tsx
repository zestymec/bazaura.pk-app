import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './AppText';
import { CircleAlert as AlertTriangle, RefreshCw } from '../icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.warn('ErrorBoundary caught an unhandled error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <AlertTriangle size={32} color={colors.primary[500]} />
            </View>
            <Text style={styles.title}>Something Went Wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred while loading this view. Please try again.
            </Text>
            {__DEV__ && this.state.error?.message && (
              <Text style={styles.devError} numberOfLines={3}>
                {this.state.error.message}
              </Text>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={this.handleReset}
              style={styles.retryButton}
            >
              <RefreshCw size={16} color={colors.neutral.white} />
              <Text style={styles.retryText}>Reload App</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.subtle,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  devError: {
    fontSize: 11,
    color: colors.error.DEFAULT,
    backgroundColor: colors.neutral[100],
    padding: 8,
    borderRadius: radii.sm,
    width: '100%',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.lg,
    gap: 8,
  },
  retryText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
});
