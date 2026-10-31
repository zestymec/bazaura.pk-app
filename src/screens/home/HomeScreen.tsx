import React, { useCallback, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { EmptyState, SectionHeader, Skeleton } from '../../components/common/ui';
import { BannerCarousel } from '../../components/home/BannerCarousel';
import { ProductRail } from '../../components/catalog/ProductRail';
import { Banknote, ChevronRight, Gift, LucideIcon, RotateCcw, Search, ShoppingBag, Sparkles, Truck, Zap } from '../../components/icons';
import { useConfig, useHome } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import type { ContentBlockOut, ProductCard } from '../../api/types';
import { useCartStore, selectCartCount } from '../../store/cart';
import type { RootStackParamList } from '../../types/navigation';
import { openContentTarget } from '../../utils/contentTarget';
import { formatPKR } from '../../utils/formatters';
import { optimizeImageUrl } from '../../utils/images';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

const MARK = require('../../../assets/brand/mark.png');
const WORDMARK = require('../../../assets/brand/wordmark.png');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const home = useHome();
  const config = useConfig();
  const cartCount = useCartStore(selectCartCount);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([home.refetch(), config.refetch()]);
    setRefreshing(false);
  }, [home, config]);

  const openProduct = useCallback(
    (p: ProductCard) => navigation.navigate('ProductDetail', { slug: p.slug, preview: p }),
    [navigation],
  );
  const openBlock = useCallback((b: ContentBlockOut) => openContentTarget(b, navigation as never), [navigation]);
  const shop = (filters: object, title: string) => navigation.navigate('ProductList', { filters, title });

  const feed = home.data;
  const cfg = config.data;
  const express = cfg?.deliveryOptions.find((o) => o.type === 'EXPRESS');

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.brand}>
          <Image source={MARK} style={styles.mark} resizeMode="contain" />
          <Image source={WORDMARK} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Bazaura" />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ShopTab', params: { focusSearch: true } })}
            accessibilityLabel="Search"
          >
            <Search size={20} color={colors.neutral[900]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.bagBtn]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'BagTab' })}
            accessibilityLabel="Bag"
          >
            <ShoppingBag size={19} color={colors.neutral.white} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} colors={[colors.primary[500]]} />}
      >
        {home.isError && !feed ? (
          <EmptyState title="Couldn't load the store" message={errorMessage(home.error)} actionLabel="Try again" onAction={() => home.refetch()} />
        ) : (
          <>
            {/* Delivery promise — every value comes from /storefront/config */}
            <View style={styles.perks}>
              {cfg ? (
                <>
                  {express && cfg.expressDeliveryCities.length > 0 && (
                    <Perk icon={Zap} title={`${cfg.expressDeliveryHours}-hour delivery`} sub={cfg.expressDeliveryCities.join(', ')} />
                  )}
                  <Perk icon={Truck} title="Free delivery" sub={`Over ${formatPKR(cfg.freeShippingThreshold)}`} />
                  <Perk icon={Banknote} title="Cash on delivery" sub="Pay at your door" />
                  <Perk icon={RotateCcw} title="Easy returns" sub="Hassle-free" />
                </>
              ) : (
                <Skeleton style={{ height: 40, flex: 1 }} />
              )}
            </View>

            {/* Banners */}
            {feed ? (
              <BannerCarousel banners={feed.banners} onPress={openBlock} />
            ) : (
              <Skeleton style={styles.bannerSkeleton} />
            )}

            {/* Stories */}
            {!!feed?.stories.length && (
              <FlatList
                horizontal
                data={feed.stories}
                keyExtractor={(s) => s.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stories}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.story} onPress={() => openBlock(item)}>
                    <View style={styles.storyRing}>
                      <Image source={{ uri: optimizeImageUrl(item.mobileImageUrl ?? item.imageUrl, 64) }} style={styles.storyImg} />
                    </View>
                    <Text style={styles.storyText} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Categories */}
            {!!feed?.featuredCategories.length && (
              <View style={{ marginTop: 20 }}>
                <SectionHeader title="Shop by category" actionLabel="All" onAction={() => navigation.navigate('MainTabs', { screen: 'ShopTab' })} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
                  {[...feed.featuredCategories]
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((c) => (
                      <TouchableOpacity key={c.id} style={styles.cat} onPress={() => shop({ category: c.slug }, c.name)}>
                        {c.imageUrl ? (
                          <Image source={{ uri: optimizeImageUrl(c.imageUrl, 72) }} style={styles.catImg} />
                        ) : (
                          <View style={styles.catImg} />
                        )}
                        <Text style={styles.catText} numberOfLines={1}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}

            {feed ? (
              <>
                <ProductRail title="New arrivals" products={feed.newArrivals} onPressProduct={openProduct} onSeeAll={() => shop({ sort: 'newest' }, 'New arrivals')} />
                <ProductRail title="Bestsellers" products={feed.bestsellers} onPressProduct={openProduct} onSeeAll={() => shop({ sort: 'popular' }, 'Bestsellers')} />
                <ProductRail title="On sale" products={feed.onSale} onPressProduct={openProduct} onSeeAll={() => shop({ onSale: true }, 'On sale')} />
              </>
            ) : (
              <View style={styles.railSkeleton}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} style={{ width: 150, height: 220, borderRadius: radii.lg }} />
                ))}
              </View>
            )}

            {/* Custom requests & gifts (§7.12 entry points) */}
            <View style={styles.cards}>
              <ActionCard
                icon={Gift}
                title="Send a gift"
                sub="Gift-wrapped with your message, anywhere in Pakistan."
                onPress={() => navigation.navigate('RequestForm', { type: 'GIFT' })}
              />
              <ActionCard
                icon={Sparkles}
                title="Can't find it?"
                sub="Tell us what you want — we'll arrange it."
                onPress={() => navigation.navigate('RequestForm', { type: 'CUSTOM_ITEM' })}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const Perk: React.FC<{ icon: LucideIcon; title: string; sub: string }> = ({
  icon: Icon,
  title,
  sub,
}) => (
  <View style={styles.perk}>
    <Icon size={16} color={colors.primary[500]} />
    <Text style={styles.perkTitle} numberOfLines={1}>
      {title}
    </Text>
    <Text style={styles.perkSub} numberOfLines={1}>
      {sub}
    </Text>
  </View>
);

const ActionCard: React.FC<{
  icon: LucideIcon;
  title: string;
  sub: string;
  onPress: () => void;
}> = ({ icon: Icon, title, sub, onPress }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.actionCard}>
    <View style={styles.actionIcon}>
      <Icon size={20} color={colors.primary[600]} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSub}>{sub}</Text>
    </View>
    <ChevronRight size={18} color={colors.neutral[400]} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.neutral.white,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mark: { width: 26, height: 32 },
  wordmark: { width: 112, height: 23 },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center' },
  bagBtn: { backgroundColor: colors.primary[500] },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.neutral[900],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  badgeText: { color: colors.neutral.white, fontSize: 9.5, fontWeight: typography.weight.extrabold },
  perks: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 14,
    marginBottom: 16,
  },
  perk: { flex: 1, alignItems: 'center', gap: 3, paddingHorizontal: 2 },
  perkTitle: { fontSize: 11, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  perkSub: { fontSize: 10, color: colors.neutral[500] },
  bannerSkeleton: { height: 190, marginHorizontal: 16, borderRadius: radii['2xl'] },
  stories: { paddingHorizontal: 16, paddingTop: 20, gap: 14 },
  story: { width: 68, alignItems: 'center' },
  storyRing: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, borderColor: colors.primary[500], padding: 3 },
  storyImg: { flex: 1, borderRadius: 30, backgroundColor: colors.neutral[100] },
  storyText: { fontSize: 11.5, fontWeight: typography.weight.semibold, color: colors.neutral[700], marginTop: 6 },
  cats: { paddingHorizontal: 16, gap: 12 },
  cat: { width: 76, alignItems: 'center' },
  catImg: { width: 72, height: 72, borderRadius: radii.xl, backgroundColor: colors.neutral[100] },
  catText: { fontSize: 12, fontWeight: typography.weight.semibold, color: colors.neutral[800], marginTop: 6 },
  railSkeleton: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 24 },
  cards: { paddingHorizontal: 16, marginTop: 28, gap: 10 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.secondary[100],
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  actionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.neutral.white, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 16, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  actionSub: { fontSize: 12.5, color: colors.neutral[600], marginTop: 2 },
});
