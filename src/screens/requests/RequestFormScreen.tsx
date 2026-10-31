import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Chip, Pill, QuantityStepper, ScreenHeader } from '../../components/common/ui';
import { AddressDraft, AddressFields, EMPTY_ADDRESS, toAddressBody, validateAddress } from '../../components/common/AddressFields';
import { Gift, ImagePlus, MapPin, Sparkles, X } from '../../components/icons';
import { useAddresses, useConfig, useCreateCustomRequest } from '../../api/hooks';
import { ApiError, errorMessage, fieldErrors } from '../../api/client';
import type { CustomRequestType, DeliveryType } from '../../api/types';
import { useAuthStore } from '../../store/auth';
import type { RootStackParamList } from '../../types/navigation';
import { uploadImage } from '../../utils/uploadImage';
import { formatPKR } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

const MAX_PHOTOS = 5;

/** Next 7 days as quick picks for a gift delivery date. */
function nextDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    d.setHours(12, 0, 0, 0);
    return { iso: d.toISOString(), label: i === 0 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }) };
  });
}

export const RequestFormScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'RequestForm'>>();
  const insets = useSafeAreaInsets();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { data: config } = useConfig();
  const addresses = useAddresses();
  const create = useCreateCustomRequest();

  const [type, setType] = useState<CustomRequestType>(params?.type ?? 'CUSTOM_ITEM');
  const [itemName, setItemName] = useState(params?.itemName ?? '');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [budget, setBudget] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [photos, setPhotos] = useState<{ uri: string; type?: string }[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('STANDARD');
  const [addressId, setAddressId] = useState<string | null>(null);
  const [useRecipient, setUseRecipient] = useState(type === 'GIFT');
  const [recipient, setRecipient] = useState<AddressDraft>(EMPTY_ADDRESS);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [hideSender, setHideSender] = useState(false);
  const [deliverOn, setDeliverOn] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const days = useMemo(nextDays, []);

  // Login gate on entry — come back here afterwards (§7.2).
  useEffect(() => {
    if (!isLoggedIn) navigation.replace('Login', { reason: 'Log in to send a request.', then: { name: 'RequestForm', params } });
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const list = addresses.data;
    if (list?.length && !addressId) setAddressId((list.find((a) => a.isDefault) ?? list[0]).id);
    if (list && !list.length && type === 'CUSTOM_ITEM') setUseRecipient(true);
  }, [addresses.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const isGift = type === 'GIFT';
  const deliveryCity = useRecipient ? recipient.city : addresses.data?.find((a) => a.id === addressId)?.city;
  const expressOk = !!deliveryCity && !!config?.expressDeliveryCities.some((c) => c.toLowerCase() === deliveryCity.trim().toLowerCase());
  useEffect(() => {
    if (!expressOk && deliveryType === 'EXPRESS') setDeliveryType('STANDARD');
  }, [expressOk, deliveryType]);

  const pickPhotos = async () => {
    haptic.selection();
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: MAX_PHOTOS - photos.length,
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.8,
    });
    if (res.errorMessage) Alert.alert('Photos', res.errorMessage);
    const picked = (res.assets ?? []).filter((a) => a.uri).map((a) => ({ uri: a.uri!, type: a.type }));
    setPhotos((p) => [...p, ...picked].slice(0, MAX_PHOTOS));
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (itemName.trim().length < 2) e.itemName = isGift ? 'What would you like to send?' : 'What are you looking for?';
    if (description.trim().length < 5) e.description = 'Add a few details (at least 5 characters)';
    if (useRecipient) Object.assign(e, validateAddress(recipient));
    else if (!addressId) e.addressId = 'Choose a delivery address';
    setErrors(e);
    if (Object.keys(e).length) {
      haptic.error();
      return;
    }

    setSubmitting(true);
    // Upload photos first; if storage isn't configured, submit without them (§7.14).
    let imageUrls: string[] = [];
    let skippedPhotos = false;
    for (const p of photos) {
      try {
        imageUrls.push(await uploadImage(p.uri, 'custom-requests', p.type));
      } catch (err) {
        skippedPhotos = true;
        if (err instanceof ApiError && err.code === 'STORAGE_UNAVAILABLE') break;
      }
    }

    create.mutate(
      {
        requestType: type,
        itemName: itemName.trim(),
        description: description.trim(),
        quantity,
        budget: budget ? Number(budget.replace(/\D/g, '')) || null : null,
        referenceUrl: referenceUrl.trim() || null,
        imageUrls,
        deliveryType,
        ...(useRecipient ? { deliveryAddress: toAddressBody(recipient) } : { addressId }),
        ...(isGift ? { giftMessage: giftMessage.trim() || null, giftWrap, hideSender, deliverOn } : {}),
      },
      {
        onSuccess: (r) => {
          haptic.success();
          if (skippedPhotos) Alert.alert('Request sent', "Photo uploads aren't available right now, so we sent your request without photos.");
          navigation.replace('RequestDetail', { requestId: r.id });
        },
        onError: (err) => {
          haptic.error();
          setErrors(fieldErrors(err));
          Alert.alert('Request not sent', errorMessage(err));
        },
        onSettled: () => setSubmitting(false),
      },
    );
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={isGift ? 'Send a gift' : 'Request an item'} />
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        {/* Type toggle */}
        <View style={styles.segment}>
          {(
            [
              ['CUSTOM_ITEM', 'Arrange for me', Sparkles],
              ['GIFT', 'Send a gift', Gift],
            ] as const
          ).map(([t, label, Icon]) => (
            <TouchableOpacity
              key={t}
              style={[styles.segBtn, type === t && styles.segOn]}
              onPress={() => {
                setType(t);
                setUseRecipient(t === 'GIFT' || !addresses.data?.length);
              }}
            >
              <Icon size={15} color={type === t ? colors.neutral.white : colors.neutral[700]} />
              <Text style={[styles.segText, type === t && styles.segTextOn]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.intro}>
          {isGift
            ? 'Tell us what to send and who to send it to. We’ll quote you a price, and deliver once you accept.'
            : 'Can’t find something in our catalog? Describe it and our team will quote you a price.'}
        </Text>

        <Input label={isGift ? 'Gift' : 'Item'} required value={itemName} onChangeText={setItemName} maxLength={200} placeholder="e.g. Black oversized hoodie, size XL" error={errors.itemName} />
        <Input
          label="Details"
          required
          value={description}
          onChangeText={setDescription}
          maxLength={2000}
          multiline
          placeholder="Colour, size, fabric, brand — anything that helps"
          inputStyle={{ minHeight: 90, textAlignVertical: 'top' }}
          error={errors.description}
        />
        <View style={styles.inline}>
          <Text style={styles.label}>Quantity</Text>
          <QuantityStepper value={quantity} max={50} onChange={setQuantity} />
        </View>
        <Input label="Budget (optional)" value={budget} onChangeText={setBudget} keyboardType="number-pad" placeholder="Rs." error={errors.budget} />
        <Input label="Reference link (optional)" value={referenceUrl} onChangeText={setReferenceUrl} autoCapitalize="none" keyboardType="url" placeholder="https://" error={errors.referenceUrl} />

        <Text style={styles.label}>Photos (optional, up to {MAX_PHOTOS})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
          {photos.map((p, i) => (
            <View key={p.uri}>
              <Image source={{ uri: p.uri }} style={styles.photo} />
              <TouchableOpacity style={styles.photoX} onPress={() => setPhotos((list) => list.filter((_, j) => j !== i))} hitSlop={6}>
                <X size={12} color={colors.neutral.white} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < MAX_PHOTOS && (
            <TouchableOpacity style={[styles.photo, styles.addPhoto]} onPress={pickPhotos}>
              <ImagePlus size={22} color={colors.neutral[500]} />
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Address */}
        <Text style={styles.section}>{isGift ? 'Recipient' : 'Deliver to'}</Text>
        {!!addresses.data?.length && (
          <View style={styles.chips}>
            <Chip label={isGift ? 'Someone else' : 'New address'} selected={useRecipient} onPress={() => setUseRecipient(true)} />
            <Chip label="My saved address" selected={!useRecipient} onPress={() => setUseRecipient(false)} />
          </View>
        )}
        {useRecipient ? (
          <AddressFields value={recipient} onChange={(p) => setRecipient((r) => ({ ...r, ...p }))} errors={errors} showLabel={false} expressCities={config?.expressDeliveryCities} />
        ) : (
          <>
            {addresses.data?.map((a) => (
              <TouchableOpacity key={a.id} onPress={() => setAddressId(a.id)} style={[styles.address, addressId === a.id && styles.addressOn]}>
                <MapPin size={16} color={addressId === a.id ? colors.primary[500] : colors.neutral[400]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressName}>{a.label ? `${a.label} · ` : ''}{a.fullName}</Text>
                  <Text style={styles.addressLine}>{[a.addressLine1, a.area, a.city].join(', ')}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {!!errors.addressId && <Text style={styles.error}>{errors.addressId}</Text>}
          </>
        )}

        {/* Delivery speed — express only in express cities (from config) */}
        <Text style={styles.section}>Delivery</Text>
        <View style={styles.chips}>
          <Chip label="Standard" selected={deliveryType === 'STANDARD'} onPress={() => setDeliveryType('STANDARD')} />
          <Chip
            label={config ? `Express (${config.expressDeliveryHours} hours)` : 'Express'}
            selected={deliveryType === 'EXPRESS'}
            disabled={!expressOk}
            onPress={() => setDeliveryType('EXPRESS')}
          />
        </View>
        {!expressOk && !!config && (
          <Text style={styles.hint}>Express is available in {config.expressDeliveryCities.join(', ')}.</Text>
        )}

        {isGift && (
          <>
            <Text style={styles.section}>Gift options</Text>
            <Input label="Gift message (optional)" value={giftMessage} onChangeText={setGiftMessage} maxLength={500} multiline placeholder="Happy birthday! 🎉" />
            <ToggleRow
              label="Gift wrap"
              right={config && config.giftWrapFee > 0 ? <Pill label={`+${formatPKR(config.giftWrapFee)}`} tone="brand" /> : null}
              value={giftWrap}
              onChange={setGiftWrap}
            />
            <ToggleRow label="Don't show my name" value={hideSender} onChange={setHideSender} />
            <Text style={[styles.label, { marginTop: 8 }]}>Deliver on (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <Chip label="Any day" selected={!deliverOn} onPress={() => setDeliverOn(null)} />
              {days.map((d) => (
                <Chip key={d.iso} label={d.label} selected={deliverOn === d.iso} onPress={() => setDeliverOn(d.iso)} />
              ))}
            </ScrollView>
          </>
        )}

        <Button title="Send request" size="lg" loading={submitting || create.isPending} onPress={submit} style={{ marginTop: 16 }} />
        <Text style={styles.footnote}>No payment now. You'll get a quote to accept; pay cash on delivery.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ToggleRow: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void; right?: React.ReactNode }> = ({ label, value, onChange, right }) => (
  <View style={styles.toggle}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={styles.toggleLabel}>{label}</Text>
      {right}
    </View>
    <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary[500], false: colors.neutral[200] }} thumbColor={colors.neutral.white} />
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral.white },
  body: { padding: 16 },
  segment: { flexDirection: 'row', backgroundColor: colors.neutral[100], borderRadius: radii.full, padding: 4, marginBottom: 12 },
  segBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: radii.full },
  segOn: { backgroundColor: colors.neutral[900] },
  segText: { fontSize: 13.5, fontWeight: typography.weight.bold, color: colors.neutral[700] },
  segTextOn: { color: colors.neutral.white },
  intro: { fontSize: 13.5, color: colors.neutral[600], lineHeight: 19, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: typography.weight.semibold, color: colors.neutral[700], marginBottom: 8 },
  inline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  photos: { gap: 10, paddingBottom: 6 },
  photo: { width: 76, height: 76, borderRadius: radii.md, backgroundColor: colors.neutral[100] },
  addPhoto: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.neutral[300] },
  photoX: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  section: { fontSize: 16, fontWeight: typography.weight.bold, color: colors.neutral[900], marginTop: 20, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  address: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.neutral[100], marginBottom: 8 },
  addressOn: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  addressName: { fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  addressLine: { fontSize: 12.5, color: colors.neutral[600], marginTop: 2 },
  hint: { fontSize: 12, color: colors.neutral[500], marginTop: -4 },
  error: { fontSize: 12, color: colors.error.DEFAULT },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  toggleLabel: { fontSize: 14, fontWeight: typography.weight.semibold, color: colors.neutral[800] },
  footnote: { fontSize: 12, color: colors.neutral[500], textAlign: 'center', marginTop: 12 },
});
