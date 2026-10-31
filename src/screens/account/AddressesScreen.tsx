import React from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { EmptyState, Loading, Pill, ScreenHeader } from '../../components/common/ui';
import { MapPin, Pencil, Trash2 } from '../../components/icons';
import { useAddresses, useDeleteAddress, useUpdateAddress } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import type { RootStackParamList } from '../../types/navigation';
import { formatPhone } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

export const AddressesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const addresses = useAddresses();
  const del = useDeleteAddress();
  const update = useUpdateAddress();

  const confirmDelete = (id: string) =>
    Alert.alert('Delete address?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(id, { onError: (e) => Alert.alert('Error', errorMessage(e)) }) },
    ]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Addresses" />
      <FlatList
        data={addresses.data ?? []}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          addresses.isLoading ? (
            <Loading />
          ) : (
            <EmptyState icon={MapPin} title="No saved addresses" message="Add one to check out faster." />
          )
        }
        renderItem={({ item: a }) => (
          <View style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.name}>{a.label ? `${a.label} · ` : ''}{a.fullName}</Text>
              <View style={styles.pills}>
                {a.isDefault && <Pill label="Default" />}
                {a.isExpressEligible && <Pill label="Express available" tone="brand" />}
              </View>
            </View>
            <Text style={styles.line}>{[a.addressLine1, a.addressLine2, a.area, a.city, a.postalCode].filter(Boolean).join(', ')}</Text>
            <Text style={styles.line}>{formatPhone(a.phone)}</Text>
            <View style={styles.actions}>
              {!a.isDefault && (
                <TouchableOpacity onPress={() => update.mutate({ id: a.id, body: { isDefault: true } })}>
                  <Text style={styles.link}>Set as default</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => navigation.navigate('AddressForm', { addressId: a.id })} hitSlop={8} style={styles.icon}>
                <Pencil size={16} color={colors.neutral[600]} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(a.id)} hitSlop={8} style={styles.icon}>
                <Trash2 size={16} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button title="Add new address" size="lg" onPress={() => navigation.navigate('AddressForm')} disabled={(addresses.data?.length ?? 0) >= 10} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  list: { padding: 16, flexGrow: 1 },
  card: { backgroundColor: colors.neutral.white, borderRadius: radii.lg, padding: 14, marginBottom: 10 },
  top: { gap: 6 },
  pills: { flexDirection: 'row', gap: 6 },
  name: { fontSize: 15, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  line: { fontSize: 13, color: colors.neutral[600], marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 14 },
  link: { fontSize: 13, fontWeight: typography.weight.bold, color: colors.primary[500] },
  icon: { padding: 2 },
  footer: { padding: 16, backgroundColor: colors.neutral.white, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.divider },
});
