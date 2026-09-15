import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

interface OfflineBannerProps {
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnectivity = async () => {
    setIsChecking(true);
    try {
      // Lightweight connectivity check via public DNS probe or ping
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      setIsOffline(!response.ok && response.status !== 204);
    } catch {
      setIsOffline(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000); // periodic check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleManualRetry = () => {
    checkConnectivity();
    onRetry?.();
  };

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.leftRow}>
        <WifiOff size={14} color={colors.neutral.white} />
        <Text style={styles.bannerText}>
          No Internet Connection. Offline Mode Active.
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleManualRetry}
        disabled={isChecking}
        style={styles.retryBtn}
        activeOpacity={0.7}
      >
        <RefreshCw size={12} color={colors.neutral.white} />
        <Text style={styles.retryText}>{isChecking ? 'Checking...' : 'Retry'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.neutral[900],
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bannerText: {
    color: colors.neutral.white,
    fontSize: 11,
    fontWeight: typography.weight.medium,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  retryText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: typography.weight.semibold,
  },
});
