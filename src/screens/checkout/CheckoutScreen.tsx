import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, Loading, Pill, ScreenHeader, Skeleton } from '../../components/common/ui';
import { Banknote, CircleCheck, MapPin, Plus, Truck, Zap } from '../../components/icons';
import { useAddresses, useCartQuote, usePlaceOrder } from '../../api/hooks';
import { ApiError, errorMessage } from '../../api/client';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';
import type { RootStackParamList } from '../../types/navigation';
import { formatPKR, formatPhone } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { items, voucherCode, deliveryType, setDeliveryType, clear } = useCartStore();
  const addresses = useAddresses();
  const place = usePlaceOrder();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const openedForm = useRef(false);

  // Session ended while here → back to login.
  useEffect(() => {
    if (!isLoggedIn) navigation.replace('Login', { reason: 'Log in to check out.', then: { name: 'Checkout' } });
  }, [isLoggedIn, navigation]);

  // Pre-select the default address; with no addresses, go straight to the form (§7.8.1).
  useEffect(() => {
    const list = addresses.data;
    if (!list) return;
    if (!list.length) {
      if (!openedForm.current) {
        openedForm.current = true;
        navigation.navigate('AddressForm');
      }
      return;
    }
    if (!addressId || !list.some((a) => a.id === addressId)) setAddressId((list.find((a) => a.isDefault) ?? list[0]).id);
  }, [addresses.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const address = addresses.data?.find((a) => a.id === addressId);
  const body = useMemo(
    () => ({ items: items.map(({ variantId, quantity }) => ({ variantId, quantity })), voucherCode, deliveryType, city: address?.city ?? null }),
    [items, voucherCode, deliveryType, address?.city],
  );
  const quote = useCartQuote(body);
  const q = quote.data;

  // Express became unavailable for the chosen address → fall back to standard.
  useEffect(() => {
    if (q?.issues.some((i) => i.code === 'EXPRESS_UNAVAILABLE') && deliveryType === 'EXPRESS') setDeliveryType('STANDARD');
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const placeOrder = () => {
    if (!address || !q?.canCheckout || place.isPending) return;
    haptic.medium();
    place.mutate(
      { items: body.items, addressId: address.id, deliveryType: q.deliveryType, voucherCode: voucherCode || null, customerNote: note.trim() || null },
      {
        onSuccess: (order) => {
          clear();
          haptic.success();
          navigation.reset({ index: 1, routes: [{ name: 'MainTabs' }, { name: 'OrderSuccess', params: { orderId: order.id } }] });
        },
        onError: (err) => {
          haptic.error();
          if (err instanceof ApiError && err.code === 'CART_INVALID') {
            Alert.alert('Your bag changed', err.message, [{ text: 'Review bag', onPress: () => navigation.navigate('MainTabs', { screen: 'BagTab' }) }]);
          } else if (err instanceof ApiError && err.code === 'ADDRESS_NOT_FOUND') {
            addresses.refetch();
            Alert.alert('Address not found', 'Please choose another address.');
          } else {
            Alert.alert('Order not placed', errorMessage(err));
          }
        },
      },
    );
  };

  if (!items.length && !place.isSuccess) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Checkout" />
        <Text style={styles.emptyText}>Your bag is empty.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Checkout" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Address */}
        <Card style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Deliver to</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddressForm')} style={styles.add}>
              <Plus size={15} color={colors.primary[500]} />
              <Text style={styles.link}>New address</Text>
            </TouchableOpacity>
          </View>
          {addresses.isLoading ? (
            <Loading style={{ paddingVertical: 16 }} />
          ) : (
            addresses.data?.map((a) => {
              const on = a.id === addressId;
              return (
                <TouchableOpacity key={a.id} onPress={() => setAddressId(a.id)} style={[styles.address, on && styles.addressOn]}>
                  <MapPin size={17} color={on ? colors.primary[500] : colors.neutral[400]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.addressTop}>
                      <Text style={styles.addressName}>{a.label ? `${a.label} · ` : ''}{a.fullName}</Text>
                      {a.isExpressEligible && <Pill label="Express" tone="brand" />}
                    </View>
                    <Text style={styles.addressLine}>
                      {[a.addressLine1, a.addressLine2, a.area, a.city].filter(Boolean).join(', ')}
                    </Text>
                    <Text style={styles.addressLine}>{formatPhone(a.phone)}</Text>
                  </View>
                  {on && <CircleCheck size={18} color={colors.primary[500]} />}
                </TouchableOpacity>
              );
            })
          )}
        </Card>

        {/* Delivery */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Delivery</Text>
          {!q ? (
            <Skeleton style={{ height: 60, borderRadius: radii.md }} />
          ) : (
            q.deliveryOptions.map((o) => {
              const on = q.deliveryType === o.type;
              return (
                <TouchableOpacity
                  key={o.type}
                  disabled={!o.available}
                  onPress={() => setDeliveryType(o.type)}
                  style={[styles.option, on && styles.optionOn, !o.available && { opacity: 0.45 }]}
                >
                  {o.type === 'EXPRESS' ? <Zap size={16} color={colors.primary[500]} /> : <Truck size={16} color={colors.neutral[700]} />}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>{o.label}</Text>
                    <Text style={styles.optionSub}>{o.available ? o.estimate : `Not available in ${address?.city ?? 'this city'}`}</Text>
                  </View>
                  <Text style={styles.optionFee}>{o.fee === 0 ? 'Free' : formatPKR(o.fee)}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </Card>

        {/* Payment — Cash on Delivery only (§7.8.4) */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={[styles.option, styles.optionOn]}>
            <Banknote size={17} color={colors.success.dark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Cash on Delivery</Text>
              <Text style={styles.optionSub}>Pay when your order arrives</Text>
            </View>
            <CircleCheck size={18} color={colors.primary[500]} />
          </View>
        </Card>

        {/* Note */}
        <Card style={styles.card}>
          <Input
            label="Note for delivery (optional)"
            value={note}
            onChangeText={setNote}
            maxLength={500}
            placeholder="e.g. call before arriving"
            multiline
            containerStyle={{ marginBottom: 0 }}
          />
        </Card>

        {/* Summary */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Order summary</Text>
          {!q ? (
            <Skeleton style={{ height: 100 }} />
          ) : (
            <>
              {q.lines.map((l) => (
                <View key={l.variantId} style={styles.sumRow}>
                  <Text style={styles.sumItem} numberOfLines={1}>
                    {l.quantity} × {l.title} ({[l.size, l.color].filter(Boolean).join(', ')})
                  </Text>
                  <Text style={styles.sumValue}>{formatPKR(l.lineTotal)}</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <Row label="Subtotal" value={formatPKR(q.subtotal)} />
              {q.discount > 0 && <Row label={`Discount (${q.appliedVoucher?.code ?? ''})`} value={`− ${formatPKR(q.discount)}`} />}
              <Row label="Delivery" value={q.deliveryFee === 0 ? 'Free' : formatPKR(q.deliveryFee)} />
              {q.extraFee > 0 && <Row label="Other charges" value={formatPKR(q.extraFee)} />}
              <View style={styles.divider} />
              <Row label="Total" value={formatPKR(q.total)} bold />
              {q.issues
                .filter((i) => i.code !== 'EXPRESS_UNAVAILABLE')
                .map((i, idx) => (
                  <Text key={idx} style={styles.issue}>
                    {i.message}
                  </Text>
                ))}
            </>
          )}
        </Card>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          title={q ? `Place order · ${formatPKR(q.total)}` : 'Place order'}
          size="lg"
          loading={place.isPending}
          disabled={!address || !q?.canCheckout || quote.isFetching}
          onPress={placeOrder}
        />
        {q && !q.canCheckout && (
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'BagTab' })}>
            <Text style={styles.fix}>Some items need attention — review your bag</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <View style={styles.sumRow}>
    <Text style={[styles.sumLabel, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.sumValue, bold && styles.bold]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  body: { padding: 16, paddingBottom: 24 },
  emptyText: { textAlign: 'center', marginTop: 40, color: colors.neutral[500] },
  card: { marginBottom: 12, padding: 14 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: typography.weight.bold, color: colors.neutral[900], marginBottom: 10 },
  add: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 10 },
  link: { fontSize: 13, fontWeight: typography.weight.bold, color: colors.primary[500] },
  address: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[100],
    marginBottom: 8,
  },
  addressOn: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  addressTop: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  addressName: { fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  addressLine: { fontSize: 12.5, color: colors.neutral[600], marginTop: 2 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[100],
    marginBottom: 8,
  },
  optionOn: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  optionTitle: { fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  optionSub: { fontSize: 12, color: colors.neutral[500], marginTop: 1 },
  optionFee: { fontSize: 13.5, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 12 },
  sumItem: { flex: 1, fontSize: 13, color: colors.neutral[700] },
  sumLabel: { fontSize: 14, color: colors.neutral[600] },
  sumValue: { fontSize: 14, color: colors.neutral[900], fontWeight: typography.weight.semibold },
  bold: { fontSize: 17, fontWeight: typography.weight.extrabold, color: colors.neutral[900] },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.surface.divider, marginVertical: 8 },
  issue: { fontSize: 12.5, color: colors.error.DEFAULT, marginTop: 6 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.neutral.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surface.divider,
  },
  fix: { fontSize: 12.5, color: colors.error.DEFAULT, textAlign: 'center', marginTop: 8, fontWeight: typography.weight.semibold },
});
