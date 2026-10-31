import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TextInput } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Card, EmptyState, QuantityStepper, Skeleton } from '../../components/common/ui';
import { showToast } from '../../components/common/Toast';
import { ShoppingBag, Ticket, Trash2, Truck, Zap } from '../../components/icons';
import { useAddresses, useCartQuote } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import type { CartIssue, CartLine } from '../../api/types';
import { useAuthStore } from '../../store/auth';
import { MAX_QTY, useCartStore } from '../../store/cart';
import { useRequireLogin } from '../../hooks/useRequireLogin';
import type { RootStackParamList } from '../../types/navigation';
import { formatPKR } from '../../utils/formatters';
import { optimizeImageUrl } from '../../utils/images';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

/** Delivery city for express eligibility: default address, else the profile city. */
export function useDeliveryCity() {
  const { data: addresses } = useAddresses();
  const userCity = useAuthStore((s) => s.user?.city);
  return (addresses?.find((a) => a.isDefault) ?? addresses?.[0])?.city ?? userCity ?? null;
}

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const requireLogin = useRequireLogin();
  const { items, voucherCode, deliveryType, setQuantity, remove, setVoucher, setDeliveryType } = useCartStore();
  const city = useDeliveryCity();

  const body = useMemo(
    () => ({
      items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      voucherCode,
      deliveryType,
      city,
    }),
    [items, voucherCode, deliveryType, city],
  );
  const quote = useCartQuote(body);
  const q = quote.data;

  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [deliveryNotice, setDeliveryNotice] = useState<string | null>(null);

  // Act on server issues that need an automatic response (§7.6 table).
  useEffect(() => {
    if (!q) return;
    for (const issue of q.issues) {
      if (issue.code === 'VARIANT_NOT_FOUND' && issue.variantId && items.some((i) => i.variantId === issue.variantId)) {
        remove(issue.variantId);
        showToast('An unavailable item was removed from your bag');
      }
      if (issue.code === 'VOUCHER_INVALID' && voucherCode) {
        setVoucherError(issue.message);
        setVoucher(null);
      }
      if (issue.code === 'EXPRESS_UNAVAILABLE' && deliveryType === 'EXPRESS') {
        setDeliveryNotice(issue.message);
        setDeliveryType('STANDARD');
      }
    }
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const issueFor = (variantId: string): CartIssue | undefined => q?.issues.find((i) => i.variantId === variantId);
  const lineFor = (variantId: string): CartLine | undefined => q?.lines.find((l) => l.variantId === variantId);

  if (!items.length) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Bag</Text>
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          message="Find something you love — it'll wait here for you."
          actionLabel="Start shopping"
          onAction={() => navigation.navigate('MainTabs', { screen: 'ShopTab' })}
        />
      </View>
    );
  }

  const applyVoucher = () => {
    if (!voucherInput.trim()) return;
    setVoucherError(null);
    setVoucher(voucherInput);
    setVoucherInput('');
  };

  const checkout = () => {
    if (requireLogin('Log in to check out. Your bag is saved.', { name: 'Checkout' })) navigation.navigate('Checkout');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text style={styles.title}>
        Bag <Text style={styles.count}>({items.reduce((n, i) => n + i.quantity, 0)})</Text>
      </Text>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Free shipping progress */}
        {q && (
          <View style={styles.freeShip}>
            <Text style={styles.freeShipText}>
              {q.amountToFreeShipping > 0
                ? `Add ${formatPKR(q.amountToFreeShipping)} more for free delivery`
                : 'You’ve unlocked free standard delivery'}
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(100, (q.subtotal / q.freeShippingThreshold) * 100)}%` }]} />
            </View>
          </View>
        )}

        {/* Lines */}
        {items.map((entry) => {
          const line = lineFor(entry.variantId);
          const issue = issueFor(entry.variantId);
          const snap = line ?? entry.snapshot;
          return (
            <View key={entry.variantId} style={styles.line}>
              <TouchableOpacity
                onPress={() => snap?.productSlug && navigation.navigate('ProductDetail', { slug: snap.productSlug })}
                style={styles.thumbWrap}
              >
                {snap?.imageUrl ? <Image source={{ uri: optimizeImageUrl(snap.imageUrl, 84) }} style={styles.thumb} /> : <View style={styles.thumb} />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.lineTitle} numberOfLines={2}>
                  {snap?.title ?? 'Loading…'}
                </Text>
                <Text style={styles.lineMeta}>{[snap?.size && `Size ${snap.size}`, snap?.color].filter(Boolean).join(' · ')}</Text>

                {issue?.code === 'OUT_OF_STOCK' ? (
                  <Text style={styles.issue}>Sold out</Text>
                ) : issue?.code === 'INSUFFICIENT_STOCK' && line ? (
                  <TouchableOpacity onPress={() => setQuantity(entry.variantId, line.availableQuantity)}>
                    <Text style={styles.issue}>
                      Only {line.availableQuantity} left · <Text style={styles.issueAction}>Update to {line.availableQuantity}</Text>
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <View style={styles.lineBottom}>
                  {issue?.code === 'OUT_OF_STOCK' ? (
                    <Button title="Remove" variant="outline" size="sm" onPress={() => remove(entry.variantId)} />
                  ) : (
                    <QuantityStepper
                      value={entry.quantity}
                      max={Math.min(MAX_QTY, line?.availableQuantity || MAX_QTY)}
                      onChange={(v) => setQuantity(entry.variantId, v)}
                    />
                  )}
                  {line ? <Text style={styles.lineTotal}>{formatPKR(line.lineTotal)}</Text> : <Skeleton style={{ width: 70, height: 16 }} />}
                </View>
              </View>
              <TouchableOpacity onPress={() => remove(entry.variantId)} hitSlop={10} style={styles.trash} accessibilityLabel="Remove">
                <Trash2 size={17} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
          );
        })}

        {quote.isError && !q && (
          <Card style={{ marginTop: 12 }}>
            <Text style={styles.errorText}>{errorMessage(quote.error)}</Text>
            <Button title="Retry" variant="outline" size="sm" onPress={() => quote.refetch()} style={{ marginTop: 10 }} />
          </Card>
        )}

        {/* Delivery */}
        {q && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Delivery</Text>
            {q.deliveryOptions.map((o) => {
              const on = q.deliveryType === o.type;
              return (
                <TouchableOpacity
                  key={o.type}
                  disabled={!o.available}
                  onPress={() => {
                    setDeliveryNotice(null);
                    setDeliveryType(o.type);
                  }}
                  style={[styles.option, on && styles.optionOn, !o.available && styles.optionOff]}
                >
                  {o.type === 'EXPRESS' ? <Zap size={16} color={colors.primary[500]} /> : <Truck size={16} color={colors.neutral[700]} />}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>{o.label}</Text>
                    <Text style={styles.optionSub}>{o.available ? o.estimate : 'Not available for this address'}</Text>
                  </View>
                  <Text style={styles.optionFee}>{o.fee === 0 ? 'Free' : formatPKR(o.fee)}</Text>
                </TouchableOpacity>
              );
            })}
            {!!deliveryNotice && <Text style={styles.notice}>{deliveryNotice}</Text>}
          </Card>
        )}

        {/* Voucher */}
        <Card style={styles.card}>
          {q?.appliedVoucher ? (
            <View style={styles.voucherApplied}>
              <Ticket size={16} color={colors.success.dark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.voucherCode}>{q.appliedVoucher.code}</Text>
                <Text style={styles.optionSub}>{q.appliedVoucher.description}</Text>
              </View>
              <TouchableOpacity onPress={() => setVoucher(null)}>
                <Text style={styles.link}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.voucherRow}>
                <TextInput
                  value={voucherInput}
                  onChangeText={(t) => {
                    setVoucherInput(t);
                    setVoucherError(null);
                  }}
                  placeholder="Voucher code"
                  placeholderTextColor={colors.neutral[400]}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={styles.voucherInput}
                  onSubmitEditing={applyVoucher}
                  returnKeyType="done"
                />
                <Button title="Apply" variant="secondary" onPress={applyVoucher} disabled={!voucherInput.trim()} />
              </View>
              {!!voucherError && <Text style={styles.voucherError}>{voucherError}</Text>}
            </>
          )}
        </Card>

        {/* Summary */}
        {q && (
          <Card style={styles.card}>
            <SummaryRow label="Subtotal" value={formatPKR(q.subtotal)} />
            {q.discount > 0 && (
              <SummaryRow label={`Discount${q.appliedVoucher ? ` (${q.appliedVoucher.code})` : ''}`} value={`− ${formatPKR(q.discount)}`} green />
            )}
            <SummaryRow label="Delivery" value={q.deliveryFee === 0 ? 'Free' : formatPKR(q.deliveryFee)} />
            {q.extraFee > 0 && <SummaryRow label="Other charges" value={formatPKR(q.extraFee)} />}
            <View style={styles.divider} />
            <SummaryRow label="Total" value={formatPKR(q.total)} bold />
            <Text style={styles.cod}>Cash on delivery · {q.deliveryEstimate}</Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total</Text>
          {q ? <Text style={styles.footerTotal}>{formatPKR(q.total)}</Text> : <Skeleton style={{ width: 90, height: 20 }} />}
        </View>
        <Button
          title="Checkout"
          size="lg"
          onPress={checkout}
          disabled={!q?.canCheckout || quote.isFetching}
          style={{ flex: 1, marginLeft: 16 }}
        />
      </View>
    </View>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; bold?: boolean; green?: boolean }> = ({ label, value, bold, green }) => (
  <View style={styles.sumRow}>
    <Text style={[styles.sumLabel, bold && styles.sumBold, green && styles.green]}>{label}</Text>
    <Text style={[styles.sumValue, bold && styles.sumBold, green && styles.green]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  title: { fontSize: 28, fontWeight: typography.weight.bold, color: colors.neutral[900], paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  count: { fontSize: 18, color: colors.neutral[400] },
  body: { paddingHorizontal: 16, paddingBottom: 24 },
  freeShip: { backgroundColor: colors.neutral.white, borderRadius: radii.lg, padding: 14, marginBottom: 12 },
  freeShipText: { fontSize: 13, fontWeight: typography.weight.semibold, color: colors.neutral[800], marginBottom: 8 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.neutral[100], overflow: 'hidden' },
  fill: { height: 6, backgroundColor: colors.primary[500] },
  line: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 10,
  },
  thumbWrap: { borderRadius: radii.md, overflow: 'hidden' },
  thumb: { width: 84, height: 105, backgroundColor: colors.neutral[100] },
  lineTitle: { fontSize: 14, fontWeight: typography.weight.semibold, color: colors.neutral[900], paddingRight: 20 },
  lineMeta: { fontSize: 12.5, color: colors.neutral[500], marginTop: 3 },
  issue: { fontSize: 12.5, color: colors.error.DEFAULT, fontWeight: typography.weight.bold, marginTop: 6 },
  issueAction: { textDecorationLine: 'underline' },
  lineBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  lineTotal: { fontSize: 14.5, fontWeight: typography.weight.extrabold, color: colors.neutral[900] },
  trash: { position: 'absolute', top: 12, right: 12 },
  errorText: { fontSize: 13, color: colors.error.DEFAULT },
  card: { marginTop: 12, padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: typography.weight.bold, color: colors.neutral[900], marginBottom: 10 },
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
  optionOff: { opacity: 0.45 },
  optionTitle: { fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  optionSub: { fontSize: 12, color: colors.neutral[500], marginTop: 1 },
  optionFee: { fontSize: 13.5, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  notice: { fontSize: 12.5, color: colors.warning.dark, marginTop: 4 },
  voucherRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  voucherInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.neutral[900],
  },
  voucherError: { fontSize: 12.5, color: colors.error.DEFAULT, marginTop: 8 },
  voucherApplied: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  voucherCode: { fontSize: 14, fontWeight: typography.weight.extrabold, color: colors.success.dark },
  link: { fontSize: 13, fontWeight: typography.weight.bold, color: colors.primary[500] },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  sumLabel: { fontSize: 14, color: colors.neutral[600] },
  sumValue: { fontSize: 14, color: colors.neutral[900], fontWeight: typography.weight.semibold },
  sumBold: { fontSize: 17, fontWeight: typography.weight.extrabold, color: colors.neutral[900] },
  green: { color: colors.success.dark },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.surface.divider, marginVertical: 8 },
  cod: { fontSize: 12, color: colors.neutral[500], marginTop: 6 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surface.divider,
  },
  footerLabel: { fontSize: 12, color: colors.neutral[500] },
  footerTotal: { fontSize: 19, fontWeight: typography.weight.extrabold, color: colors.neutral[900] },
});
