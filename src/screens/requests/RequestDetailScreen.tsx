import React, { useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, EmptyState, Loading, RequestStatusPill, ScreenHeader, Sheet } from '../../components/common/ui';
import { useAcceptQuote, useCancelCustomRequest, useCustomRequest } from '../../api/hooks';
import { ApiError, errorMessage } from '../../api/client';
import type { RootStackParamList } from '../../types/navigation';
import { formatDate, formatDateTime, formatPKR, formatPhone } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

const CANCELLABLE = ['SUBMITTED', 'IN_REVIEW', 'QUOTED'];

export const RequestDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'RequestDetail'>>();
  const insets = useSafeAreaInsets();
  const { data: r, isLoading, isError, error, refetch, isRefetching } = useCustomRequest(params.requestId);
  const accept = useAcceptQuote(params.requestId);
  const cancel = useCancelCustomRequest(params.requestId);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState('');

  if (isLoading) return <><ScreenHeader title="Request" /><Loading /></>;
  if (isError || !r) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Request" />
        <EmptyState title="Request not found" message={errorMessage(error)} actionLabel="Go back" onAction={() => navigation.goBack()} />
      </View>
    );
  }

  const onAccept = () =>
    accept.mutate(undefined, {
      onSuccess: (updated) => updated.orderId && navigation.replace('OrderDetail', { orderId: updated.orderId }),
      onError: (err) =>
        Alert.alert(
          'Couldn’t accept',
          err instanceof ApiError && err.code === 'QUOTE_EXPIRED' ? 'This quote expired. We’ll send a new one.' : errorMessage(err),
        ),
    });

  const onCancel = () =>
    cancel.mutate(reason.trim() || undefined, {
      onSuccess: () => setShowCancel(false),
      onError: (err) => {
        setShowCancel(false);
        Alert.alert('Couldn’t cancel', errorMessage(err));
      },
    });

  const a = r.deliveryAddress;

  return (
    <View style={styles.screen}>
      <ScreenHeader title={r.requestNumber} />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary[500]} />}
      >
        <View style={styles.head}>
          <View style={{ flex: 1 }}>
            <Text style={styles.type}>{r.requestType === 'GIFT' ? 'Gift' : 'Custom item'} · {formatDate(r.createdAt)}</Text>
            <Text style={styles.title}>{r.itemName}</Text>
          </View>
          <RequestStatusPill status={r.status} />
        </View>

        {(r.status === 'SUBMITTED' || r.status === 'IN_REVIEW') && (
          <Card style={[styles.card, styles.waiting]}>
            <Text style={styles.waitingText}>
              Our team is working on your request. You'll see a price quote here — pull down to refresh.
            </Text>
          </Card>
        )}
        {!!r.staffNote && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Note from Bazaura</Text>
            <Text style={styles.text}>{r.staffNote}</Text>
          </Card>
        )}

        {/* Quote */}
        {r.status === 'QUOTED' && r.quote && (
          <Card style={[styles.card, styles.quote]}>
            <Text style={styles.cardTitle}>Your quote</Text>
            <Row label="Item price" value={formatPKR(r.quote.itemPrice)} />
            <Row label="Delivery" value={r.quote.deliveryFee === 0 ? 'Free' : formatPKR(r.quote.deliveryFee)} />
            {r.quote.extraFee > 0 && <Row label="Other charges" value={formatPKR(r.quote.extraFee)} />}
            <View style={styles.divider} />
            <Row label="Total" value={formatPKR(r.quote.total)} bold />
            {!!r.quote.notes && <Text style={styles.notes}>{r.quote.notes}</Text>}
            <Text style={styles.valid}>Valid until {formatDateTime(r.quote.validUntil)} · Cash on delivery</Text>
            <Button title="Accept & place order" size="lg" loading={accept.isPending} onPress={onAccept} style={{ marginTop: 14 }} />
          </Card>
        )}
        {r.status === 'CONFIRMED' && r.orderId && (
          <Button title="View order" size="lg" onPress={() => navigation.navigate('OrderDetail', { orderId: r.orderId! })} style={{ marginBottom: 12 }} />
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <Text style={styles.text}>{r.description}</Text>
          <Row label="Quantity" value={String(r.quantity)} />
          {r.budget != null && <Row label="Budget" value={formatPKR(r.budget)} />}
          <Row label="Delivery" value={r.deliveryType === 'EXPRESS' ? 'Express' : 'Standard'} />
          {!!r.referenceUrl && <Text style={styles.textMuted} numberOfLines={1}>{r.referenceUrl}</Text>}
          {r.imageUrls.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 10 }}>
              {r.imageUrls.map((u) => (
                <Image key={u} source={{ uri: u }} style={styles.photo} />
              ))}
            </ScrollView>
          )}
        </Card>

        {r.requestType === 'GIFT' && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Gift</Text>
            {!!r.giftMessage && <Text style={styles.text}>“{r.giftMessage}”</Text>}
            <Row label="Gift wrap" value={r.giftWrap ? 'Yes' : 'No'} />
            <Row label="Sender name" value={r.hideSender ? 'Hidden' : 'Shown'} />
            {!!r.deliverOn && <Row label="Deliver on" value={formatDate(r.deliverOn)} />}
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Deliver to</Text>
          <Text style={styles.text}>{a.fullName}</Text>
          <Text style={styles.textMuted}>{[a.addressLine1, a.addressLine2, a.area, a.city].filter(Boolean).join(', ')}</Text>
          <Text style={styles.textMuted}>{formatPhone(a.phone)}</Text>
        </Card>

        {CANCELLABLE.includes(r.status) && <Button title="Cancel request" variant="outline" onPress={() => setShowCancel(true)} />}
      </ScrollView>

      <Sheet visible={showCancel} onClose={() => setShowCancel(false)} title="Cancel this request?">
        <Input label="Reason (optional)" value={reason} onChangeText={setReason} maxLength={300} />
        <Button title="Cancel request" variant="danger" size="lg" loading={cancel.isPending} onPress={onCancel} />
        <Button title="Keep it" variant="ghost" onPress={() => setShowCancel(false)} style={{ marginTop: 4 }} />
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
  head: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  type: { fontSize: 12.5, color: colors.neutral[500] },
  title: { fontSize: 19, fontWeight: typography.weight.bold, color: colors.neutral[900], marginTop: 2 },
  card: { marginBottom: 12, padding: 14 },
  waiting: { backgroundColor: colors.info.light, borderColor: 'transparent' },
  waitingText: { fontSize: 13.5, color: colors.info.dark, lineHeight: 19 },
  quote: { borderColor: colors.primary[200], borderWidth: 1.5 },
  cardTitle: { fontSize: 15, fontWeight: typography.weight.bold, color: colors.neutral[900], marginBottom: 8 },
  text: { fontSize: 14, color: colors.neutral[800], lineHeight: 20, marginBottom: 6 },
  textMuted: { fontSize: 13, color: colors.neutral[600], marginTop: 2 },
  notes: { fontSize: 13, color: colors.neutral[700], marginTop: 10, lineHeight: 19 },
  valid: { fontSize: 12, color: colors.neutral[500], marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: 14, color: colors.neutral[600] },
  rowValue: { fontSize: 14, color: colors.neutral[900], fontWeight: typography.weight.semibold },
  bold: { fontSize: 17, fontWeight: typography.weight.extrabold, color: colors.neutral[900] },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.surface.divider, marginVertical: 8 },
  photo: { width: 72, height: 72, borderRadius: radii.md, backgroundColor: colors.neutral[100] },
});
