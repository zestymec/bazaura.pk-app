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
  Heart,
  Sparkles,
  Zap,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Package,
} from 'lucide-react-native';
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

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const { user, orders, setSelectedCity } = useUserStore();
  const { wishlistIds } = useWishlistStore();
  const { requests } = useRequestStore();

  const [isChangingCity, setIsChangingCity] = useState(false);

  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'];

  const handleWhatsAppSupport = () => {
    haptic.selection();
    Alert.alert(
      'Bazaura Support',
      'Connecting to Bazaura Pakistan WhatsApp Care: +92 300 0000000'
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Apple ID Style Profile Header */}
        <View style={styles.profileCard}>
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.fullName}</Text>
              <ShieldCheck size={14} color={colors.primary[500]} />
            </View>
            <Text style={styles.userPhone}>{user.phone}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

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
            <Text style={styles.quickCount}>{wishlistIds.length}</Text>
            <Text style={styles.quickLabel}>Wishlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: 'RequestItemTab' })}
            style={styles.quickBox}
          >
            <Sparkles size={16} color={colors.secondary[600]} />
            <Text style={styles.quickCount}>{requests.length}</Text>
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

          {orders.map((ord) => (
            <View key={ord.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNum}>Order #{ord.orderNumber}</Text>
                  <Text style={styles.orderDate}>{formatDateTime(ord.createdAt)}</Text>
                </View>
                <Badge
                  label={ord.status}
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
            onPress={() => Alert.alert('Helpline', 'Calling Bazaura Pakistan Care: 042-111-BAZAURA')}
            style={styles.menuRow}
          >
            <Phone size={18} color={colors.neutral[800]} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.menuTitle}>Phone Hotline</Text>
              <Text style={styles.menuSub}>042-111-BAZAURA (9am - 10pm)</Text>
            </View>
            <ChevronRight size={16} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Bazaura Mobile App • @bazaura.pk</Text>
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
