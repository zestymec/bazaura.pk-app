import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Easing,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text } from '../../components/common/AppText';
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
import { Category, Product } from '../../types/product';
import { PromoBanner, StoryItem } from '../../types/content';
import { useHomeContent, useProducts } from '../../hooks/queries';
import { getErrorMessage } from '../../api/errors';
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

const GRID_GAP = 10;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - GRID_GAP) / 2;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [filterExpressOnly, setFilterExpressOnly] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const listRef = useRef<FlatList<Product>>(null);
  const topBtn = useRef(new Animated.Value(0)).current;

  const home = useHomeContent();
  const catalog = useProducts({
    category_id: selectedCategoryId ?? undefined,
    express_only: filterExpressOnly || undefined,
  });
  const [refreshing, setRefreshing] = useState(false);

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
      if (y > 900 && !showTopBtn) setShowTopBtn(true);
      if (y <= 900 && showTopBtn) setShowTopBtn(false);
    },
    [showTopBtn],
  );

  const scrollToTop = () => {
    haptic.light();
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptic.light();
    await Promise.allSettled([home.refetch(), catalog.refetch()]);
    setRefreshing(false);
  }, [home, catalog]);

  const handleProductPress = useCallback(
    (product: Product) => navigation.navigate('ProductDetail', { product }),
    [navigation],
  );

  const goToExplore = useCallback(
    (searchQuery?: string) => navigation.navigate('MainTabs', { screen: 'ExploreTab', params: { searchQuery } }),
    [navigation],
  );

  const handleBannerPress = useCallback(
    (banner: PromoBanner) => {
      if (banner.targetType === 'REQUEST') {
        navigation.navigate('MainTabs', { screen: 'RequestItemTab' });
      } else if (banner.targetType === 'LAHORE_EXPRESS') {
        setFilterExpressOnly(true);
      } else if (banner.targetType === 'CATEGORY' || banner.targetType === 'FLASH_DEAL') {
        goToExplore(banner.targetValue);
      }
    },
    [navigation, goToExplore],
  );

  const handleStoryPress = useCallback(
    (story: StoryItem) => {
      if (story.actionType === 'REQUEST') {
        navigation.navigate('MainTabs', { screen: 'RequestItemTab' });
      } else if (story.actionType === 'LAHORE_EXPRESS') {
        setFilterExpressOnly(true);
      } else {
        goToExplore(story.actionTarget);
      }
    },
    [navigation, goToExplore],
  );

  const handleSelectCategory = useCallback((cat: Category | null) => {
    setSelectedCategoryId(cat ? cat.id : null);
  }, []);

  const content = home.data;
  const expressProducts = content?.expressRail ?? [];

  const renderRailItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <View style={styles.railCardWrap}>
        <ProductCard product={item} cardWidth={150} onPress={handleProductPress} />
      </View>
    ),
    [handleProductPress],
  );

  const renderGridItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <ProductCard product={item} cardWidth={cardWidth} onPress={handleProductPress} />
    ),
    [cardWidth, handleProductPress],
  );

  const onEndReached = useCallback(() => {
    if (catalog.hasNextPage && !catalog.isFetchingNextPage) catalog.fetchNextPage();
  }, [catalog]);

  const listHeader = useMemo(
    () => (
      <View>
        {/* Stories */}
        {content ? (
          <StoryBar stories={content.stories} onStoryPress={handleStoryPress} />
        ) : (
          <View style={styles.storySkeletonRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Shimmer key={i} style={styles.storySkeleton} />
            ))}
          </View>
        )}

        {/* Delivery promise */}
        <DeliveryUSPBanner
          onLahoreExpressPress={() => setFilterExpressOnly((prev) => !prev)}
          onNationwidePress={() => setFilterExpressOnly(false)}
        />

        {/* Hero banners */}
        {content ? (
          <HeroBannerCarousel banners={content.heroBanners} onBannerPress={handleBannerPress} />
        ) : (
          <Shimmer style={styles.bannerSkeleton} />
        )}

        {/* Category rail */}
        <View style={styles.stickyChips}>
          <CategoryChips
            categories={content?.categories ?? []}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
          />
          <View style={styles.hairline} />
        </View>

        {/* Trust strip */}
        <TrustStrip />

        {/* Flash deals */}
        <FlashDealsSection
          products={content?.flashDeals ?? []}
          onProductPress={handleProductPress}
          onSeeAllPress={() => goToExplore()}
        />

        {/* Express rail, tinted so it reads as its own shelf */}
        {expressProducts.length > 0 && (
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
              initialNumToRender={3}
              windowSize={3}
              renderItem={renderRailItem}
            />
          </View>
        )}

        {/* Sourcing concierge */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            haptic.selection();
            navigation.navigate('MainTabs', { screen: 'RequestItemTab' });
          }}
          style={styles.conciergeCard}
        >
          <View pointerEvents="none" style={styles.conciergeGlowLarge} />
          <View pointerEvents="none" style={styles.conciergeGlowSmall} />

          <View style={styles.conciergeHeader}>
            <View style={styles.conciergeIconWrap}>
              <Sparkles size={14} color={colors.primary[600]} />
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

        {/* Catalog heading */}
        <View style={styles.gridHeading}>
          <SectionHeading
            title={filterExpressOnly ? 'Express in Lahore' : 'Recommended for you'}
            caption={
              filterExpressOnly
                ? 'Delivered within 2 hours inside Lahore'
                : 'Based on what shoppers near you are buying'
            }
            icon={
              filterExpressOnly ? <Zap size={15} color={colors.primary[500]} fill={colors.primary[500]} /> : undefined
            }
          />
          {(filterExpressOnly || selectedCategoryId) && (
            <TouchableOpacity
              onPress={() => {
                haptic.light();
                setFilterExpressOnly(false);
                setSelectedCategoryId(null);
              }}
              style={styles.clearFilterPill}
              activeOpacity={0.8}
            >
              <Text style={styles.clearFilterText}>Clear filter</Text>
              <Text style={styles.clearFilterX}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [
      content,
      expressProducts,
      selectedCategoryId,
      filterExpressOnly,
      handleStoryPress,
      handleBannerPress,
      handleSelectCategory,
      handleProductPress,
      renderRailItem,
      goToExplore,
      navigation,
    ],
  );

  const showSkeleton = catalog.isLoading || (catalog.isPlaceholderData && catalog.isFetching);

  const listEmpty = showSkeleton ? (
    <View style={styles.skeletonGrid}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={`sk_${i}`} />
      ))}
    </View>
  ) : catalog.isError ? (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Couldn’t load products</Text>
      <Text style={styles.emptySub}>{getErrorMessage(catalog.error)}</Text>
      <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.85} onPress={() => catalog.refetch()}>
        <Text style={styles.emptyBtnText}>Try again</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Nothing here yet</Text>
      <Text style={styles.emptySub}>Clear the filter, or request the item and we’ll source it for you.</Text>
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
  );

  const listFooter =
    catalog.items.length === 0 ? null : catalog.isFetchingNextPage ? (
      <ActivityIndicator color={colors.primary[500]} style={styles.footerSpinner} />
    ) : !catalog.hasNextPage ? (
      <Text style={styles.endNote}>You’re all caught up · bazaura.pk</Text>
    ) : null;

  return (
    <View style={styles.screenContainer}>
      <Header
        onSearchPress={() => goToExplore()}
        onWishlistPress={() => navigation.navigate('Wishlist')}
        onCartPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
      />

      <FlatList
        ref={listRef}
        data={showSkeleton ? [] : catalog.items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderGridItem}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.6}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
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
      />

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
    borderColor: colors.secondary[200],
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
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
    color: colors.primary[700],
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
  gridHeading: {
    marginTop: 20,
  },
  gridRow: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  footerSpinner: {
    marginVertical: 18,
  },
  storySkeletonRow: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.white,
  },
  storySkeleton: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  bannerSkeleton: {
    height: 170,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radii.xl,
  },
  clearFilterPill: {
    alignSelf: 'flex-start',
    marginLeft: 16,
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
