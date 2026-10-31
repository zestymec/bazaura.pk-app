import React, { useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, EmptyState, Loading, OrderStatusPill, ScreenHeader, Sheet } from '../../components/common/ui';
import { Timeline } from '../../components/common/Timeline';
import { showToast } from '../../components/common/Toast';
import { useCancelOrder, useOrder } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import type { RootStackParamList } from '../../types/navigation';
import { formatDateTime, formatPKR, formatPhone } from '../../utils/formatters';
import { optimizeImageUrl } from '../../utils/images';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

export const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const insets = useSafeAreaInsets();
  const { data: order, isLoading, isError, error, refetch, isRefetching } = useOrder(params.orderId);
  const cancel = useCancelOrder(params.orderId);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (isLoading) return <><ScreenHeader title="Order" /><Loading /></>;
  if (isError || !order) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Order" />
        <EmptyState title="Order not found" message={errorMessage(error)} actionLabel="Go back" onAction={() => navigation.goBack()} />
      </View>
    );
  }

  const confirmCancel = () => {
    setCancelError(null);
    cancel.mutate(reason.trim() || undefined, {
      onSuccess: () => {
        setShowCancel(false);
        showToast('Order cancelled');
      },
      onError: (err) => setCancelError(errorMessage(err)),
    });
  };

  const a = order.shippingAddress;

  return (
    <View style={styles.screen}>
      <ScreenHeader title={order.orderNumber} />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary[500]} />}
      >
        <View style={styles.head}>
          <View>
            <Text style={styles.placed}>Placed {formatDateTime(order.createdAt)}</Text>
            <Text style={styles.estimate}>{order.status === 'CANCELLED' ? 'Cancelled' : order.deliveryEstimate}</Text>
          </View>
          <OrderStatusPill status={order.status} />
        </View>

        {order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
          <Card style={styles.card}>
            <Timeline steps={order.timeline} />
          </Card>
        )}
        {!!order.cancelReason && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Cancellation reason</Text>
            <Text style={styles.text}>{order.cancelReason}</Text>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {order.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              disabled={!item.productSlug}
              onPress={() => item.productSlug && navigation.navigate('ProductDetail', { slug: item.productSlug })}
              style={styles.item}
            >
              {item.imageUrl ? <Image source={{ uri: optimizeImageUrl(item.imageUrl, 56) }} style={styles.thumb} /> : <View style={styles.thumb} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.itemMeta}>
                  {[item.size && `Size ${item.size}`, item.color, `Qty ${item.quantity}`].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatPKR(item.lineTotal)}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <Row label="Subtotal" value={formatPKR(order.subtotal)} />
          {order.discount > 0 && <Row label={`Discount${order.voucherCode ? ` (${order.voucherCode})` : ''}`} value={`− ${formatPKR(order.discount)}`} />}
          <Row label="Delivery" value={order.deliveryFee === 0 ? 'Free' : formatPKR(order.deliveryFee)} />
          {order.extraFee > 0 && <Row label="Other charges" value={formatPKR(order.extraFee)} />}
          <View style={styles.divider} />
          <Row label="Total" value={formatPKR(order.total)} bold />
          <Text style={styles.cod}>Cash on Delivery</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Delivery address</Text>
          <Text style={styles.text}>{a.fullName}</Text>
          <Text style={styles.textMuted}>{[a.addressLine1, a.addressLine2, a.area, a.city, a.postalCode].filter(Boolean).join(', ')}</Text>
          <Text style={styles.textMuted}>{formatPhone(a.phone)}</Text>
          {!!order.customerNote && <Text style={[styles.textMuted, { marginTop: 8 }]}>Note: {order.customerNote}</Text>}
        </Card>

        {order.canCancel && <Button title="Cancel order" variant="outline" onPress={() => setShowCancel(true)} style={{ marginTop: 4 }} />}
      </ScrollView>

      <Sheet visible={showCancel} onClose={() => setShowCancel(false)} title="Cancel this order?">
        <Input label="Reason (optional)" value={reason} onChangeText={setReason} placeholder="e.g. ordered the wrong size" maxLength={300} />
        {!!cancelError && <Text style={styles.error}>{cancelError}</Text>}
        <Button title="Cancel order" variant="danger" size="lg" loading={cancel.isPending} onPress={confirmCancel} />
        <Button title="Keep order" variant="ghost" onPress={() => setShowCancel(false)} style={{ marginTop: 4 }} />
      </Sheet>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  body: { padding: 16 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  placed: { fontSize: 13, color: colors.neutral[500] },
  estimate: { fontSize: 17, fontWeight: typography.weight.bold, color: colors.neutral[900], marginTop: 2 },
  card: { marginBottom: 12, padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: typography.weight.bold, color: colors.neutral[900], marginBottom: 10 },
  text: { fontSize: 14, color: colors.neutral[900], fontWeight: typography.weight.semibold },
  textMuted: { fontSize: 13, color: colors.neutral[600], marginTop: 2, lineHeight: 19 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  thumb: { width: 56, height: 70, borderRadius: radii.sm, backgroundColor: colors.neutral[100] },
  itemTitle: { fontSize: 13.5, fontWeight: typography.weight.semibold, color: colors.neutral[900] },
  itemMeta: { fontSize: 12, color: colors.neutral[500], marginTop: 3 },
  itemTotal: { fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: 14, color: colors.neutral[600] },
  rowValue: { fontSize: 14, color: colors.neutral[900], fontWeight: typography.weight.semibold },
  bold: { fontSize: 16, fontWeight: typography.weight.extrabold, color: colors.neutral[900] },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.surface.divider, marginVertical: 8 },
  cod: { fontSize: 12, color: colors.success.dark, fontWeight: typography.weight.bold, marginTop: 6 },
  error: { fontSize: 13, color: colors.error.DEFAULT, marginBottom: 10 },
});
