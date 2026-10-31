import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { Input } from './Input';
import { Chip } from './ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface AddressDraft {
  label: string;
  fullName: string;
  phone: string;
  alternatePhone: string;
  addressLine1: string;
  addressLine2: string;
  area: string;
  city: string;
  postalCode: string;
}

export const EMPTY_ADDRESS: AddressDraft = {
  label: '',
  fullName: '',
  phone: '',
  alternatePhone: '',
  addressLine1: '',
  addressLine2: '',
  area: '',
  city: '',
  postalCode: '',
};

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'];

/** Address inputs shared by the address form and the gift recipient form. */
export const AddressFields: React.FC<{
  value: AddressDraft;
  onChange: (patch: Partial<AddressDraft>) => void;
  errors: Record<string, string>;
  showLabel?: boolean;
  expressCities?: string[];
}> = ({ value: v, onChange, errors, showLabel = true, expressCities = [] }) => (
  <View>
    {showLabel && (
      <>
        <Text style={styles.label}>Save as</Text>
        <View style={styles.chips}>
          {['Home', 'Office', 'Other'].map((l) => (
            <Chip key={l} label={l} selected={v.label === l} onPress={() => onChange({ label: v.label === l ? '' : l })} />
          ))}
        </View>
      </>
    )}
    <Input label="Full name" required value={v.fullName} onChangeText={(t) => onChange({ fullName: t })} autoCapitalize="words" error={errors.fullName} />
    <Input label="Mobile number" required value={v.phone} onChangeText={(t) => onChange({ phone: t })} keyboardType="phone-pad" placeholder="03XX XXXXXXX" error={errors.phone} />
    <Input label="Alternate number (optional)" value={v.alternatePhone} onChangeText={(t) => onChange({ alternatePhone: t })} keyboardType="phone-pad" error={errors.alternatePhone} />
    <Input label="House / street" required value={v.addressLine1} onChangeText={(t) => onChange({ addressLine1: t })} placeholder="House 12, Street 4" error={errors.addressLine1} />
    <Input label="Landmark (optional)" value={v.addressLine2} onChangeText={(t) => onChange({ addressLine2: t })} placeholder="Near Main Market" error={errors.addressLine2} />
    <Input label="Area" required value={v.area} onChangeText={(t) => onChange({ area: t })} placeholder="e.g. Gulberg III" error={errors.area} />
    <Text style={styles.label}>City *</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
      {CITIES.map((c) => (
        <Chip key={c} label={c} selected={v.city.toLowerCase() === c.toLowerCase()} onPress={() => onChange({ city: c })} />
      ))}
    </ScrollView>
    <Input
      value={v.city}
      onChangeText={(t) => onChange({ city: t })}
      placeholder="Or type your city"
      error={errors.city}
      helperText={
        v.city && expressCities.some((c) => c.toLowerCase() === v.city.trim().toLowerCase()) ? 'Express delivery available here' : undefined
      }
    />
    <Input label="Postal code (optional)" value={v.postalCode} onChangeText={(t) => onChange({ postalCode: t })} keyboardType="number-pad" error={errors.postalCode} />
  </View>
);

/** Client-side required-field check; the server re-validates (VALIDATION_ERROR). */
export function validateAddress(v: AddressDraft): Record<string, string> {
  const e: Record<string, string> = {};
  if (!v.fullName.trim()) e.fullName = 'Enter the receiver’s name';
  if (!/^(\+?92|0)?3\d{9}$/.test(v.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid mobile number, e.g. 03001234567';
  if (!v.addressLine1.trim()) e.addressLine1 = 'Enter house and street';
  if (!v.area.trim()) e.area = 'Enter the area';
  if (!v.city.trim()) e.city = 'Choose or type a city';
  return e;
}

export const toAddressBody = (v: AddressDraft) => ({
  label: v.label || null,
  fullName: v.fullName.trim(),
  phone: v.phone.trim(),
  alternatePhone: v.alternatePhone.trim() || null,
  addressLine1: v.addressLine1.trim(),
  addressLine2: v.addressLine2.trim() || null,
  area: v.area.trim(),
  city: v.city.trim(),
  postalCode: v.postalCode.trim() || null,
});

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: typography.weight.semibold, color: colors.neutral[700], marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
});
