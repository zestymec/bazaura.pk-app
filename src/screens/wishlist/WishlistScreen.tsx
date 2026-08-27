import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react-native';
import { ProductCard } from '../../components/common/ProductCard';
import { Button } from '../../components/common/Button';
import { PRODUCTS } from '../../data/products';
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
  const { wishlistIds, clearWishlist } = useWishlistStore();

  const savedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

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
        <Text style={styles.headerTitle}>Wishlist ({savedProducts.length})</Text>
        {savedProducts.length > 0 ? (
          <TouchableOpacity onPress={clearWishlist} style={styles.clearBtn}>
            <Trash2 size={15} color={colors.neutral[500]} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      {savedProducts.length === 0 ? (
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {savedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => navigation.navigate('ProductDetail', { product: prod })}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
