import React from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { EmptyState, Loading, RequestStatusPill, ScreenHeader } from '../../components/common/ui';
import { Gift, Sparkles } from '../../components/icons';
import { useCustomRequests } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import type { RootStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

export const RequestsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const requests = useCustomRequests();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My requests" />
      <FlatList
        data={requests.data ?? []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={requests.isRefetching} onRefresh={() => requests.refetch()} tintColor={colors.primary[500]} />}
        ListEmptyComponent={
          requests.isLoading ? (
            <Loading />
          ) : requests.isError ? (
            <EmptyState title="Couldn't load requests" message={errorMessage(requests.error)} actionLabel="Try again" onAction={() => requests.refetch()} />
          ) : (
            <EmptyState icon={Sparkles} title="No requests yet" message="Ask us to arrange an item or send a gift — we'll send you a quote." />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} style={styles.row} onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}>
            <View style={styles.icon}>{item.requestType === 'GIFT' ? <Gift size={18} color={colors.primary[600]} /> : <Sparkles size={18} color={colors.primary[600]} />}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {item.itemName}
              </Text>
              <Text style={styles.meta}>
                {item.requestNumber} · {formatDate(item.createdAt)}
              </Text>
            </View>
            <RequestStatusPill status={item.status} />
          </TouchableOpacity>
        )}
      />
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button title="New request" size="lg" onPress={() => navigation.navigate('RequestForm')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  list: { padding: 16, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.neutral.white, borderRadius: radii.lg, padding: 14, marginBottom: 10 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14.5, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  meta: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },
  footer: { padding: 16, backgroundColor: colors.neutral.white, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.divider },
});
