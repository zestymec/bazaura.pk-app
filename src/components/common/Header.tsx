import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text } from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Search, Heart, ShoppingBag, Zap, ChevronDown } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { useUserStore } from '../../store/useUserStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore, selectCartCount } from '../../store/useCartStore';
import { haptic } from '../../utils/haptics';

const BRAND_MARK = require('../../../assets/brand/mark.png');
const BRAND_WORDMARK = require('../../../assets/brand/wordmark.png');

interface HeaderProps {
  onSearchPress?: () => void;
  onWishlistPress?: () => void;
  onCartPress?: () => void;
  onLocationPress?: () => void;
  title?: string;
  showSearch?: boolean;
  showLocation?: boolean;
  showWishlist?: boolean;
  showCart?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  onWishlistPress,
  onCartPress,
  onLocationPress,
  title,
  showSearch = true,
  showLocation = true,
  showWishlist = true,
  showCart = true,
}) => {
  const insets = useSafeAreaInsets();
  const selectedCity = useUserStore((s) => s.user.selectedCity);
  const wishlistCount = useWishlistStore((s) => s.wishlistIds.length);
  const cartCount = useCartStore(selectCartCount);
  const isLahore = selectedCity.toLowerCase() === 'lahore';

  return (
    <View style={[styles.headerWrapper, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.contentContainer}>
        {/* Left Side: Brand Logo or Page Title */}
        <View style={styles.leftSection}>
          {title ? (
            <Text style={styles.titleText}>{title}</Text>
          ) : (
            <View style={styles.brandContainer}>
              <View style={styles.logoRow}>
                <Image source={BRAND_MARK} style={styles.logoImage} resizeMode="contain" />
                <Image
                  source={BRAND_WORDMARK}
                  style={styles.wordmark}
                  resizeMode="contain"
                  accessibilityLabel="Bazaura"
                />
              </View>

              {showLocation && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    haptic.selection();
                    onLocationPress?.();
                  }}
                  style={styles.locationRow}
                >
                  <Zap size={11} color={colors.primary[500]} fill={colors.primary[500]} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {isLahore ? 'Lahore • 2-Hour Express' : `${selectedCity} • 2-3 Days`}
                  </Text>
                  <ChevronDown size={11} color={colors.neutral[400]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Right Side: Clean Apple-Style Action Buttons */}
        <View style={styles.actionsRow}>
          {showSearch && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                haptic.light();
                onSearchPress?.();
              }}
              style={styles.iconBtn}
            >
              <Search size={20} color={colors.neutral[800]} strokeWidth={2} />
            </TouchableOpacity>
          )}

          {showWishlist && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                haptic.light();
                onWishlistPress?.();
              }}
              style={styles.iconBtn}
            >
              <Heart size={20} color={colors.neutral[800]} strokeWidth={2} />
              {wishlistCount > 0 && (
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeDotText}>{wishlistCount > 9 ? '9+' : wishlistCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {showCart && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                haptic.light();
                onCartPress?.();
              }}
              style={[styles.iconBtn, styles.cartBtn]}
            >
              <ShoppingBag size={19} color={colors.neutral.white} strokeWidth={2.2} />
              {cartCount > 0 && (
                <View style={styles.cartBadgeDot}>
                  <Text style={styles.cartBadgeDotText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    zIndex: 50,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  leftSection: {
    flex: 1,
  },
  brandContainer: {
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 26,
    height: 32,
    marginRight: 6,
  },
  // Wordmark asset is 816×166; keep that ratio.
  wordmark: {
    width: 108,
    height: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[600],
  },
  titleText: {
    fontSize: 18,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBtn: {
    backgroundColor: colors.primary[500],
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary[500],
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.neutral.white,
  },
  badgeDotText: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
  cartBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.neutral[900],
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.neutral.white,
  },
  cartBadgeDotText: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
});
