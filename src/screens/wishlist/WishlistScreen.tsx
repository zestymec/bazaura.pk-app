import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { EmptyState } from '../../components/common/ui';
import { ProductGrid } from '../../components/catalog/ProductGrid';
import { Heart } from '../../components/icons';
import { useWishlist } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import { useAuthStore } from '../../store/auth';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const wishlist = useWishlist();

  const header = <Text style={styles.title}>Wishlist</Text>;

  if (!isLoggedIn) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <EmptyState
          icon={Heart}
          title="Save what you love"
          message="Log in to keep a wishlist across your devices."
          actionLabel="Log in"
          onAction={() => navigation.navigate('Login', { reason: 'Log in to see your wishlist.' })}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ProductGrid
        products={wishlist.data ?? []}
        loading={wishlist.isLoading}
        refreshing={wishlist.isRefetching}
        onRefresh={() => wishlist.refetch()}
        header={header}
        empty={
          wishlist.isError ? (
            <EmptyState title="Couldn't load your wishlist" message={errorMessage(wishlist.error)} actionLabel="Try again" onAction={() => wishlist.refetch()} />
          ) : (
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              message="Tap the heart on any product to save it here."
              actionLabel="Browse products"
              onAction={() => navigation.navigate('MainTabs', { screen: 'ShopTab' })}
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  title: { fontSize: 28, fontWeight: typography.weight.bold, color: colors.neutral[900], paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
});
