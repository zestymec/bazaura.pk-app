import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Zap, Sparkles, ChevronRight } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { DeliveryUSPBanner } from '../../components/home/DeliveryUSPBanner';
import { StoryBar } from '../../components/home/StoryBar';
import { HeroBannerCarousel } from '../../components/home/HeroBannerCarousel';
import { CategoryChips } from '../../components/home/CategoryChips';
import { FlashDealsSection } from '../../components/home/FlashDealsSection';
import { ProductCard } from '../../components/common/ProductCard';
import { PRODUCTS } from '../../data/products';
import { Category, Product } from '../../types/product';
import { PromoBanner, StoryItem } from '../../data/banners';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [filterExpressOnly, setFilterExpressOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    haptic.light();
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
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
      navigation.navigate('MainTabs', { screen: 'ExploreTab', params: { searchQuery: banner.targetValue } });
    }
  };

  const handleStoryPress = (story: StoryItem) => {
    if (story.actionType === 'REQUEST') {
      navigation.navigate('MainTabs', { screen: 'RequestItemTab' });
    } else if (story.actionType === 'CATEGORY') {
      navigation.navigate('MainTabs', { screen: 'ExploreTab', params: { searchQuery: story.actionTarget } });
    }
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategoryId ? p.category.toLowerCase().includes(selectedCategoryId.replace('cat_', '')) : true;
      const matchesExpress = filterExpressOnly ? p.isLahoreExpress2Hour : true;
      return matchesCategory && matchesExpress;
    });
  }, [selectedCategoryId, filterExpressOnly]);

  const expressProducts = useMemo(() => {
    return PRODUCTS.filter((p) => p.isLahoreExpress2Hour);
  }, []);

  return (
    <View style={styles.screenContainer}>
      <Header
        onSearchPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
        onWishlistPress={() => navigation.navigate('Wishlist')}
        onCartPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Story Bar */}
        <StoryBar onStoryPress={handleStoryPress} />

        {/* 2-Hour Lahore & 2-3 Days Pakistan Delivery Segment */}
        <DeliveryUSPBanner
          onLahoreExpressPress={() => setFilterExpressOnly((prev) => !prev)}
          onNationwidePress={() => setFilterExpressOnly(false)}
        />

        {/* Hero Editorial Banners */}
        <HeroBannerCarousel onBannerPress={handleBannerPress} />

        {/* Category Segmented Pills */}
        <CategoryChips
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(cat) => setSelectedCategoryId(cat ? cat.id : null)}
        />

        {/* Flash Deals Section with Countdown */}
        <FlashDealsSection
          products={PRODUCTS}
          onProductPress={handleProductPress}
          onSeeAllPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
        />

        {/* Lahore 2-Hour Express Feature Rail */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithIcon}>
              <Zap size={15} color={colors.primary[500]} fill={colors.primary[500]} />
              <Text style={styles.sectionTitle}>2-Hour Lahore Express</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setFilterExpressOnly(true)}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={13} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={expressProducts}
            keyExtractor={(item) => `express_${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railList}
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

        {/* Clean Concierge Sourcing Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            haptic.selection();
            navigation.navigate('MainTabs', { screen: 'RequestItemTab' });
          }}
          style={styles.conciergeCard}
        >
          <View style={styles.conciergeHeader}>
            <View style={styles.conciergeIconWrap}>
              <Sparkles size={14} color={colors.secondary[700]} />
            </View>
            <Text style={styles.conciergeTag}>SOURCING CONCIERGE</Text>
          </View>

          <Text style={styles.conciergeTitle}>Can’t find what you need?</Text>
          <Text style={styles.conciergeSub}>
            Request any custom unlisted product. We’ll procure and deliver it in 2 Hours.
          </Text>

          <View style={styles.conciergeCtaRow}>
            <Text style={styles.conciergeCtaText}>Request Custom Item</Text>
            <ChevronRight size={13} color={colors.primary[500]} />
          </View>
        </TouchableOpacity>

        {/* Main Product Catalog Grid */}
        <View style={styles.gridSection}>
          <View style={styles.gridHeaderRow}>
            <Text style={styles.sectionTitle}>
              {filterExpressOnly ? '⚡ 2-Hour Express Lahore' : 'Recommended For You'}
            </Text>

            {filterExpressOnly && (
              <TouchableOpacity
                onPress={() => setFilterExpressOnly(false)}
                style={styles.clearFilterPill}
              >
                <Text style={styles.clearFilterText}>Show All ✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 2-Column Grid */}
          <View style={styles.gridContainer}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionContainer: {
    marginTop: 8,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.primary[500],
  },
  railList: {
    paddingHorizontal: 16,
  },
  railCardWrap: {
    marginRight: 10,
  },
  conciergeCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.subtle,
  },
  conciergeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  conciergeIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  conciergeTag: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.secondary[700],
    letterSpacing: 0.4,
  },
  conciergeTitle: {
    fontSize: 14,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  conciergeSub: {
    fontSize: 12,
    color: colors.neutral[500],
    lineHeight: 16,
  },
  conciergeCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 8,
  },
  conciergeCtaText: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.primary[500],
  },
  gridSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  clearFilterPill: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
