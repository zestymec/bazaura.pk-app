import React from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../components/common/AppText';
import { EmptyState, Loading, OrderStatusPill, ScreenHeader } from '../../components/common/ui';
import { Package } from '../../components/icons';
import { useOrders } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import type { RootStackParamList } from '../../types/navigation';
import { formatDate, formatPKR } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const orders = useOrders();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My orders" />
      <FlatList
        data={orders.items}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        onEndReached={() => orders.hasNextPage && !orders.isFetchingNextPage && orders.fetchNextPage()}
        refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => orders.refetch()} tintColor={colors.primary[500]} />}
        ListEmptyComponent={
          orders.isLoading ? (
            <Loading />
          ) : orders.isError ? (
            <EmptyState title="Couldn't load orders" message={errorMessage(orders.error)} actionLabel="Try again" onAction={() => orders.refetch()} />
          ) : (
            <EmptyState
              icon={Package}
              title="No orders yet"
              message="When you place an order, you can track it here."
              actionLabel="Start shopping"
              onAction={() => navigation.navigate('MainTabs', { screen: 'ShopTab' })}
            />
          )
        }
        ListFooterComponent={orders.isFetchingNextPage ? <Loading /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} style={styles.row} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.number}>{item.orderNumber}</Text>
              <Text style={styles.meta}>
                {formatDate(item.createdAt)} · {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
                {item.source === 'CUSTOM_REQUEST' ? ' · Custom request' : ''}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <OrderStatusPill status={item.status} />
              <Text style={styles.total}>{formatPKR(item.total)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  list: { padding: 16, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 10,
  },
  number: { fontSize: 15, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  meta: { fontSize: 12.5, color: colors.neutral[500], marginTop: 3 },
  total: { fontSize: 14, fontWeight: typography.weight.extrabold, color: colors.neutral[900] },
});
