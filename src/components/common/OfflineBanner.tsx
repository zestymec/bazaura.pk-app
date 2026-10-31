import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './AppText';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

/**
 * Event-driven connectivity banner. Uses the OS network callbacks instead of
 * polling a remote URL, so it costs nothing while the user is online.
 */
export const OfflineBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      // isInternetReachable is null while unknown — don't flash the banner then.
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    const state = await NetInfo.refresh();
    setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    setIsChecking(false);
  };

  if (!isOffline) return null;

  return (
    <View pointerEvents="box-none" style={[styles.banner, { bottom: insets.bottom + 76 }]}>
      <View style={styles.leftRow}>
        <WifiOff size={14} color={colors.neutral.white} />
        <Text style={styles.bannerText}>You're offline. Showing saved items.</Text>
      </View>
      <TouchableOpacity onPress={handleRetry} disabled={isChecking} style={styles.retryBtn} activeOpacity={0.7}>
        <RefreshCw size={12} color={colors.neutral.white} />
        <Text style={styles.retryText}>{isChecking ? 'Checking…' : 'Retry'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Floats above the tab bar so it never shifts screen layout.
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral[900],
    paddingVertical: 10,
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
    fontSize: 12,
    fontWeight: typography.weight.semibold,
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
    fontSize: 11,
    fontWeight: typography.weight.bold,
  },
});
