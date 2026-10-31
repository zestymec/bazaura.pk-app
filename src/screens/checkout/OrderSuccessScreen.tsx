import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Text } from '../../components/common/AppText';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Zap,
  Truck,
  MapPin,
  Package,
  Home,
} from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { formatPKR } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';
import { optimizeImageUrl } from '../../utils/images';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OrderSuccessRouteProp = RouteProp<RootStackParamList, 'OrderSuccess'>;

export const OrderSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderSuccessRouteProp>();
  const insets = useSafeAreaInsets();
  const order = route.params.order;

  const isLahoreExpress = order.deliveryType === 'LAHORE_EXPRESS_2HR';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Celebration Header */}
        <View style={styles.celebrationCard}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={36} color={colors.neutral.white} />
          </View>

          <Text style={styles.title}>Order Confirmed</Text>
          <Text style={styles.orderId}>Order #{order.orderNumber}</Text>

          <View style={styles.deliveryBadge}>
            {isLahoreExpress ? (
              <Zap size={13} color={colors.primary[500]} fill={colors.primary[500]} />
            ) : (
              <Truck size={13} color={colors.neutral[700]} />
            )}
            <Text style={styles.deliveryText}>
              {order.estimatedDeliveryText}
            </Text>
          </View>
        </View>

        {/* Live Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tracking Status</Text>

          <View style={styles.timelineList}>
            {order.timeline.map((step, idx) => {
              const isLast = idx === order.timeline.length - 1;
              return (
                <View key={idx} style={styles.timelineItem}>
                  <View style={styles.timelineIconCol}>
                    <View
                      style={[
                        styles.timelineDot,
                        step.isCompleted && styles.timelineDotCompleted,
                      ]}
                    />
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          step.isCompleted && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <View style={styles.timelineTitleRow}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepTime}>{step.timestamp}</Text>
                    </View>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Shipping & Payment */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>

          <View style={styles.detailRow}>
            <MapPin size={14} color={colors.neutral[400]} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.detailTitle}>{order.shippingAddress.fullName}</Text>
              <Text style={styles.detailSub}>
                {order.shippingAddress.addressLine1}, {order.shippingAddress.area}, {order.shippingAddress.city}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Package size={14} color={colors.neutral[400]} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.detailTitle}>
                Payment: {order.paymentMethod.replace(/_/g, ' ')}
              </Text>
              <Text style={styles.detailSub}>
                Amount: <Text style={{ fontWeight: typography.weight.bold, color: colors.neutral[900] }}>{formatPKR(order.total)}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Items Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>

          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: optimizeImageUrl(item.product.images[0], 56) }} style={styles.itemThumb} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.product.title}
                </Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatPKR(item.unitPrice * item.quantity)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Continue Shopping */}
      <View style={styles.bottomBar}>
        <Button
          title="Continue Shopping"
          onPress={() => {
            haptic.light();
            navigation.navigate('MainTabs', { screen: 'HomeTab' });
          }}
          size="lg"
          variant="primary"
          icon={<Home size={16} color={colors.neutral.white} />}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  celebrationCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 12,
    ...shadows.subtle,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
  },
  orderId: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.primary[600],
    marginTop: 2,
    marginBottom: 8,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 4,
  },
  deliveryText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 10,
  },
  timelineList: {},
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 18,
    marginRight: 8,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neutral[300],
    marginTop: 3,
  },
  timelineDotCompleted: {
    backgroundColor: colors.primary[500],
  },
  timelineLine: {
    width: 2,
    height: 28,
    backgroundColor: colors.neutral[200],
    marginVertical: 2,
  },
  timelineLineCompleted: {
    backgroundColor: colors.primary[500],
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 10,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  stepTime: {
    fontSize: 9,
    color: colors.neutral[400],
  },
  stepDesc: {
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  detailSub: {
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemThumb: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.neutral[100],
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: typography.weight.medium,
    color: colors.neutral[800],
  },
  itemQty: {
    fontSize: 9,
    color: colors.neutral[400],
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
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
  },
});
