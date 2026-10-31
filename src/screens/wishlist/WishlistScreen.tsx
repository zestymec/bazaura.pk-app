import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ListRenderItemInfo,
  useWindowDimensions,
} from 'react-native';
import { Text } from '../../components/common/AppText';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react-native';
import { ProductCard } from '../../components/common/ProductCard';
import { Button } from '../../components/common/Button';
import { useProductsByIds } from '../../hooks/queries';
import { Product } from '../../types/product';
import { useWishlistStore } from '../../store/useWishlistStore';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 10) / 2;
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const { products, isLoading } = useProductsByIds(wishlistIds);
  // Keep the visible list in sync with the store even before refetches land.
  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleOpen = useCallback(
    (product: Product) => navigation.navigate('ProductDetail', { product }),
    [navigation],
  );

  const handleClear = () => {
    Alert.alert('Clear wishlist?', 'All saved items will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      // Toggle each so the change also syncs to the server when logged in.
      { text: 'Clear', style: 'destructive', onPress: () => wishlistIds.forEach((id) => toggleWishlist(id)) },
    ]);
  };

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <ProductCard product={item} cardWidth={cardWidth} onPress={handleOpen} />
    ),
    [cardWidth, handleOpen],
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            haptic.light();
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <ArrowLeft size={18} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist ({wishlistIds.length})</Text>
        {savedProducts.length > 0 ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn} accessibilityLabel="Clear wishlist">
            <Trash2 size={15} color={colors.neutral[500]} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      {isLoading && savedProducts.length === 0 ? (
        <ActivityIndicator color={colors.primary[500]} style={{ marginTop: 40 }} />
      ) : savedProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={48} color={colors.neutral[300]} />
          <Text style={styles.emptyTitle}>Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save products you like to find them easily later.
          </Text>
          <Button
            title="Explore Products"
            onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
            size="md"
            variant="primary"
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <FlatList
          data={savedProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  gridRow: {
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  clearBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4,
  },
});
