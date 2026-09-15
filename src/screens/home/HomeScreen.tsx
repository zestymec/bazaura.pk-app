import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Easing,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Zap,
  Sparkles,
  ChevronRight,
  ChevronUp,
  ShieldCheck,
  RotateCcw,
  Banknote,
  Headphones,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { DeliveryUSPBanner } from '../../components/home/DeliveryUSPBanner';
import { StoryBar } from '../../components/home/StoryBar';
import { HeroBannerCarousel } from '../../components/home/HeroBannerCarousel';
import { CategoryChips } from '../../components/home/CategoryChips';
import { FlashDealsSection } from '../../components/home/FlashDealsSection';
import { ProductCard } from '../../components/common/ProductCard';
import { PRODUCTS } from '../../data/products';
import { Product } from '../../types/product';
import { PromoBanner, StoryItem } from '../../data/banners';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/* ------------------------------------------------------------------ */
/*  Small local building blocks (no extra deps)                        */
/* ------------------------------------------------------------------ */

/**
 * Section heading with a short accent bar on the left.
 * The bar is not decoration — it marks a scannable rail boundary in a
 * long scroll, the same way Amazon uses a rule above each shelf.
 */
const SectionHeading: React.FC<{
  title: string;
  icon?: React.ReactNode;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, icon, caption, actionLabel, onAction }) => (
  <View style={styles.sectionHeaderRow}>
    <View style={styles.headingLeft}>
      <View style={styles.accentBar} />
      <View style={{ flex: 1 }}>
        <View style={styles.titleWithIcon}>
          {icon}
          <Text style={styles.sectionTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {!!caption && (
          <Text style={styles.sectionCaption} numberOfLines={1}>
            {caption}
          </Text>
        )}
      </View>
    </View>

    {!!actionLabel && (
      <TouchableOpacity activeOpacity={0.7} onPress={onAction} style={styles.seeAllBtn}>
        <Text style={styles.seeAllText}>{actionLabel}</Text>
        <ChevronRight size={13} color={colors.primary[500]} />
      </TouchableOpacity>
    )}
  </View>
);

/** Shimmering placeholder used while the feed refreshes. */
const Shimmer: React.FC<{ style?: any }> = ({ style }) => {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return <Animated.View style={[styles.shimmerBlock, style, { opacity: pulse }]} />;
};

const SkeletonCard: React.FC = () => (
  <View style={styles.skeletonCard}>
    <Shimmer style={styles.skeletonImage} />
    <Shimmer style={{ height: 10, width: '85%', marginTop: 10 }} />
    <Shimmer style={{ height: 10, width: '55%', marginTop: 6 }} />
    <Shimmer style={{ height: 13, width: '40%', marginTop: 10 }} />
  </View>
);

/** Trust strip — the four things a first-time PK shopper actually asks. */
const TRUST_ITEMS = [
  { key: 'cod', label: 'Cash on delivery', Icon: Banknote },
  { key: 'ret', label: '7-day returns', Icon: RotateCcw },
  { key: 'sec', label: 'Verified sellers', Icon: ShieldCheck },
  { key: 'sup', label: 'Support till 11pm', Icon: Headphones },
];

const TrustStrip: React.FC = () => (
  <View style={styles.trustStrip}>
    {TRUST_ITEMS.map(({ key, label, Icon }, i) => (
      <View key={key} style={styles.trustItem}>
        <Icon size={15} color={colors.primary[500]} />
        <Text style={styles.trustLabel} numberOfLines={2}>
          {label}
        </Text>
        {i < TRUST_ITEMS.length - 1 && <View style={styles.trustDivider} />}
      </View>
    ))}
  </View>
);

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [filterExpressOnly, setFilterExpressOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const topBtn = useRef(new Animated.Value(0)).current;

  // One orchestrated entrance for the whole feed, not per-section.
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  useEffect(() => {
    Animated.spring(topBtn, {
      toValue: showTopBtn ? 1 : 0,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [showTopBtn, topBtn]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      if (y > 700 && !showTopBtn) setShowTopBtn(true);
      if (y <= 700 && showTopBtn) setShowTopBtn(false);
    },
    [showTopBtn],
  );

  const scrollToTop = () => {
    haptic.light();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onRefresh = () => {
    setRefreshing(true);
    haptic.light();
    setTimeout(() => setRefreshing(false), 900);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleBannerPress = (banner: PromoBanner) => {
    if (banner.targetType === 'REQUEST') {
      navigation.navigate('MainTabs', { screen: 'RequestItemTab' });
    } else if (banner.targetType === 'LAHORE_EXPRESS') {
      setFilterExpressOnly(true);
    } else if (banner.targetType === 'CATEGORY') {
      navigation.navigate('MainTabs', {
        screen: 'ExploreTab',
        params: { searchQuery: banner.targetValue },
      });
    }
  };

  const handleStoryPress = (story: StoryItem) => {
    if (story.actionType === 'REQUEST') {
      navigation.navigate('MainTabs', { screen: 'RequestItemTab' });
    } else if (story.actionType === 'CATEGORY') {
      navigation.navigate('MainTabs', {
        screen: 'ExploreTab',
        params: { searchQuery: story.actionTarget },
      });
    }
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategoryId
        ? p.category.toLowerCase().includes(selectedCategoryId.replace('cat_', ''))
        : true;
      const matchesExpress = filterExpressOnly ? p.isLahoreExpress2Hour : true;
      return matchesCategory && matchesExpress;
    });
  }, [selectedCategoryId, filterExpressOnly]);

  const expressProducts = useMemo(() => PRODUCTS.filter((p) => p.isLahoreExpress2Hour), []);

  return (
    <View style={styles.screenContainer}>
      <Header
        onSearchPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
        onWishlistPress={() => navigation.navigate('Wishlist')}
        onCartPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
      />

      <Animated.ScrollView
        ref={scrollRef as any}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        // Category row pins under the header once you scroll past the banners.
        stickyHeaderIndices={[3]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
            progressBackgroundColor={colors.neutral.white}
          />
        }
        contentContainerStyle={styles.scrollContent}
        style={{
          opacity: enter,
          transform: [
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        }}
      >
        {/* 0 — Stories */}
        <StoryBar onStoryPress={handleStoryPress} />

        {/* 1 — Delivery promise */}
        <DeliveryUSPBanner
          onLahoreExpressPress={() => setFilterExpressOnly((prev) => !prev)}
          onNationwidePress={() => setFilterExpressOnly(false)}
        />

        {/* 2 — Hero banners */}
        <HeroBannerCarousel onBannerPress={handleBannerPress} />

        {/* 3 — Sticky category rail */}
        <View style={styles.stickyChips}>
          <CategoryChips
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(cat) => setSelectedCategoryId(cat ? cat.id : null)}
          />
          <View style={styles.hairline} />
        </View>

        {/* 4 — Trust strip */}
        <TrustStrip />

        {/* 5 — Flash deals */}
        <FlashDealsSection
          products={PRODUCTS}
          onProductPress={handleProductPress}
          onSeeAllPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
        />

        {/* 6 — Express rail, tinted so it reads as its own shelf */}
        <View style={styles.expressShelf}>
          <SectionHeading
            title="2-hour Lahore express"
            caption={`${expressProducts.length} items in stock nearby`}
            icon={<Zap size={15} color={colors.primary[500]} fill={colors.primary[500]} />}
            actionLabel="See all"
            onAction={() => {
              haptic.selection();
              setFilterExpressOnly(true);
            }}
          />

          <FlatList
            data={expressProducts}
            keyExtractor={(item) => `express_${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railList}
            snapToInterval={160}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={styles.railCardWrap}>
                <ProductCard
                  product={item}
                  cardWidth={150}
                  onPress={() => handleProductPress(item)}
                />
              </View>
            )}
          />
        </View>

        {/* 7 — Sourcing concierge */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            haptic.selection();
            navigation.navigate('MainTabs', { screen: 'RequestItemTab' });
          }}
          style={styles.conciergeCard}
        >
          {/* soft depth without a gradient library */}
          <View pointerEvents="none" style={styles.conciergeGlowLarge} />
          <View pointerEvents="none" style={styles.conciergeGlowSmall} />

          <View style={styles.conciergeHeader}>
            <View style={styles.conciergeIconWrap}>
              <Sparkles size={14} color={colors.secondary[700]} />
            </View>
            <Text style={styles.conciergeTag}>Sourcing concierge</Text>
          </View>

          <Text style={styles.conciergeTitle}>Can’t find what you need?</Text>
          <Text style={styles.conciergeSub}>
            Tell us the product. We buy it from the market and deliver it in 2 hours.
          </Text>

          <View style={styles.conciergeCta}>
            <Text style={styles.conciergeCtaText}>Request an item</Text>
            <ChevronRight size={14} color={colors.neutral.white} />
          </View>
        </TouchableOpacity>

        {/* 8 — Catalog grid */}
        <View style={styles.gridSection}>
          <SectionHeading
            title={filterExpressOnly ? 'Express in Lahore' : 'Recommended for you'}
            caption={
              filterExpressOnly
                ? 'Delivered within 2 hours inside Lahore'
                : 'Based on what shoppers near you are buying'
            }
            icon={
              filterExpressOnly ? (
                <Zap size={15} color={colors.primary[500]} fill={colors.primary[500]} />
              ) : undefined
            }
          />

          {filterExpressOnly && (
            <TouchableOpacity
              onPress={() => {
                haptic.light();
                setFilterExpressOnly(false);
              }}
              style={styles.clearFilterPill}
              activeOpacity={0.8}
            >
              <Text style={styles.clearFilterText}>Clear filter</Text>
              <Text style={styles.clearFilterX}>✕</Text>
            </TouchableOpacity>
          )}

          <View style={styles.gridContainer}>
            {refreshing
              ? [0, 1, 2, 3].map((i) => <SkeletonCard key={`sk_${i}`} />)
              : filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => handleProductPress(product)}
                  />
                ))}
          </View>

          {!refreshing && filteredProducts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySub}>
                Clear the filter, or request the item and we’ll source it for you.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setFilterExpressOnly(false);
                  setSelectedCategoryId(null);
                }}
              >
                <Text style={styles.emptyBtnText}>Show all products</Text>
              </TouchableOpacity>
            </View>
          )}

          {!refreshing && filteredProducts.length > 0 && (
            <Text style={styles.endNote}>You’re all caught up · bazaura.pk</Text>
          )}
        </View>
      </Animated.ScrollView>

      {/* Back to top */}
      <Animated.View
        pointerEvents={showTopBtn ? 'auto' : 'none'}
        style={[
          styles.topBtnWrap,
          {
            opacity: topBtn,
            transform: [
              { scale: topBtn.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
              { translateY: topBtn.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.topBtn} activeOpacity={0.85} onPress={scrollToTop}>
          <ChevronUp size={18} color={colors.neutral.white} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  /* Sticky categories */
  stickyChips: {
    backgroundColor: colors.surface.background,
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },
  hairline: {
    height: 1,
    backgroundColor: colors.surface.border,
    opacity: 0.7,
  },

  /* Section heading */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  accentBar: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  sectionCaption: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 1,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingLeft: 10,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.primary[500],
  },

  /* Trust strip */
  trustStrip: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 12,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.subtle,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
    gap: 5,
  },
  trustLabel: {
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
    color: colors.neutral[700],
    fontWeight: typography.weight.semibold,
  },
  trustDivider: {
    position: 'absolute',
    right: 0,
    top: 4,
    bottom: 4,
    width: 1,
    backgroundColor: colors.surface.border,
  },

  /* Express shelf */
  expressShelf: {
    marginTop: 14,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surface.border,
  },
  railList: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  railCardWrap: {
    marginRight: 10,
  },

  /* Concierge */
  conciergeCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.secondary[100],
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    overflow: 'hidden',
    ...shadows.subtle,
  },
  conciergeGlowLarge: {
    position: 'absolute',
    right: -40,
    top: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.neutral.white,
    opacity: 0.45,
  },
  conciergeGlowSmall: {
    position: 'absolute',
    right: 30,
    bottom: -45,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral.white,
    opacity: 0.3,
  },
  conciergeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  conciergeIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conciergeTag: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.secondary[700],
  },
  conciergeTitle: {
    fontSize: 16,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  conciergeSub: {
    fontSize: 12.5,
    color: colors.neutral[700],
    lineHeight: 18,
    maxWidth: '88%',
  },
  conciergeCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  conciergeCtaText: {
    fontSize: 12.5,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },

  /* Grid */
  gridSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  clearFilterPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
  },
  clearFilterText: {
    fontSize: 11.5,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
  },
  clearFilterX: {
    fontSize: 11,
    color: colors.neutral[500],
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  /* Skeletons */
  shimmerBlock: {
    backgroundColor: colors.neutral[100],
    borderRadius: radii.sm,
  },
  skeletonCard: {
    width: '48%',
    marginBottom: 14,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  skeletonImage: {
    width: '100%',
    height: 120,
    borderRadius: radii.sm,
  },

  /* Empty + footer */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12.5,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyBtn: {
    marginTop: 14,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
  emptyBtnText: {
    fontSize: 12.5,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
  endNote: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 14,
    marginBottom: 4,
  },

  /* Back to top */
  topBtnWrap: {
    position: 'absolute',
    right: 16,
    bottom: 22,
  },
  topBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.neutral[900],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: { elevation: 6 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
});