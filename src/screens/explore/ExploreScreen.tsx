import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  X,
  TrendingUp,
  Clock,
  Zap,
  ArrowUpDown,
} from 'lucide-react-native';
import { Input } from '../../components/common/Input';
import { ProductCard } from '../../components/common/ProductCard';
import { CATEGORIES } from '../../data/categories';
import { PRODUCTS } from '../../data/products';
import { Product, Category } from '../../types/product';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { useUserStore } from '../../store/useUserStore';
import { haptic } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ExploreRouteProp = RouteProp<MainTabParamList, 'ExploreTab'>;

const TRENDING_TAGS = [
  '⚡ 2-Hour Lahore',
  'iPhone 15 Pro',
  'Philips Airfryer',
  'Dior Sauvage',
  'Anker Power Bank',
  'Nescafé Gold',
  'Jordan 1 Retro',
];

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExploreRouteProp>();
  const insets = useSafeAreaInsets();

  const { recentSearches, addRecentSearch, clearRecentSearches } = useUserStore();

  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    route.params?.categorySlug || null
  );
  const [filterExpressOnly, setFilterExpressOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'priceAsc' | 'priceDesc' | 'rating'>('popularity');

  const handleSearchSubmit = (text: string) => {
    if (text.trim()) {
      addRecentSearch(text.trim());
    }
  };

  const handleTagPress = (tag: string) => {
    haptic.selection();
    const cleanTag = tag.replace('⚡ ', '').replace(' Lahore', '');
    if (tag.includes('2-Hour')) {
      setFilterExpressOnly(true);
      setSearchQuery('');
    } else {
      setSearchQuery(cleanTag);
      addRecentSearch(cleanTag);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const searchResults = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        !selectedCategory ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesExpress = filterExpressOnly ? p.isLahoreExpress2Hour : true;

      return matchesQuery && matchesCategory && matchesExpress;
    });

    if (sortBy === 'priceAsc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [searchQuery, selectedCategory, filterExpressOnly, sortBy]);

  const isBrowsingCatalog = searchQuery.length > 0 || selectedCategory !== null || filterExpressOnly;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.inputWrapper}>
          <Search size={17} color={colors.neutral[400]} style={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearchSubmit(searchQuery)}
            placeholder="Search items, brands, essentials..."
            containerStyle={{ marginBottom: 0 }}
            inputStyle={{ paddingLeft: 32, paddingRight: searchQuery ? 30 : 10 }}
            rightIcon={
              searchQuery ? (
                <TouchableOpacity
                  onPress={() => {
                    haptic.light();
                    setSearchQuery('');
                  }}
                >
                  <X size={15} color={colors.neutral[400]} />
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* If Not Actively Searching */}
        {!isBrowsingCatalog && (
          <View>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <Clock size={14} color={colors.neutral[500]} />
                    <Text style={styles.sectionTitle}>Recent</Text>
                  </View>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.chipsWrap}>
                  {recentSearches.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.75}
                      onPress={() => {
                        haptic.selection();
                        setSearchQuery(item);
                      }}
                      style={styles.recentChip}
                    >
                      <Text style={styles.recentChipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Trending Tags */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <TrendingUp size={14} color={colors.primary[500]} />
                <Text style={styles.sectionTitle}>Trending in Pakistan</Text>
              </View>

              <View style={styles.chipsWrap}>
                {TRENDING_TAGS.map((tag, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.75}
                    onPress={() => handleTagPress(tag)}
                    style={styles.trendingChip}
                  >
                    <Text style={styles.trendingChipText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Grid */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
                Browse Categories
              </Text>

              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.88}
                    onPress={() => {
                      haptic.selection();
                      setSelectedCategory(cat.slug);
                    }}
                    style={styles.categoryCard}
                  >
                    <Image source={{ uri: cat.image }} style={styles.categoryImage} />
                    <View style={styles.categoryOverlay}>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text style={styles.categoryCount}>
                        {cat.itemCount.toLocaleString()} items
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* If Searching / Filtering */}
        {isBrowsingCatalog && (
          <View>
            {/* Filter Pills Bar */}
            <View style={styles.filterBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.selection();
                    setFilterExpressOnly((prev) => !prev);
                  }}
                  style={[
                    styles.filterPill,
                    filterExpressOnly && styles.filterPillActive,
                  ]}
                >
                  <Zap
                    size={11}
                    color={filterExpressOnly ? colors.neutral.white : colors.primary[500]}
                    fill={filterExpressOnly ? colors.neutral.white : colors.primary[500]}
                  />
                  <Text
                    style={[
                      styles.filterPillText,
                      filterExpressOnly && styles.filterPillTextActive,
                    ]}
                  >
                    2-Hr Express
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.selection();
                    setSortBy(sortBy === 'priceAsc' ? 'priceDesc' : 'priceAsc');
                  }}
                  style={[
                    styles.filterPill,
                    (sortBy === 'priceAsc' || sortBy === 'priceDesc') && styles.filterPillActive,
                  ]}
                >
                  <ArrowUpDown
                    size={11}
                    color={sortBy.startsWith('price') ? colors.neutral.white : colors.neutral[600]}
                  />
                  <Text
                    style={[
                      styles.filterPillText,
                      sortBy.startsWith('price') && styles.filterPillTextActive,
                    ]}
                  >
                    {sortBy === 'priceAsc' ? 'Price: Low' : sortBy === 'priceDesc' ? 'Price: High' : 'Price'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.selection();
                    setSortBy(sortBy === 'rating' ? 'popularity' : 'rating');
                  }}
                  style={[
                    styles.filterPill,
                    sortBy === 'rating' && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      sortBy === 'rating' && styles.filterPillTextActive,
                    ]}
                  >
                    ⭐ Top Rated
                  </Text>
                </TouchableOpacity>

                {(selectedCategory || filterExpressOnly || searchQuery) && (
                  <TouchableOpacity
                    onPress={() => {
                      haptic.light();
                      setSelectedCategory(null);
                      setFilterExpressOnly(false);
                      setSearchQuery('');
                      setSortBy('popularity');
                    }}
                    style={styles.resetPill}
                  >
                    <Text style={styles.resetText}>Reset ✕</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            <View style={styles.resultsCountRow}>
              <Text style={styles.resultsCountText}>
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
              </Text>
            </View>

            {/* Results Grid */}
            {searchResults.length > 0 ? (
              <View style={styles.resultsGrid}>
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => handleProductPress(product)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptySubtitle}>
                  Can’t find what you need? Use our Sourcing Concierge to request any custom item.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'RequestItemTab' })}
                  style={styles.requestCtaBtn}
                >
                  <Text style={styles.requestCtaText}>Request This Item</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  clearText: {
    fontSize: 11,
    color: colors.neutral[400],
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recentChip: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  recentChipText: {
    fontSize: 11,
    color: colors.neutral[700],
  },
  trendingChip: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  trendingChipText: {
    fontSize: 11,
    fontWeight: typography.weight.medium,
    color: colors.neutral[800],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48%',
    height: 100,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.neutral[800],
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  categoryOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 10,
    justifyContent: 'flex-end',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
  categoryCount: {
    fontSize: 10,
    color: colors.neutral[300],
    marginTop: 1,
  },
  filterBar: {
    backgroundColor: colors.neutral.white,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: colors.neutral[900],
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
  },
  filterPillTextActive: {
    color: colors.neutral.white,
  },
  resetPill: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  resetText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[700],
  },
  resultsCountRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 11,
    color: colors.neutral[500],
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16,
  },
  requestCtaBtn: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.full,
  },
  requestCtaText: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
});
