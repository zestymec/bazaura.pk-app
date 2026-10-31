import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Card, Loading } from '../../components/common/ui';
import { CircleCheck } from '../../components/icons';
import { useOrder } from '../../api/hooks';
import type { RootStackParamList } from '../../types/navigation';
import { formatPKR } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const OrderSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'OrderSuccess'>>();
  const insets = useSafeAreaInsets();
  const { data: order } = useOrder(params.orderId);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.center}>
        <View style={styles.icon}>
          <CircleCheck size={44} color={colors.success.DEFAULT} />
        </View>
        <Text style={styles.title}>Order placed!</Text>
        <Text style={styles.sub}>Thank you for shopping with Bazaura.</Text>

        {!order ? (
          <Loading />
        ) : (
          <Card style={styles.card}>
            <Row label="Order number" value={order.orderNumber} />
            <Row label="Total (cash on delivery)" value={formatPKR(order.total)} />
            <Row label="Estimated delivery" value={order.deliveryEstimate} />
          </Card>
        )}
      </View>

      <View style={styles.actions}>
        <Button title="Track order" size="lg" onPress={() => navigation.replace('OrderDetail', { orderId: params.orderId })} />
        <Button title="Continue shopping" variant="ghost" size="lg" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background, paddingHorizontal: 20, justifyContent: 'space-between' },
  center: { alignItems: 'center' },
  icon: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.success.light, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: typography.weight.bold, color: colors.neutral[900], marginTop: 18 },
  sub: { fontSize: 15, color: colors.neutral[500], marginTop: 6 },
  card: { alignSelf: 'stretch', marginTop: 28 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  label: { fontSize: 14, color: colors.neutral[500] },
  value: { fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900], flexShrink: 1, textAlign: 'right' },
  actions: { gap: 8 },
});
