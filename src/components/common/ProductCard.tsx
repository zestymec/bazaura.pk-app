import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Text } from './AppText';
import { Heart, Plus, Star, Zap } from 'lucide-react-native';
import { Product } from '../../types/product';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { formatPKR } from '../../utils/formatters';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { haptic } from '../../utils/haptics';
import { optimizeImageUrl } from '../../utils/images';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  cardWidth?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_CARD_WIDTH = (SCREEN_WIDTH - 32 - 10) / 2;

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onPress,
  cardWidth = DEFAULT_CARD_WIDTH,
}) => {
  const isFavorite = useWishlistStore((state) => state.wishlistIds.includes(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addItem = useCartStore((state) => state.addItem);

  const handleWishlistToggle = useCallback(() => {
    toggleWishlist(product.id);
  }, [toggleWishlist, product.id]);

  const handleQuickAdd = useCallback(() => {
    if (product.inStock) addItem(product, 1);
  }, [addItem, product]);

  const handlePress = useCallback(() => {
    haptic.light();
    onPress(product);
  }, [onPress, product]);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[
        styles.container,
        { width: cardWidth },
      ]}
    >
      {/* Product Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: optimizeImageUrl(product.images[0], cardWidth) }}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={150}
        />
        {!product.inStock && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>Sold out</Text>
          </View>
        )}

        {/* Top Floating Row: Badges & Wishlist */}
        <View style={styles.topRow}>
          {product.discountPercent ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discountPercent}%</Text>
            </View>
          ) : product.isLahoreExpress2Hour ? (
            <View style={styles.expressPill}>
              <Zap size={9} color={colors.primary[500]} fill={colors.primary[500]} />
              <Text style={styles.expressPillText}>2-Hr</Text>
            </View>
          ) : <View />}

          {/* Wishlist Heart */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleWishlistToggle}
            style={styles.wishlistBtn}
            hitSlop={8}
            accessibilityLabel={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={15}
              color={isFavorite ? colors.primary[500] : colors.neutral[700]}
              fill={isFavorite ? colors.primary[500] : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Information */}
      <View style={styles.detailsContainer}>
        <Text style={styles.brandText} numberOfLines={1}>
          {product.brand}
        </Text>

        <Text style={styles.titleText} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Rating and Reviews */}
        <View style={styles.ratingRow}>
          <Star size={11} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCountText}>({product.reviewCount})</Text>
        </View>

        {/* Price and Add to Cart Action */}
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.priceText}>{formatPKR(product.price)}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPriceText}>
                {formatPKR(product.originalPrice)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleQuickAdd}
            disabled={!product.inStock}
            style={[styles.addBtn, !product.inStock && styles.addBtnDisabled]}
            hitSlop={8}
            accessibilityLabel="Add to cart"
          >
            <Plus size={16} color={colors.neutral.white} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.inStock === nextProps.product.inStock &&
    prevProps.cardWidth === nextProps.cardWidth &&
    prevProps.onPress === nextProps.onPress
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.subtle,
  },
  imageContainer: {
    width: '100%',
    height: 145,
    backgroundColor: colors.neutral[100],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  discountText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  expressPill: {
    backgroundColor: colors.neutral.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
    gap: 2,
    ...shadows.subtle,
  },
  expressPillText: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    color: colors.primary[600],
  },
  wishlistBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  detailsContainer: {
    padding: 10,
  },
  brandText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[900],
    lineHeight: 16,
    minHeight: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  reviewCountText: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  priceCol: {
    flex: 1,
  },
  priceText: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  originalPriceText: {
    fontSize: 10,
    color: colors.neutral[400],
    textDecorationLine: 'line-through',
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: colors.neutral[300],
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    fontSize: 11,
    fontWeight: typography.weight.extrabold,
    color: colors.neutral[800],
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
