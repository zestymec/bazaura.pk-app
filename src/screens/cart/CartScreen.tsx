import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Trash2,
  Plus,
  Minus,
  Zap,
  Truck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useCartStore } from '../../store/useCartStore';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { formatPKR } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const {
    items,
    deliveryType,
    appliedVoucher,
    updateQuantity,
    removeItem,
    setDeliveryType,
    applyVoucher,
    removeVoucher,
    getSummary,
  } = useCartStore();

  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');

  const summary = getSummary();
  const freeShippingThreshold = 10000;
  const progressToFreeShipping = Math.min(1, summary.subtotal / freeShippingThreshold);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - summary.subtotal);

  const handleApplyVoucher = () => {
    if (!voucherInput.trim()) return;
    setVoucherError('');
    const res = applyVoucher(voucherInput.trim());
    if (res.success) {
      setVoucherInput('');
    } else {
      setVoucherError(res.message);
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Bag Empty', 'Please add items to your bag before proceeding.');
      return;
    }
    haptic.medium();
    navigation.navigate('Checkout');
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Shopping Bag</Text>
        <Text style={styles.headerSubtitle}>
          {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag size={48} color={colors.neutral[300]} />
          <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Items you add to your bag will appear here.
          </Text>
          <Button
            title="Explore Catalog"
            onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
            size="md"
            variant="primary"
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Free Shipping Progress */}
          <View style={styles.freeShippingCard}>
            <Text style={styles.freeShippingText}>
              {remainingForFreeShipping > 0
                ? `Add ${formatPKR(remainingForFreeShipping)} more for FREE Delivery`
                : '🎉 You have unlocked FREE Express Delivery!'}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressToFreeShipping * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Delivery Speed Segmented Selector */}
          <View style={styles.deliverySegmentBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDeliveryType('LAHORE_EXPRESS_2HR')}
              style={[
                styles.deliveryOption,
                deliveryType === 'LAHORE_EXPRESS_2HR' && styles.deliveryOptionActive,
              ]}
            >
              <Zap
                size={14}
                color={deliveryType === 'LAHORE_EXPRESS_2HR' ? colors.primary[500] : colors.neutral[500]}
                fill={deliveryType === 'LAHORE_EXPRESS_2HR' ? colors.primary[500] : 'transparent'}
              />
              <View style={{ marginLeft: 6 }}>
                <Text
                  style={[
                    styles.optionTitle,
                    deliveryType === 'LAHORE_EXPRESS_2HR' && styles.optionTitleActive,
                  ]}
                >
                  2-Hour Lahore
                </Text>
                <Text style={styles.optionSub}>Rs. 299 (Fast)</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDeliveryType('NATIONWIDE_STANDARD')}
              style={[
                styles.deliveryOption,
                deliveryType === 'NATIONWIDE_STANDARD' && styles.deliveryOptionActive,
              ]}
            >
              <Truck
                size={14}
                color={deliveryType === 'NATIONWIDE_STANDARD' ? colors.primary[500] : colors.neutral[500]}
              />
              <View style={{ marginLeft: 6 }}>
                <Text
                  style={[
                    styles.optionTitle,
                    deliveryType === 'NATIONWIDE_STANDARD' && styles.optionTitleActive,
                  ]}
                >
                  Nationwide
                </Text>
                <Text style={styles.optionSub}>Rs. 199 (2-3 Days)</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Items List */}
          <View style={styles.itemsCard}>
            {items.map((item, idx) => {
              const isLast = idx === items.length - 1;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    !isLast && styles.itemRowBorder,
                  ]}
                >
                  <Image source={{ uri: item.product.images[0] }} style={styles.itemImage} />

                  <View style={styles.itemDetails}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemBrand}>{item.product.brand}</Text>
                      <TouchableOpacity onPress={() => removeItem(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Trash2 size={15} color={colors.neutral[400]} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.product.title}
                    </Text>

                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <View style={styles.variantChips}>
                        {Object.entries(item.selectedVariants).map(([k, v]) => (
                          <Text key={k} style={styles.variantText}>
                            {k}: {v}
                          </Text>
                        ))}
                      </View>
                    )}

                    <View style={styles.priceQtyRow}>
                      <Text style={styles.itemPrice}>
                        {formatPKR(item.unitPrice * item.quantity)}
                      </Text>

                      <View style={styles.qtyControl}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                          style={styles.qtyBtn}
                        >
                          <Minus size={12} color={colors.neutral[700]} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                          style={styles.qtyBtn}
                        >
                          <Plus size={12} color={colors.neutral[700]} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Voucher Card */}
          <View style={styles.voucherCard}>
            {appliedVoucher ? (
              <View style={styles.appliedVoucherRow}>
                <View>
                  <Text style={styles.appliedCode}>{appliedVoucher.code}</Text>
                  <Text style={styles.appliedDesc}>{appliedVoucher.description}</Text>
                </View>
                <TouchableOpacity onPress={removeVoucher}>
                  <Text style={styles.removeVoucherText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.voucherInputRow}>
                <Input
                  value={voucherInput}
                  onChangeText={setVoucherInput}
                  placeholder="Promo code (e.g. BAZAURA10)"
                  error={voucherError}
                  containerStyle={{ flex: 1, marginBottom: 0, marginRight: 8 }}
                />
                <Button
                  title="Apply"
                  onPress={handleApplyVoucher}
                  size="md"
                  variant="secondary"
                />
              </View>
            )}
          </View>

          {/* Price Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryVal}>{formatPKR(summary.subtotal)}</Text>
            </View>

            {summary.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.success.dark }]}>
                  Voucher ({appliedVoucher?.code})
                </Text>
                <Text style={[styles.summaryVal, { color: colors.success.dark }]}>
                  -{formatPKR(summary.discount)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {deliveryType === 'LAHORE_EXPRESS_2HR' ? '2-Hour Lahore Delivery' : 'Standard Delivery'}
              </Text>
              <Text style={styles.summaryVal}>
                {summary.deliveryFee === 0 ? 'FREE' : formatPKR(summary.deliveryFee)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>{formatPKR(summary.total)}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Sticky Bottom Bar */}
      {items.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomSub}>Total</Text>
            <Text style={styles.bottomTotal}>{formatPKR(summary.total)}</Text>
          </View>

          <Button
            title="Checkout"
            onPress={handleProceedToCheckout}
            size="lg"
            variant="primary"
            icon={<ArrowRight size={16} color={colors.neutral.white} />}
            iconPosition="right"
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4,
  },
  freeShippingCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  freeShippingText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginBottom: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  deliverySegmentBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  deliveryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  deliveryOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.delivery.expressBg,
  },
  optionTitle: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  optionTitleActive: {
    color: colors.primary[600],
  },
  optionSub: {
    fontSize: 9,
    color: colors.neutral[400],
  },
  itemsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 10,
    ...shadows.subtle,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.neutral[100],
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemBrand: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    color: colors.neutral[400],
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[900],
    marginTop: 1,
  },
  variantChips: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  variantText: {
    fontSize: 9,
    color: colors.neutral[500],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  priceQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.sm,
    padding: 2,
    gap: 6,
  },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    minWidth: 14,
    textAlign: 'center',
  },
  voucherCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 10,
  },
  voucherInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedVoucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedCode: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.success.dark,
  },
  appliedDesc: {
    fontSize: 9,
    color: colors.success.dark,
  },
  removeVoucherText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.error.DEFAULT,
  },
  summaryCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 10,
    ...shadows.subtle,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
