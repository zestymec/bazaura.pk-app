/**
 * Small shared UI pieces. Kept in one file because each is only a few lines.
 */
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './AppText';
import { Button } from './Button';
import { ChevronLeft, ChevronRight, LucideIcon, Minus, Plus, X } from '../icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { formatPKR } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';
import type { CustomRequestStatus, OrderStatus } from '../../api/types';

/* ── Screen header with back button ─────────────────── */

export const ScreenHeader: React.FC<{ title: string; right?: React.ReactNode; onBack?: () => void; back?: boolean }> = ({
  title,
  right,
  onBack,
  back = true,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: insets.top + 6 }]}>
      {back ? (
        <TouchableOpacity
          onPress={onBack ?? (() => navigation.goBack())}
          style={s.headerBtn}
          hitSlop={10}
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} color={colors.neutral[900]} />
        </TouchableOpacity>
      ) : (
        <View style={s.headerBtn} />
      )}
      <Text style={s.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={[s.headerBtn, s.headerRight]}>{right}</View>
    </View>
  );
};

/* ── Price with optional strike-through ──────────────── */

export const Price: React.FC<{ price: number; compareAt?: number | null; discount?: number | null; size?: 'sm' | 'lg' }> = ({
  price,
  compareAt,
  discount,
  size = 'sm',
}) => (
  <View style={s.priceRow}>
    <Text style={size === 'lg' ? s.priceLg : s.priceSm}>{formatPKR(price)}</Text>
    {!!compareAt && compareAt > price && (
      <Text style={size === 'lg' ? s.compareLg : s.compareSm}>{formatPKR(compareAt)}</Text>
    )}
    {!!discount && size === 'lg' && (
      <View style={s.discountTag}>
        <Text style={s.discountText}>-{discount}%</Text>
      </View>
    )}
  </View>
);

/* ── Empty / error / loading states ──────────────────── */

export const EmptyState: React.FC<{
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({ icon: Icon, title, message, actionLabel, onAction, style }) => (
  <View style={[s.empty, style]}>
    {Icon && (
      <View style={s.emptyIcon}>
        <Icon size={28} color={colors.primary[500]} />
      </View>
    )}
    <Text style={s.emptyTitle}>{title}</Text>
    {!!message && <Text style={s.emptyMsg}>{message}</Text>}
    {!!actionLabel && onAction && <Button title={actionLabel} onPress={onAction} style={s.emptyBtn} />}
  </View>
);

export const Loading: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => (
  <View style={[s.loading, style]}>
    <ActivityIndicator color={colors.primary[500]} />
  </View>
);

/* ── Skeleton shimmer ────────────────────────────────── */

export const Skeleton: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[s.skeleton, style, { opacity: pulse }]} />;
};

export const ProductCardSkeleton: React.FC<{ width: number }> = ({ width }) => (
  <View style={{ width, marginBottom: 16 }}>
    <Skeleton style={{ width, height: width * 1.25, borderRadius: radii.lg }} />
    <Skeleton style={{ width: width * 0.8, height: 12, marginTop: 10 }} />
    <Skeleton style={{ width: width * 0.45, height: 12, marginTop: 6 }} />
  </View>
);

/* ── Chip ────────────────────────────────────────────── */

export const Chip: React.FC<{
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  swatch?: string | null;
  style?: StyleProp<ViewStyle>;
}> = ({ label, selected, disabled, onPress, swatch, style }) => (
  <TouchableOpacity
    activeOpacity={0.75}
    disabled={disabled}
    onPress={() => {
      haptic.selection();
      onPress?.();
    }}
    style={[s.chip, selected && s.chipOn, disabled && s.chipOff, style]}
    accessibilityState={{ selected, disabled }}
  >
    {!!swatch && <View style={[s.swatch, { backgroundColor: `#${swatch.replace('#', '')}` }]} />}
    <Text style={[s.chipText, selected && s.chipTextOn, disabled && s.chipTextOff]}>{label}</Text>
  </TouchableOpacity>
);

/* ── Quantity stepper ────────────────────────────────── */

export const QuantityStepper: React.FC<{ value: number; min?: number; max: number; onChange: (v: number) => void }> = ({
  value,
  min = 1,
  max,
  onChange,
}) => (
  <View style={s.stepper}>
    <TouchableOpacity
      onPress={() => onChange(value - 1)}
      disabled={value <= min}
      style={s.stepBtn}
      hitSlop={6}
      accessibilityLabel="Decrease quantity"
    >
      <Minus size={14} color={value <= min ? colors.neutral[300] : colors.neutral[800]} />
    </TouchableOpacity>
    <Text style={s.stepValue}>{value}</Text>
    <TouchableOpacity
      onPress={() => onChange(value + 1)}
      disabled={value >= max}
      style={s.stepBtn}
      hitSlop={6}
      accessibilityLabel="Increase quantity"
    >
      <Plus size={14} color={value >= max ? colors.neutral[300] : colors.neutral[800]} />
    </TouchableOpacity>
  </View>
);

/* ── Status pills ────────────────────────────────────── */

type Tone = 'neutral' | 'progress' | 'success' | 'muted' | 'brand';
const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.neutral[100], fg: colors.neutral[700] },
  progress: { bg: colors.info.light, fg: colors.info.dark },
  success: { bg: colors.success.light, fg: colors.success.dark },
  muted: { bg: colors.error.light, fg: colors.error.dark },
  brand: { bg: colors.primary[50], fg: colors.primary[700] },
};

const ORDER_PILL: Record<OrderStatus, [string, Tone]> = {
  PLACED: ['Placed', 'neutral'],
  CONFIRMED: ['Confirmed', 'neutral'],
  PACKED: ['Packed', 'progress'],
  SHIPPED: ['On the way', 'progress'],
  DELIVERED: ['Delivered', 'success'],
  CANCELLED: ['Cancelled', 'muted'],
  RETURNED: ['Returned', 'muted'],
};

/** §7.12 status meanings. */
export const REQUEST_STATUS_LABEL: Record<CustomRequestStatus, string> = {
  SUBMITTED: 'Received',
  IN_REVIEW: "We're finding it",
  QUOTED: 'Quote ready',
  CONFIRMED: 'Order created',
  UNAVAILABLE: "Couldn't arrange",
  CANCELLED: 'Cancelled',
};
const REQUEST_TONE: Record<CustomRequestStatus, Tone> = {
  SUBMITTED: 'neutral',
  IN_REVIEW: 'progress',
  QUOTED: 'brand',
  CONFIRMED: 'success',
  UNAVAILABLE: 'muted',
  CANCELLED: 'muted',
};

export const Pill: React.FC<{ label: string; tone?: Tone }> = ({ label, tone = 'neutral' }) => (
  <View style={[s.pill, { backgroundColor: TONES[tone].bg }]}>
    <Text style={[s.pillText, { color: TONES[tone].fg }]}>{label}</Text>
  </View>
);

export const OrderStatusPill: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <Pill label={ORDER_PILL[status][0]} tone={ORDER_PILL[status][1]} />
);

export const RequestStatusPill: React.FC<{ status: CustomRequestStatus }> = ({ status }) => (
  <Pill label={REQUEST_STATUS_LABEL[status]} tone={REQUEST_TONE[status]} />
);

/* ── Section header ──────────────────────────────────── */

export const SectionHeader: React.FC<{ title: string; actionLabel?: string; onAction?: () => void }> = ({
  title,
  actionLabel,
  onAction,
}) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    {!!actionLabel && (
      <TouchableOpacity onPress={onAction} style={s.sectionAction} hitSlop={8}>
        <Text style={s.sectionActionText}>{actionLabel}</Text>
        <ChevronRight size={14} color={colors.primary[500]} />
      </TouchableOpacity>
    )}
  </View>
);

/* ── Card / list row ─────────────────────────────────── */

export const Card: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({ children, style }) => (
  <View style={[s.card, style]}>{children}</View>
);

export const Row: React.FC<{
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}> = ({ icon: Icon, title, subtitle, onPress, right, danger }) => (
  <TouchableOpacity activeOpacity={0.7} disabled={!onPress} onPress={onPress} style={s.row}>
    {Icon && <Icon size={19} color={danger ? colors.error.DEFAULT : colors.neutral[700]} />}
    <View style={s.rowText}>
      <Text style={[s.rowTitle, danger && { color: colors.error.DEFAULT }]}>{title}</Text>
      {!!subtitle && <Text style={s.rowSub}>{subtitle}</Text>}
    </View>
    {right ?? (onPress && !danger ? <ChevronRight size={18} color={colors.neutral[400]} /> : null)}
  </TouchableOpacity>
);

/* ── Bottom sheet ────────────────────────────────────── */

export const Sheet: React.FC<{ visible: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }> = ({
  visible,
  onClose,
  title,
  children,
  footer,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[s.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={s.sheetHandle} />
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <X size={20} color={colors.neutral[700]} />
          </TouchableOpacity>
        </View>
        {children}
        {footer}
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.divider,
  },
  headerBtn: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerRight: { alignItems: 'flex-end', paddingRight: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: typography.weight.bold, color: colors.neutral[900] },

  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  priceSm: { fontSize: 14, fontWeight: typography.weight.extrabold, color: colors.neutral[900] },
  priceLg: { fontSize: 22, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  compareSm: { fontSize: 12, color: colors.neutral[400], textDecorationLine: 'line-through' },
  compareLg: { fontSize: 15, color: colors.neutral[400], textDecorationLine: 'line-through' },
  discountTag: { backgroundColor: colors.primary[500], borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  discountText: { color: colors.neutral.white, fontSize: 12, fontWeight: typography.weight.extrabold },

  empty: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 18, fontWeight: typography.weight.bold, color: colors.neutral[900], textAlign: 'center' },
  emptyMsg: { fontSize: 14, color: colors.neutral[500], textAlign: 'center', marginTop: 6, lineHeight: 20 },
  emptyBtn: { marginTop: 18, paddingHorizontal: 24 },
  loading: { paddingVertical: 40, alignItems: 'center' },

  skeleton: { backgroundColor: colors.neutral[100], borderRadius: radii.sm },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral.white,
  },
  chipOn: { borderColor: colors.neutral[900], backgroundColor: colors.neutral[900] },
  chipOff: { opacity: 0.4 },
  chipText: { fontSize: 13, fontWeight: typography.weight.semibold, color: colors.neutral[800] },
  chipTextOn: { color: colors.neutral.white },
  chipTextOff: { textDecorationLine: 'line-through' },
  swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radii.full,
    height: 34,
  },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 22, textAlign: 'center', fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900] },

  pill: { borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  pillText: { fontSize: 11.5, fontWeight: typography.weight.bold },

  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sectionActionText: { fontSize: 13, fontWeight: typography.weight.bold, color: colors.primary[500] },

  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: typography.weight.semibold, color: colors.neutral[900] },
  rowSub: { fontSize: 12.5, color: colors.neutral[500], marginTop: 2 },

  backdrop: { flex: 1, backgroundColor: colors.surface.backdrop },
  sheet: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[200],
    marginTop: 10,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  sheetTitle: { fontSize: 18, fontWeight: typography.weight.bold, color: colors.neutral[900] },
});
