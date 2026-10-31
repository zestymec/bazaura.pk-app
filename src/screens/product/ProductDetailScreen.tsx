import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Chip, EmptyState, Loading, Price, QuantityStepper, Skeleton } from '../../components/common/ui';
import { ProductRail } from '../../components/catalog/ProductRail';
import { showToast } from '../../components/common/Toast';
import { ChevronLeft, Heart, Ruler, Share2, ShoppingBag, Star, Zap } from '../../components/icons';
import { useIsExpressCity, useProduct, useRelated, useReviews, useToggleWishlist, useWishlistIds } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import type { ProductCard, ProductDetail, VariantOut } from '../../api/types';
import { useAuthStore } from '../../store/auth';
import { MAX_QTY, useCartStore } from '../../store/cart';
import { useRequireLogin } from '../../hooks/useRequireLogin';
import type { RootStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';
import { RemoteImage } from '../../components/common/RemoteImage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// §7.5 helpers
const findVariant = (p: ProductDetail, size: string | null, color: string | null) =>
  p.variants.find((v) => (v.size ?? null) === size && (v.color ?? null) === color);
const sizeEnabled = (p: ProductDetail, size: string, color: string | null) =>
  p.variants.some((v) => v.size === size && (v.color ?? null) === color && v.inStock);

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { data: product, isError, error, refetch, isPlaceholderData } = useProduct(params.slug, params.preview);
  const related = useRelated(params.slug);
  const reviews = useReviews(params.slug);

  const saved = useWishlistIds().has(product?.id ?? '');
  const toggleWishlist = useToggleWishlist();
  const requireLogin = useRequireLogin();
  const addToCart = useCartStore((s) => s.add);
  const city = useAuthStore((s) => s.user?.city);
  const expressCity = useIsExpressCity(city);

  const [imageIndex, setImageIndex] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const ready = !!product && !isPlaceholderData;
  const colorsList = product?.availableColors ?? [];
  const sizesList = product?.availableSizes ?? [];

  // Pre-select the first colour once the full product (with variants) arrives.
  useEffect(() => {
    if (ready && color === null && product!.variants.length) {
      setColor(product!.variants.find((v) => v.inStock)?.color ?? product!.variants[0].color ?? null);
    }
  }, [ready, product, color]);

  const variant: VariantOut | undefined = useMemo(() => {
    if (!ready) return undefined;
    if (product!.variants.length === 1) return product!.variants[0];
    if (sizesList.length && !size) return undefined;
    return findVariant(product!, size, colorsList.length ? color : null);
  }, [ready, product, size, color, sizesList.length, colorsList.length]);

  const swatch = (c: string) => product?.variants.find((v) => v.color === c)?.colorHex ?? null;

  const handleColor = (c: string) => {
    setColor(c);
    if (size && product && !sizeEnabled(product, size, c)) setSize(null);
    // Show the image for that colour if the gallery has one per colour.
    const i = colorsList.indexOf(c);
    if (product && product.images.length === colorsList.length && i >= 0) setImageIndex(i);
  };

  const handleAdd = (goToBag: boolean) => {
    if (!product) return;
    if (sizesList.length && !size) {
      setSizeError(true);
      return;
    }
    if (!variant?.inStock) return;
    addToCart(variant.id, qty, {
      title: product.title,
      imageUrl: product.images[colorsList.indexOf(variant.color ?? '')] ?? product.primaryImage,
      size: variant.size,
      color: variant.color,
      productSlug: product.slug,
    });
    if (goToBag) navigation.navigate('MainTabs', { screen: 'BagTab' });
    else showToast('Added to bag');
  };

  const handleShare = () => {
    if (!product) return;
    const url = `https://bazaura.pk/p/${product.slug}`;
    Share.share({ message: `${product.title} on Bazaura\n${url}`, url, title: product.title }).catch(() => {});
  };

  const openProduct = useCallback((p: ProductCard) => navigation.push('ProductDetail', { slug: p.slug, preview: p }), [navigation]);

  if (isError && !product) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.navBtn, { margin: 16 }]}>
          <ChevronLeft size={22} color={colors.neutral[900]} />
        </TouchableOpacity>
        <EmptyState title="Product unavailable" message={errorMessage(error)} actionLabel="Try again" onAction={() => refetch()} />
      </View>
    );
  }
  if (!product) return <Loading style={{ flex: 1 }} />;

  const images = product.images.length ? product.images : product.primaryImage ? [product.primaryImage] : [];
  const displayPrice = variant?.price ?? product.price;
  const attributes = Object.entries(product.attributes ?? {}).filter(([, v]) => v !== null && v !== '');

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        {/* Gallery */}
        <View style={{ width, height: width * 1.2, backgroundColor: colors.neutral[100] }}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            keyExtractor={(u, i) => `${i}_${u}`}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <RemoteImage uri={item} width={width} quality={80} style={{ width, height: width * 1.2 }} />
            )}
            initialScrollIndex={0}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            extraData={imageIndex}
          />
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === imageIndex && styles.dotOn]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.body}>
          {product.breadcrumbs?.length > 0 && (
            <Text style={styles.crumbs}>{product.breadcrumbs.map((b) => b.name).join(' › ')}</Text>
          )}
          <Text style={styles.title}>{product.title}</Text>
          <View style={styles.metaRow}>
            <Price price={displayPrice} compareAt={product.compareAtPrice} discount={product.discountPercent} size="lg" />
          </View>
          <View style={styles.metaRow}>
            {product.reviewCount > 0 && (
              <View style={styles.rating}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>
                  {product.ratingAvg.toFixed(1)} · {product.reviewCount} reviews
                </Text>
              </View>
            )}
            {product.isExpressEligible && expressCity && (
              <View style={styles.express}>
                <Zap size={12} color={colors.primary[600]} fill={colors.primary[600]} />
                <Text style={styles.expressText}>Express available</Text>
              </View>
            )}
          </View>

          {/* Variant picker */}
          {!ready ? (
            <Skeleton style={{ height: 90, marginTop: 20, borderRadius: radii.lg }} />
          ) : (
            <>
              {colorsList.length > 0 && (
                <View style={styles.block}>
                  <Text style={styles.label}>
                    Colour: <Text style={styles.labelValue}>{color ?? '—'}</Text>
                  </Text>
                  <View style={styles.chips}>
                    {colorsList.map((c) => (
                      <Chip key={c} label={c} swatch={swatch(c)} selected={color === c} onPress={() => handleColor(c)} />
                    ))}
                  </View>
                </View>
              )}

              {sizesList.length > 0 && (
                <View style={styles.block}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, sizeError && { color: colors.error.DEFAULT }]}>
                      {sizeError ? 'Please choose a size' : 'Size'}
                    </Text>
                    {!!product.sizeChartUrl && (
                      <TouchableOpacity style={styles.sizeGuide} onPress={() => Linking.openURL(product.sizeChartUrl!).catch(() => {})}>
                        <Ruler size={14} color={colors.neutral[700]} />
                        <Text style={styles.sizeGuideText}>Size guide</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.chips}>
                    {sizesList.map((sz) => (
                      <Chip
                        key={sz}
                        label={sz}
                        selected={size === sz}
                        disabled={!sizeEnabled(product, sz, colorsList.length ? color : null)}
                        onPress={() => {
                          setSize(sz);
                          setSizeError(false);
                        }}
                        style={{ minWidth: 52, justifyContent: 'center' }}
                      />
                    ))}
                  </View>
                </View>
              )}

              {variant && variant.inStock && variant.stockQuantity <= 3 && (
                <Text style={styles.lowStock}>Only {variant.stockQuantity} left — order soon</Text>
              )}
              {variant && !variant.inStock && <Text style={styles.lowStock}>This option is sold out</Text>}
              {!product.inStock && <Text style={styles.lowStock}>Sold out in all sizes</Text>}

              <View style={[styles.block, styles.qtyRow]}>
                <Text style={styles.label}>Quantity</Text>
                <QuantityStepper value={qty} max={Math.min(MAX_QTY, variant?.stockQuantity || MAX_QTY)} onChange={setQty} />
              </View>
            </>
          )}

          {/* Details */}
          {!!product.shortDescription && <Text style={styles.short}>{product.shortDescription}</Text>}
          {ready && (
            <View style={styles.details}>
              {!!product.description && product.description !== product.shortDescription && <Text style={styles.desc}>{product.description}</Text>}
              {(
                [
                  ['Fabric', product.fabric],
                  ['Fit', product.fit],
                  ['Care', product.careInstructions],
                  ...attributes.filter(([k]) => k !== 'Fit').map(([k, v]) => [k, String(v)]),
                ] as [string, string | null][]
              )
                .filter(([, v]) => !!v)
                .map(([k, v]) => (
                  <View key={k} style={styles.spec}>
                    <Text style={styles.specKey}>{k}</Text>
                    <Text style={styles.specVal}>{v}</Text>
                  </View>
                ))}
            </View>
          )}

          {/* Reviews */}
          <View style={styles.reviewsHead}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity
              onPress={() => {
                const then = { name: 'WriteReview' as const, params: { slug: product.slug, title: product.title, sizes: sizesList } };
                if (requireLogin('Log in to write a review.', then)) navigation.navigate(then.name, then.params);
              }}
            >
              <Text style={styles.link}>Write a review</Text>
            </TouchableOpacity>
          </View>
          {reviews.isLoading ? (
            <Loading />
          ) : reviews.data?.items.length ? (
            reviews.data.items.slice(0, 5).map((r) => (
              <View key={r.id} style={styles.review}>
                <View style={styles.reviewTop}>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={12} color="#F59E0B" fill={n <= r.rating ? '#F59E0B' : 'transparent'} />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>{formatDate(r.createdAt)}</Text>
                </View>
                {!!r.title && <Text style={styles.reviewTitle}>{r.title}</Text>}
                <Text style={styles.reviewBody}>{r.comment}</Text>
                <Text style={styles.reviewMeta}>
                  {r.authorName}
                  {r.sizePurchased ? ` · Size ${r.sizePurchased}` : ''}
                  {r.isVerifiedPurchase ? ' · Verified purchase' : ''}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
          )}
        </View>

        <ProductRail title="You may also like" products={related.data ?? []} onPressProduct={openProduct} />
      </ScrollView>

      {/* Floating nav */}
      <View style={[styles.nav, { top: insets.top + 6 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn} accessibilityLabel="Back">
          <ChevronLeft size={22} color={colors.neutral[900]} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={handleShare} style={styles.navBtn} accessibilityLabel="Share">
            <Share2 size={18} color={colors.neutral[900]} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => requireLogin('Log in to save items to your wishlist.') && toggleWishlist.mutate({ product, saved })}
            style={styles.navBtn}
            accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart size={18} color={saved ? colors.primary[500] : colors.neutral[900]} fill={saved ? colors.primary[500] : 'transparent'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom bar */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          title="Add to bag"
          variant="outline"
          size="lg"
          disabled={!ready || !product.inStock || (!!variant && !variant.inStock)}
          onPress={() => handleAdd(false)}
          icon={<ShoppingBag size={17} color={colors.neutral[900]} />}
          style={{ flex: 1 }}
        />
        <Button
          title="Buy now"
          size="lg"
          disabled={!ready || !product.inStock || (!!variant && !variant.inStock)}
          onPress={() => handleAdd(true)}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral.white },
  dots: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotOn: { width: 18, backgroundColor: colors.neutral.white },
  body: { padding: 16 },
  crumbs: { fontSize: 12, color: colors.neutral[500], marginBottom: 6 },
  title: { fontSize: 22, fontWeight: typography.weight.bold, color: colors.neutral[900], lineHeight: 28 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, color: colors.neutral[700], fontWeight: typography.weight.semibold },
  express: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary[50], paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  expressText: { fontSize: 12, fontWeight: typography.weight.bold, color: colors.primary[700] },
  block: { marginTop: 20 },
  label: { fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900], marginBottom: 10 },
  labelValue: { fontWeight: typography.weight.regular, color: colors.neutral[600] },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sizeGuide: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  sizeGuideText: { fontSize: 13, fontWeight: typography.weight.semibold, color: colors.neutral[700], textDecorationLine: 'underline' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  lowStock: { marginTop: 12, fontSize: 13, fontWeight: typography.weight.bold, color: colors.primary[700] },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  short: { fontSize: 15, color: colors.neutral[800], lineHeight: 22, marginTop: 24 },
  details: { marginTop: 12 },
  desc: { fontSize: 14, color: colors.neutral[600], lineHeight: 21, marginBottom: 12 },
  spec: { flexDirection: 'row', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.divider },
  specKey: { width: 90, fontSize: 13, color: colors.neutral[500], fontWeight: typography.weight.semibold },
  specVal: { flex: 1, fontSize: 13, color: colors.neutral[900] },
  reviewsHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  link: { fontSize: 13, fontWeight: typography.weight.bold, color: colors.primary[500] },
  review: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.divider },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewDate: { fontSize: 12, color: colors.neutral[400] },
  reviewTitle: { fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900], marginTop: 6 },
  reviewBody: { fontSize: 13.5, color: colors.neutral[700], lineHeight: 20, marginTop: 4 },
  reviewMeta: { fontSize: 12, color: colors.neutral[500], marginTop: 6 },
  noReviews: { fontSize: 13, color: colors.neutral[500], paddingVertical: 12 },
  nav: { position: 'absolute', left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.neutral.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surface.divider,
  },
});
