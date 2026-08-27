import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Zap,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Lock,
} from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useCartStore } from '../../store/useCartStore';
import { useUserStore } from '../../store/useUserStore';
import { PaymentMethod } from '../../types/order';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { formatPKR } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const { items, deliveryType, getSummary, clearCart, setDeliveryType } = useCartStore();
  const { user, selectedAddressId, setSelectedAddress, addAddress, addOrder } = useUserStore();

  const summary = getSummary();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [newFullName, setNewFullName] = useState(user.fullName);
  const [newPhone, setNewPhone] = useState(user.phone);
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newArea, setNewArea] = useState('Gulberg III');
  const [newCity, setNewCity] = useState('Lahore');

  const selectedAddress =
    user.addresses.find((a) => a.id === selectedAddressId) || user.addresses[0];

  const handleAddNewAddress = () => {
    if (!newAddressLine.trim() || !newPhone.trim()) {
      Alert.alert('Required Fields', 'Please fill in the address and phone number.');
      return;
    }

    const created = addAddress({
      fullName: newFullName.trim() || user.fullName,
      phone: newPhone.trim(),
      addressLine1: newAddressLine.trim(),
      area: newArea.trim(),
      city: newCity.trim(),
      isLahore: newCity.toLowerCase() === 'lahore',
    });

    setShowNewAddressForm(false);
    setSelectedAddress(created.id);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert('Missing Address', 'Please select or add a delivery address.');
      return;
    }

    setIsPlacingOrder(true);
    haptic.medium();

    setTimeout(() => {
      const isLahore = selectedAddress.isLahore && deliveryType === 'LAHORE_EXPRESS_2HR';
      const estimatedText = isLahore
        ? '⚡ Guaranteed within 120 minutes (Lahore Express)'
        : '📦 Estimated delivery in 2-3 business days';

      const placedOrder = addOrder({
        items,
        subtotal: summary.subtotal,
        discount: summary.discount,
        deliveryFee: summary.deliveryFee,
        total: summary.total,
        deliveryType,
        estimatedDeliveryText: estimatedText,
        shippingAddress: selectedAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : 'PAID',
        status: 'PLACED',
      });

      clearCart();
      setIsPlacingOrder(false);

      navigation.replace('OrderSuccess', { order: placedOrder });
    }, 1000);
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => {
            haptic.light();
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <ArrowLeft size={18} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.lockBadge}>
          <Lock size={11} color={colors.success.dark} />
          <Text style={styles.lockText}>Encrypted</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step 1: Address Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity
              onPress={() => {
                haptic.selection();
                setShowNewAddressForm(!showNewAddressForm);
              }}
            >
              <Text style={styles.actionText}>
                {showNewAddressForm ? 'Cancel' : '+ Add New'}
              </Text>
            </TouchableOpacity>
          </View>

          {showNewAddressForm && (
            <View style={styles.newAddressForm}>
              <Input label="Full Name" value={newFullName} onChangeText={setNewFullName} placeholder="Receiver name" />
              <Input label="Phone" value={newPhone} onChangeText={setNewPhone} placeholder="03001234567" keyboardType="phone-pad" />
              <Input label="Address" value={newAddressLine} onChangeText={setNewAddressLine} placeholder="House, Street" />
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={{ flex: 1 }}>
                  <Input label="Area" value={newArea} onChangeText={setNewArea} placeholder="Gulberg" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="City" value={newCity} onChangeText={setNewCity} placeholder="Lahore" />
                </View>
              </View>
              <Button title="Save Address" onPress={handleAddNewAddress} size="sm" variant="primary" />
            </View>
          )}

          <View style={styles.addressList}>
            {user.addresses.map((addr) => {
              const isSelected = selectedAddress?.id === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedAddress(addr.id)}
                  style={[
                    styles.addressItem,
                    isSelected && styles.addressItemActive,
                  ]}
                >
                  <View style={styles.radioDot}>
                    {isSelected && <View style={styles.radioDotInner} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.addressName}>{addr.fullName}</Text>
                    <Text style={styles.addressLine}>{addr.addressLine1}, {addr.area}, {addr.city}</Text>
                    <Text style={styles.addressPhone}>{addr.phone}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 2: Delivery Speed */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Speed</Text>
          <View style={styles.deliveryList}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDeliveryType('LAHORE_EXPRESS_2HR')}
              style={[
                styles.deliveryItem,
                deliveryType === 'LAHORE_EXPRESS_2HR' && styles.deliveryItemActive,
              ]}
            >
              <Zap size={15} color={colors.primary[500]} fill={colors.primary[500]} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.deliveryTitle}>2-Hour Lahore Express</Text>
                <Text style={styles.deliverySub}>Direct courier dispatch within 120 mins</Text>
              </View>
              <Text style={styles.deliveryFee}>
                {summary.subtotal >= 10000 ? 'FREE' : 'Rs. 299'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDeliveryType('NATIONWIDE_STANDARD')}
              style={[
                styles.deliveryItem,
                deliveryType === 'NATIONWIDE_STANDARD' && styles.deliveryItemActive,
              ]}
            >
              <Truck size={15} color={colors.neutral[700]} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.deliveryTitle}>Standard Nationwide</Text>
                <Text style={styles.deliverySub}>2-3 business days across Pakistan</Text>
              </View>
              <Text style={styles.deliveryFee}>
                {summary.subtotal >= 10000 ? 'FREE' : 'Rs. 199'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 3: Payment Method */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentList}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                haptic.selection();
                setPaymentMethod('CASH_ON_DELIVERY');
              }}
              style={[
                styles.paymentItem,
                paymentMethod === 'CASH_ON_DELIVERY' && styles.paymentItemActive,
              ]}
            >
              <Banknote size={16} color={colors.neutral[700]} />
              <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
              {paymentMethod === 'CASH_ON_DELIVERY' && <CheckCircle2 size={16} color={colors.primary[500]} />}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                haptic.selection();
                setPaymentMethod('JAZZCASH');
              }}
              style={[
                styles.paymentItem,
                paymentMethod === 'JAZZCASH' && styles.paymentItemActive,
              ]}
            >
              <Smartphone size={16} color="#DC2626" />
              <Text style={styles.paymentText}>JazzCash Mobile Wallet</Text>
              {paymentMethod === 'JAZZCASH' && <CheckCircle2 size={16} color={colors.primary[500]} />}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                haptic.selection();
                setPaymentMethod('EASYPAISA');
              }}
              style={[
                styles.paymentItem,
                paymentMethod === 'EASYPAISA' && styles.paymentItemActive,
              ]}
            >
              <Smartphone size={16} color="#059669" />
              <Text style={styles.paymentText}>EasyPaisa Wallet</Text>
              {paymentMethod === 'EASYPAISA' && <CheckCircle2 size={16} color={colors.primary[500]} />}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                haptic.selection();
                setPaymentMethod('DEBIT_CREDIT_CARD');
              }}
              style={[
                styles.paymentItem,
                paymentMethod === 'DEBIT_CREDIT_CARD' && styles.paymentItemActive,
              ]}
            >
              <CreditCard size={16} color={colors.neutral[700]} />
              <Text style={styles.paymentText}>Visa / Mastercard</Text>
              {paymentMethod === 'DEBIT_CREDIT_CARD' && <CheckCircle2 size={16} color={colors.primary[500]} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>{formatPKR(summary.subtotal)}</Text>
          </View>
          {summary.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success.dark }]}>Voucher Discount</Text>
              <Text style={[styles.summaryVal, { color: colors.success.dark }]}>-{formatPKR(summary.discount)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryVal}>{summary.deliveryFee === 0 ? 'FREE' : formatPKR(summary.deliveryFee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>{formatPKR(summary.total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Place Order Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomSub}>Total</Text>
          <Text style={styles.bottomTotal}>{formatPKR(summary.total)}</Text>
        </View>

        <Button
          title={isPlacingOrder ? 'Processing...' : 'Place Order'}
          onPress={handlePlaceOrder}
          loading={isPlacingOrder}
          size="lg"
          variant="primary"
          style={{ flex: 1, marginLeft: 16 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radii.xs,
    gap: 3,
  },
  lockText: {
    fontSize: 9,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[600],
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 10,
    ...shadows.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.primary[500],
  },
  newAddressForm: {
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    padding: 10,
    marginBottom: 10,
  },
  addressList: {
    gap: 6,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addressItemActive: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.primary[500],
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  addressName: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  addressLine: {
    fontSize: 11,
    color: colors.neutral[600],
    marginTop: 1,
  },
  addressPhone: {
    fontSize: 10,
    color: colors.neutral[400],
    marginTop: 1,
  },
  deliveryList: {
    gap: 6,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deliveryItemActive: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.primary[500],
  },
  deliveryTitle: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  deliverySub: {
    fontSize: 9,
    color: colors.neutral[400],
  },
  deliveryFee: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.primary[600],
  },
  paymentList: {
    gap: 6,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentItemActive: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.primary[500],
  },
  paymentText: {
    flex: 1,
    fontSize: 12,
    fontWeight: typography.weight.medium,
    color: colors.neutral[800],
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.neutral[600],
  },
  summaryVal: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  totalVal: {
    fontSize: 15,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSub: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  bottomTotal: {
    fontSize: 16,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
  },
});
