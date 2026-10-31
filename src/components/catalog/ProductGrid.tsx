import React, { useCallback } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductCard } from '../common/ProductCard';
import { Loading, ProductCardSkeleton } from '../common/ui';
import type { ProductCard as ProductCardData } from '../../api/types';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';

const GAP = 12;
const PAD = 16;

/** Two-column, virtualised, infinite product grid. */
export const ProductGrid: React.FC<{
  products: ProductCardData[];
  loading?: boolean;
  loadingMore?: boolean;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  header?: React.ReactElement | null;
  empty?: React.ReactElement | null;
  onScrollBeginDrag?: () => void;
}> = ({ products, loading, loadingMore, onEndReached, refreshing = false, onRefresh, header, empty, onScrollBeginDrag }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const cardWidth = (width - PAD * 2 - GAP) / 2;

  const open = useCallback(
    (p: ProductCardData) => navigation.navigate('ProductDetail', { slug: p.slug, preview: p }),
    [navigation],
  );
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ProductCardData>) => (
      <View style={styles.cell}>
        <ProductCard product={item} width={cardWidth} onPress={open} />
      </View>
    ),
    [cardWidth, open],
  );

  return (
    <FlatList
      data={loading ? [] : products}
      keyExtractor={(p) => p.id}
      numColumns={2}
      renderItem={renderItem}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={header}
      ListEmptyComponent={
        loading ? (
          <View style={styles.skeletons}>
            {[0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} width={cardWidth} />
            ))}
          </View>
        ) : (
          empty
        )
      }
      ListFooterComponent={loadingMore ? <Loading style={{ paddingVertical: 20 }} /> : <View style={{ height: 24 }} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScrollBeginDrag={onScrollBeginDrag}
      showsVerticalScrollIndicator={false}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={7}
      removeClippedSubviews={Platform.OS === 'android'}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} colors={[colors.primary[500]]} />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  row: { paddingHorizontal: PAD, gap: GAP },
  cell: { marginBottom: 18 },
  skeletons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: PAD },
});
