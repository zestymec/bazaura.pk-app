import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './AppText';
import { Price } from './ui';
import { Heart, Star, Zap } from '../icons';
import type { ProductCard as ProductCardData } from '../../api/types';
import { useToggleWishlist, useWishlistIds, useIsExpressCity } from '../../api/hooks';
import { useAuthStore } from '../../store/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { RemoteImage } from './RemoteImage';

interface Props {
  product: ProductCardData;
  width: number;
  onPress: (product: ProductCardData) => void;
}

/** Product tile (FRONTEND.md §7.4). */
export const ProductCard: React.FC<Props> = React.memo(({ product, width, onPress }) => {
  const saved = useWishlistIds().has(product.id);
  const toggle = useToggleWishlist();
  const requireLogin = useRequireLogin();
  const city = useAuthStore((s) => s.user?.city);
  const showExpress = useIsExpressCity(city) && product.isExpressEligible;

  const onHeart = useCallback(() => {
    if (!requireLogin('Log in to save items to your wishlist.')) return;
    toggle.mutate({ product, saved });
  }, [requireLogin, toggle, product, saved]);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(product)} style={{ width }}>
      <View style={[styles.imageWrap, { height: width * 1.25 }]}>
        <RemoteImage uri={product.primaryImage} width={width} style={StyleSheet.absoluteFill} />
        {!product.inStock && (
          <View style={styles.soldOut}>
            <Text style={styles.soldOutText}>Sold out</Text>
          </View>
        )}
        <View style={styles.topRow}>
          {product.badge ? (
            <View style={[styles.badge, product.badge === 'SALE' && styles.badgeSale]}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          ) : (
            <View />
          )}
          <TouchableOpacity
            onPress={onHeart}
            style={styles.heart}
            hitSlop={8}
            accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart size={16} color={saved ? colors.primary[500] : colors.neutral[800]} fill={saved ? colors.primary[500] : 'transparent'} />
          </TouchableOpacity>
        </View>
        {showExpress && (
          <View style={styles.express}>
            <Zap size={10} color={colors.primary[600]} fill={colors.primary[600]} />
            <Text style={styles.expressText}>Express</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      <Price price={product.price} compareAt={product.compareAtPrice} />
      {product.reviewCount > 0 && (
        <View style={styles.rating}>
          <Star size={11} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingText}>
            {product.ratingAvg.toFixed(1)} <Text style={styles.ratingCount}>({product.reviewCount})</Text>
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  imageWrap: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
    marginBottom: 10,
  },
  soldOut: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    backgroundColor: colors.neutral[900],
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: typography.weight.bold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  topRow: { position: 'absolute', top: 8, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' },
  badge: { backgroundColor: colors.neutral[900], paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  badgeSale: { backgroundColor: colors.primary[500] },
  badgeText: { color: colors.neutral.white, fontSize: 10, fontWeight: typography.weight.extrabold, letterSpacing: 0.4 },
  heart: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  express: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  expressText: { fontSize: 10.5, fontWeight: typography.weight.bold, color: colors.primary[700] },
  title: { fontSize: 13.5, fontWeight: typography.weight.semibold, color: colors.neutral[900], lineHeight: 18, marginBottom: 4 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontSize: 11.5, fontWeight: typography.weight.bold, color: colors.neutral[700] },
  ratingCount: { fontWeight: typography.weight.regular, color: colors.neutral[400] },
});
