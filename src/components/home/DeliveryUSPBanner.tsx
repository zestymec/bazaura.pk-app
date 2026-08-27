import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Zap, Truck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

interface DeliveryUSPBannerProps {
  onLahoreExpressPress?: () => void;
  onNationwidePress?: () => void;
}

export const DeliveryUSPBanner: React.FC<DeliveryUSPBannerProps> = ({
  onLahoreExpressPress,
  onNationwidePress,
}) => {
  return (
    <View style={styles.container}>
      {/* 2-Hour Lahore Express Pill */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          haptic.selection();
          onLahoreExpressPress?.();
        }}
        style={styles.segmentBtn}
      >
        <View style={styles.expressIconWrap}>
          <Zap size={14} color={colors.primary[500]} fill={colors.primary[500]} />
        </View>

        <View style={styles.textCol}>
          <Text style={styles.titleExpress}>2-Hour Lahore</Text>
          <Text style={styles.subExpress}>Express Dispatch</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.hairlineDivider} />

      {/* 2-3 Days Nationwide Pill */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          haptic.selection();
          onNationwidePress?.();
        }}
        style={styles.segmentBtn}
      >
        <View style={styles.standardIconWrap}>
          <Truck size={14} color={colors.neutral[700]} />
        </View>

        <View style={styles.textCol}>
          <Text style={styles.titleStandard}>2-3 Days</Text>
          <Text style={styles.subStandard}>All Pakistan</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.subtle,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  hairlineDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.neutral[200],
    marginHorizontal: 4,
  },
  expressIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.delivery.expressBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    justifyContent: 'center',
  },
  titleExpress: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  subExpress: {
    fontSize: 10,
    color: colors.primary[600],
    fontWeight: typography.weight.medium,
  },
  titleStandard: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  subStandard: {
    fontSize: 10,
    color: colors.neutral[500],
    fontWeight: typography.weight.medium,
  },
});
