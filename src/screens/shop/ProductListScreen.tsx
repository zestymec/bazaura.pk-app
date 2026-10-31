import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ScreenHeader } from '../../components/common/ui';
import { ProductListView } from '../../components/catalog/ProductListView';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';

/** Category / collection listing opened from Home, Shop or a banner. */
export const ProductListScreen: React.FC = () => {
  const { params } = useRoute<RouteProp<RootStackParamList, 'ProductList'>>();
  return (
    <View style={styles.screen}>
      <ScreenHeader title={params.title ?? 'Products'} />
      <ProductListView initialFilters={params.filters} />
    </View>
  );
};

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.surface.background } });
