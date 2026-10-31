import React from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Skeleton } from '../../components/common/ui';
import { ProductListView } from '../../components/catalog/ProductListView';
import { useCategories } from '../../api/hooks';
import type { CategoryNode } from '../../api/types';
import type { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { RemoteImage, Shade } from '../../components/common/RemoteImage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

/** Shop tab: search across the catalog, or browse the category tree (§7.4). */
export const ShopScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'ShopTab'>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data: tree, isLoading } = useCategories();
  const tile = (width - 32 - 12) / 2;

  const open = (c: CategoryNode) => navigation.navigate('ProductList', { filters: { category: c.slug }, title: c.name });

  const categories = (
    <View style={styles.body}>
      {isLoading && (
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ width: tile, height: tile * 0.7, borderRadius: radii.xl }} />
          ))}
        </View>
      )}
      {tree?.map((parent) => (
        <View key={parent.id} style={{ marginBottom: 20 }}>
          <View style={styles.parentRow}>
            <Text style={styles.parent}>{parent.name}</Text>
            <TouchableOpacity onPress={() => open(parent)}>
              <Text style={styles.all}>Shop all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {[...parent.children]
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((c) => (
                <TouchableOpacity key={c.id} activeOpacity={0.85} onPress={() => open(c)} style={[styles.tile, { width: tile, height: tile * 0.7 }]}>
                  <RemoteImage uri={c.imageUrl} width={tile} style={StyleSheet.absoluteFill} />
                  <Shade from={0.7} to={0} />
                  <View style={styles.tileShade}>
                    <Text style={styles.tileText}>{c.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Shop</Text>
      <ProductListView key={route.params?.focusSearch ? 'focus' : 'idle'} idleContent={categories} autoFocus={route.params?.focusSearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  title: { fontSize: 28, fontWeight: typography.weight.bold, color: colors.neutral[900], paddingHorizontal: 16, paddingTop: 10 },
  body: { paddingHorizontal: 16, paddingTop: 20 },
  parentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  parent: { fontSize: 18, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  all: { fontSize: 13, fontWeight: typography.weight.bold, color: colors.primary[500] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { borderRadius: radii.xl, overflow: 'hidden', backgroundColor: colors.neutral[800] },
  tileShade: { flex: 1, justifyContent: 'flex-end', padding: 14 },
  tileText: { color: colors.neutral.white, fontSize: 17, fontWeight: typography.weight.bold },
});
