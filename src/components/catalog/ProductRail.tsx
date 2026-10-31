import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { ProductCard } from '../common/ProductCard';
import { SectionHeader } from '../common/ui';
import type { ProductCard as ProductCardData } from '../../api/types';

const CARD_WIDTH = 150;

/** Horizontal product shelf. Hidden when empty (§7.3). */
export const ProductRail: React.FC<{
  title: string;
  products: ProductCardData[];
  onPressProduct: (p: ProductCardData) => void;
  onSeeAll?: () => void;
}> = React.memo(({ title, products, onPressProduct, onSeeAll }) => {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ProductCardData>) => <ProductCard product={item} width={CARD_WIDTH} onPress={onPressProduct} />,
    [onPressProduct],
  );
  if (!products.length) return null;
  return (
    <View style={styles.wrap}>
      <SectionHeader title={title} actionLabel={onSeeAll ? 'See all' : undefined} onAction={onSeeAll} />
      <FlatList
        data={products}
        horizontal
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Gap}
        initialNumToRender={3}
        windowSize={3}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
      />
    </View>
  );
});

const Gap = () => <View style={{ width: 12 }} />;

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  list: { paddingHorizontal: 16 },
});
