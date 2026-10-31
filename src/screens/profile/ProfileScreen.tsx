import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { Text } from '../../components/common/AppText';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Heart,
  Sparkles,
  Zap,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Package,
  LogOut,
} from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { logout } from '../../store/session';
import { env } from '../../config/env';
import { OrderStatus } from '../../types/order';
import { Badge } from '../../components/common/Badge';
import { useUserStore } from '../../store/useUserStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useRequestStore } from '../../store/useRequestStore';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { formatPKR, formatDateTime } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BRAND_MARK = require('../../../assets/brand/mark.png');

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Packing',
  OUT_FOR_DELIVERY_2HR: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const user = useUserStore((s) => s.user);
  const orders = useUserStore((s) => s.orders);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const setSelectedCity = useUserStore((s) => s.setSelectedCity);
  const wishlistCount = useWishlistStore((s) => s.wishlistIds.length);
  const requestCount = useRequestStore((s) => s.requests.length);

  const [isChangingCity, setIsChangingCity] = useState(false);

  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'];

  const handleWhatsAppSupport = async () => {
    haptic.selection();
    const text = encodeURIComponent('Hi Bazaura, I need help with');
    const app = `whatsapp://send?phone=${env.SUPPORT_WHATSAPP}&text=${text}`;
    const web = `https://wa.me/${env.SUPPORT_WHATSAPP}?text=${text}`;
    try {
      await Linking.openURL((await Linking.canOpenURL(app)) ? app : web);
    } catch {
      Alert.alert('WhatsApp', `Message us on ${env.SUPPORT_PHONE}`);
    }
  };

  const handleCallSupport = () => {
    haptic.selection();
    Linking.openURL(`tel:${env.SUPPORT_PHONE.replace(/\s/g, '')}`).catch(() => {
      Alert.alert('Helpline', `Call us on ${env.SUPPORT_PHONE}`);
    });
  };

  const handleLogout = () => {
    Alert.alert('Log out?', 'Your bag will stay saved on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const initials =
    user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'B';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Apple ID Style Profile Header */}
        {!isAuthenticated && (
          <View style={styles.guestCard}>
            <Image source={BRAND_MARK} style={styles.guestMark} resizeMode="contain" />
            <Text style={styles.guestTitle}>Log in to Bazaura</Text>
            <Text style={styles.guestSub}>
              Track orders, save addresses and get quotes from our sourcing concierge.
            </Text>
            <Button
              title="Log in / Sign up"
              size="lg"
              onPress={() => navigation.navigate('Login')}
              style={styles.guestBtn}
            />
          </View>
        )}

        <View style={styles.profileCard}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{isAuthenticated ? user.fullName || 'Bazaura customer' : 'Guest'}</Text>
              {isAuthenticated && <ShieldCheck size={14} color={colors.primary[500]} />}
            </View>
            {!!user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
            {!!user.email && <Text style={styles.userEmail}>{user.email}</Text>}

            {/* City Selector Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                haptic.selection();
                setIsChangingCity(!isChangingCity);
              }}
              style={styles.cityPill}
            >
              <Zap size={11} color={colors.primary[500]} fill={colors.primary[500]} />
              <Text style={styles.cityPillText}>
                {user.selectedCity} ({user.isLahoreExpressEligible ? '2-Hr Active' : 'Standard'})
              </Text>
              <ChevronRight size={11} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* City Selector Box */}
        {isChangingCity && (
          <View style={styles.cityPickerCard}>
            <Text style={styles.cityPickerTitle}>Choose City:</Text>
            <View style={styles.citiesGrid}>
              {cities.map((cityName) => {
                const isSelected = user.selectedCity.toLowerCase() === cityName.toLowerCase();
                return (
                  <TouchableOpacity
                    key={cityName}
                    activeOpacity={0.78}
                    onPress={() => {
                      setSelectedCity(cityName);
                      setIsChangingCity(false);
                    }}
                    style={[
                      styles.cityOption,
                      isSelected && styles.cityOptionActive,
                    ]}
                  >
                    <Text style={[styles.cityText, isSelected && styles.cityTextActive]}>
                      {cityName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick Counters */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Wishlist')}
            style={styles.quickBox}
          >
            <Heart size={16} color={colors.primary[500]} />
            <Text style={styles.quickCount}>{wishlistCount}</Text>
            <Text style={styles.quickLabel}>Wishlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: 'RequestItemTab' })}
            style={styles.quickBox}
          >
            <Sparkles size={16} color={colors.primary[600]} />
            <Text style={styles.quickCount}>{requestCount}</Text>
            <Text style={styles.quickLabel}>Requests</Text>
          </TouchableOpacity>

          <View style={styles.quickBox}>
            <Package size={16} color={colors.neutral[700]} />
            <Text style={styles.quickCount}>{orders.length}</Text>
            <Text style={styles.quickLabel}>Orders</Text>
          </View>
        </View>

        {/* Order History */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>

          {orders.length === 0 && (
            <View style={styles.orderCard}>
              <Text style={styles.orderItems}>
                {isAuthenticated ? 'No orders yet — your first one is a tap away.' : 'Log in to see your orders.'}
              </Text>
            </View>
          )}

          {orders.map((ord) => (
            <View key={ord.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNum}>Order #{ord.orderNumber}</Text>
                  <Text style={styles.orderDate}>{formatDateTime(ord.createdAt)}</Text>
                </View>
                <Badge
                  label={ORDER_STATUS_LABEL[ord.status] ?? ord.status}
                  variant={ord.status === 'DELIVERED' ? 'success' : 'express'}
                  size="sm"
                />
              </View>

              <View style={styles.orderSummaryRow}>
                <Text style={styles.orderItems}>
                  {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'} • {formatPKR(ord.total)}
                </Text>
                <Text style={styles.orderSpeed}>
                  {ord.deliveryType === 'LAHORE_EXPRESS_2HR' ? '2-Hr Express' : 'Standard'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Support & Care */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support & Concierge</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleWhatsAppSupport}
            style={styles.menuRow}
          >
            <MessageCircle size={18} color="#25D366" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.menuTitle}>WhatsApp Concierge</Text>
              <Text style={styles.menuSub}>Instant help for custom sourcing & orders</Text>
            </View>
            <ChevronRight size={16} color={colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCallSupport}
            style={styles.menuRow}
          >
            <Phone size={18} color={colors.neutral[800]} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.menuTitle}>Phone Hotline</Text>
              <Text style={styles.menuSub}>{env.SUPPORT_PHONE} (9am - 11pm)</Text>
            </View>
            <ChevronRight size={16} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {isAuthenticated && (
          <TouchableOpacity activeOpacity={0.8} onPress={handleLogout} style={[styles.menuRow, styles.logoutRow]}>
            <LogOut size={18} color={colors.error.DEFAULT} />
            <Text style={[styles.menuTitle, styles.logoutText]}>Log out</Text>
          </TouchableOpacity>
        )}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Bazaura v{env.APP_VERSION} • bazaura.pk</Text>
          <Text style={styles.copyrightText}>Lahore, Pakistan</Text>
        </View>
      </ScrollView>
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
    paddingBottom: 30,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 10,
    ...shadows.subtle,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutral[100],
  },
  avatarFallback: {
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: typography.weight.bold,
    color: colors.primary[700],
  },
  guestCard: {
    backgroundColor: colors.secondary[100],
    borderRadius: radii.xl,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  guestMark: {
    width: 44,
    height: 54,
    marginBottom: 8,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  guestSub: {
    fontSize: 13,
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 19,
  },
  guestBtn: {
    alignSelf: 'stretch',
    marginTop: 14,
  },
  logoutRow: {
    marginBottom: 6,
  },
  logoutText: {
    color: colors.error.DEFAULT,
    marginLeft: 10,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
  },
  userPhone: {
    fontSize: 11,
    color: colors.neutral[600],
    marginTop: 1,
  },
  userEmail: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  cityPillText: {
    fontSize: 10,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
  },
  cityPickerCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 10,
  },
  cityPickerTitle: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    marginBottom: 8,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cityOption: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  cityOptionActive: {
    backgroundColor: colors.neutral[900],
  },
  cityText: {
    fontSize: 11,
    color: colors.neutral[700],
  },
  cityTextActive: {
    color: colors.neutral.white,
    fontWeight: typography.weight.bold,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickBox: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.subtle,
  },
  quickCount: {
    fontSize: 14,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
    marginTop: 4,
  },
  quickLabel: {
    fontSize: 9,
    color: colors.neutral[500],
    marginTop: 1,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 6,
  },
  orderCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 8,
    ...shadows.subtle,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  orderNum: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  orderDate: {
    fontSize: 9,
    color: colors.neutral[400],
    marginTop: 1,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    fontSize: 11,
    color: colors.neutral[700],
    fontWeight: typography.weight.medium,
  },
  orderSpeed: {
    fontSize: 10,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 6,
    ...shadows.subtle,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[900],
  },
  menuSub: {
    fontSize: 10,
    color: colors.neutral[400],
    marginTop: 1,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  appInfoText: {
    fontSize: 11,
    color: colors.neutral[500],
  },
  copyrightText: {
    fontSize: 10,
    color: colors.neutral[400],
    marginTop: 2,
  },
});
