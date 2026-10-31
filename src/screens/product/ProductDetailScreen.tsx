import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Share,
} from 'react-native';
import { Text } from '../../components/common/AppText';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Zap,
  CheckCircle,
  ShoppingBag,
  Plus,
  Minus,
  Clock,
} from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { LAHORE_DELIVERY_ZONES } from '../../data/lahoreAreas';
import { useProduct } from '../../hooks/queries';
import { optimizeImageUrl } from '../../utils/images';
import { RootStackParamList } from '../../types/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { formatPKR } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductDetailRouteProp>();
  const insets = useSafeAreaInsets();
  // Paint instantly from the list item, then swap in the full record (reviews, specs, stock).
  const { data: product } = useProduct(route.params.product);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isFavorite = useWishlistStore((s) => s.wishlistIds.includes(product.id));

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants?.forEach((v) => {
      if (v.options.length > 0) {
        initial[v.name] = v.options[0].value;
      }
    });
    return initial;
  });
  const [quantity, setQuantity] = useState(1);
  const [selectedLahoreArea, setSelectedLahoreArea] = useState(LAHORE_DELIVERY_ZONES[0]);

  const maxQty = Math.max(1, Math.min(product.stockCount || 10, 10));
  const canBuy = product.inStock;

  const handleSelectVariant = (variantName: string, optionValue: string) => {
    haptic.selection();
    setSelectedVariants((prev) => ({ ...prev, [variantName]: optionValue }));
  };

  const handleAddToCart = () => {
    if (!canBuy) return;
    addItem(product, quantity, selectedVariants);
  };

  const handleBuyNow = () => {
    if (!canBuy) return;
    addItem(product, quantity, selectedVariants);
    navigation.navigate('MainTabs', { screen: 'CartTab' });
  };

  const handleShare = () => {
    haptic.light();
    const url = `https://bazaura.pk/p/${product.id}`;
    Share.share({
      message: `${product.title} — ${formatPKR(product.price)} on Bazaura\n${url}`,
      url,
      title: product.title,
    }).catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* Top Floating Nav */}
      <View style={[styles.topNavBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity
          onPress={() => {
            haptic.light();
            navigation.goBack();
          }}
          style={styles.navCircleBtn}
        >
          <ArrowLeft size={18} color={colors.neutral[900]} />
        </TouchableOpacity>

        <View style={styles.navActionsRow}>
          <TouchableOpacity
            onPress={() => toggleWishlist(product.id)}
            style={styles.navCircleBtn}
          >
            <Heart
              size={18}
              color={isFavorite ? colors.primary[500] : colors.neutral[800]}
              fill={isFavorite ? colors.primary[500] : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={styles.navCircleBtn}
            accessibilityLabel="Share product"
          >
            <Share2 size={18} color={colors.neutral[800]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gallery Carousel */}
        <View style={styles.carouselWrapper}>
          <FlatList
            data={product.images}
            keyExtractor={(_, idx) => idx.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIdx(idx);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: optimizeImageUrl(item, SCREEN_WIDTH, 80) }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            )}
          />

          {product.images.length > 1 && (
            <View style={styles.dotsRow}>
              {product.images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === activeImageIdx ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>{product.brand}</Text>

            <View style={styles.ratingBadge}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingScore}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({product.reviewCount})</Text>
            </View>
          </View>

          <Text style={styles.titleText}>{product.title}</Text>

          {/* Price Box */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>{formatPKR(product.price)}</Text>
              {product.originalPrice && product.originalPrice > product.price && (
                <Text style={styles.originalPrice}>{formatPKR(product.originalPrice)}</Text>
              )}
              {product.discountPercent && (
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>SAVE {product.discountPercent}%</Text>
                </View>
              )}
            </View>
          </View>

          {/* Lahore 2-Hour Delivery Check */}
          {product.isLahoreExpress2Hour && (
            <View style={styles.deliveryCheckCard}>
              <View style={styles.deliveryHeaderRow}>
                <Zap size={14} color={colors.primary[500]} fill={colors.primary[500]} />
                <Text style={styles.deliveryTitle}>2-Hour Lahore Delivery Available</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zonesScroll}>
                {LAHORE_DELIVERY_ZONES.slice(0, 6).map((zone) => {
                  const isSelected = selectedLahoreArea.id === zone.id;
                  return (
                    <TouchableOpacity
                      key={zone.id}
                      onPress={() => {
                        haptic.selection();
                        setSelectedLahoreArea(zone);
                      }}
                      style={[
                        styles.zonePill,
                        isSelected && styles.zonePillActive,
                      ]}
                    >
                      <Text style={[styles.zonePillText, isSelected && styles.zonePillTextActive]}>
                        {zone.name.split('(')[0].trim()} (~{zone.estimatedMinutes}m)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Variants */}
          {product.variants?.map((variant) => (
            <View key={variant.id} style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>
                {variant.name}: <Text style={{ color: colors.primary[500] }}>{selectedVariants[variant.name]}</Text>
              </Text>
              <View style={styles.optionsWrap}>
                {variant.options.map((opt) => {
                  const isSelected = selectedVariants[variant.name] === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.75}
                      onPress={() => handleSelectVariant(variant.name, opt.value)}
                      style={[
                        styles.optionBtn,
                        isSelected && styles.optionBtnActive,
                      ]}
                    >
                      <Text style={[styles.optionBtnText, isSelected && styles.optionBtnTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Highlights */}
          {product.features && (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              {product.features.map((feat, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <CheckCircle size={14} color={colors.primary[500]} />
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value], idx) => (
                <View key={key} style={[styles.specRow, idx > 0 && styles.specRowBorder]}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <View style={styles.sectionBox}>
              <View style={styles.reviewsHeader}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Customer Reviews</Text>
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingScore}>{product.rating.toFixed(1)}</Text>
                  <Text style={styles.ratingCount}>({product.reviewCount})</Text>
                </View>
              </View>
              {product.reviews.slice(0, 5).map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewTop}>
                    <Text style={styles.reviewName}>{review.userName}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={10}
                          color="#F59E0B"
                          fill={n <= Math.round(review.rating) ? '#F59E0B' : 'transparent'}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewMeta}>
                    {review.cityName} · {review.date}
                    {review.verifiedPurchase ? ' · Verified purchase' : ''}
                  </Text>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.qtyBox}>
          <TouchableOpacity
            onPress={() => {
              if (quantity > 1) {
                haptic.light();
                setQuantity(quantity - 1);
              }
            }}
            style={styles.qtyBtn}
          >
            <Minus size={12} color={colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => {
              if (quantity < maxQty) {
                haptic.light();
                setQuantity(quantity + 1);
              }
            }}
            style={styles.qtyBtn}
          >
            <Plus size={12} color={colors.neutral[700]} />
          </TouchableOpacity>
        </View>

        <Button
          title={canBuy ? 'Add to Bag' : 'Sold Out'}
          disabled={!canBuy}
          onPress={handleAddToCart}
          size="md"
          variant="secondary"
          icon={<ShoppingBag size={16} color={colors.neutral[900]} />}
          style={{ flex: 1, marginHorizontal: 8 }}
        />

        <Button
          title="Buy Now"
          disabled={!canBuy}
          onPress={handleBuyNow}
          size="md"
          variant="primary"
          style={{ flex: 1 }}
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
  topNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  navCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  navActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  carouselWrapper: {
    width: SCREEN_WIDTH,
    height: 320,
    backgroundColor: colors.neutral[100],
    position: 'relative',
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 320,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 16,
    backgroundColor: colors.neutral[900],
  },
  inactiveDot: {
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  contentContainer: {
    padding: 16,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingScore: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  ratingCount: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  titleText: {
    fontSize: 16,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    lineHeight: 22,
    marginBottom: 10,
  },
  priceContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
  },
  originalPrice: {
    fontSize: 13,
    color: colors.neutral[400],
    textDecorationLine: 'line-through',
  },
  discountTag: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  discountTagText: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
  deliveryCheckCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 12,
  },
  deliveryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  deliveryTitle: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  zonesScroll: {
    gap: 6,
  },
  zonePill: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  zonePillActive: {
    backgroundColor: colors.neutral[900],
  },
  zonePillText: {
    fontSize: 10,
    color: colors.neutral[700],
    fontWeight: typography.weight.medium,
  },
  zonePillTextActive: {
    color: colors.neutral.white,
  },
  sectionBox: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginBottom: 6,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionBtn: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  optionBtnActive: {
    backgroundColor: colors.neutral[900],
  },
  optionBtnText: {
    fontSize: 11,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
  },
  optionBtnTextActive: {
    color: colors.neutral.white,
    fontWeight: typography.weight.bold,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11,
    color: colors.neutral[700],
  },
  descriptionText: {
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 19,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 12,
  },
  specRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  specKey: {
    width: 110,
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: typography.weight.semibold,
  },
  specValue: {
    flex: 1,
    fontSize: 12,
    color: colors.neutral[900],
    fontWeight: typography.weight.medium,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewName: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewMeta: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 12.5,
    color: colors.neutral[700],
    lineHeight: 18,
    marginTop: 6,
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
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.sm,
    padding: 2,
    gap: 4,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 4,
  },
  qtyText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    minWidth: 14,
    textAlign: 'center',
  },
});
