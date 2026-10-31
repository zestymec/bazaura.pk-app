import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { ScreenHeader } from '../../components/common/ui';
import { AddressDraft, AddressFields, EMPTY_ADDRESS, toAddressBody, validateAddress } from '../../components/common/AddressFields';
import { useAddresses, useConfig, useCreateAddress, useUpdateAddress } from '../../api/hooks';
import { errorMessage, fieldErrors } from '../../api/client';
import { useAuthStore } from '../../store/auth';
import type { RootStackParamList } from '../../types/navigation';
import { formatPhone } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const AddressFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'AddressForm'>>();
  const insets = useSafeAreaInsets();
  const { data: list } = useAddresses();
  const { data: config } = useConfig();
  const user = useAuthStore((s) => s.user);
  const existing = list?.find((a) => a.id === params?.addressId);
  const create = useCreateAddress();
  const update = useUpdateAddress();

  const [draft, setDraft] = useState<AddressDraft>(() =>
    existing
      ? {
          label: existing.label ?? '',
          fullName: existing.fullName,
          phone: formatPhone(existing.phone),
          alternatePhone: existing.alternatePhone ?? '',
          addressLine1: existing.addressLine1,
          addressLine2: existing.addressLine2 ?? '',
          area: existing.area,
          city: existing.city,
          postalCode: existing.postalCode ?? '',
        }
      : { ...EMPTY_ADDRESS, label: 'Home', fullName: user?.fullName ?? '', phone: formatPhone(user?.phone), city: user?.city ?? '' },
  );
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? !list?.length);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const save = () => {
    const e = validateAddress(draft);
    setErrors(e);
    setFormError(null);
    if (Object.keys(e).length) return;
    const onError = (err: unknown) => {
      const fe = fieldErrors(err);
      setErrors(fe);
      setFormError(Object.keys(fe).length ? 'Please fix the highlighted fields.' : errorMessage(err));
    };
    const body = { ...toAddressBody(draft), isDefault };
    if (existing) update.mutate({ id: existing.id, body }, { onSuccess: () => navigation.goBack(), onError });
    else create.mutate(body, { onSuccess: () => navigation.goBack(), onError });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={existing ? 'Edit address' : 'New address'} />
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <AddressFields
          value={draft}
          onChange={(p) => setDraft((d) => ({ ...d, ...p }))}
          errors={errors}
          expressCities={config?.expressDeliveryCities}
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Make this my default address</Text>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ true: colors.primary[500], false: colors.neutral[200] }}
            thumbColor={colors.neutral.white}
          />
        </View>
        {!!formError && <Text style={styles.error}>{formError}</Text>}
        <Button title="Save address" size="lg" loading={create.isPending || update.isPending} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral.white },
  body: { padding: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 12 },
  switchLabel: { fontSize: 14, fontWeight: typography.weight.semibold, color: colors.neutral[800] },
  error: { color: colors.error.DEFAULT, textAlign: 'center', marginBottom: 12, fontWeight: typography.weight.semibold },
});
