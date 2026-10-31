import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { Text } from '../common/AppText';
import { Flame, Clock, ChevronRight } from 'lucide-react-native';
import { Product } from '../../types/product';
import { ProductCard } from '../common/ProductCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

interface FlashDealsSectionProps {
  products: Product[];
  /** Seconds until the deal window closes (from GET /products/flash-deals). */
  countdownSeconds?: number;
  onProductPress: (product: Product) => void;
  onSeeAllPress?: () => void;
}

const pad = (num: number) => num.toString().padStart(2, '0');

/**
 * Ticks once a second. Kept as its own component so only this label
 * re-renders — not the whole rail of product cards.
 */
const Countdown: React.FC<{ seconds: number }> = React.memo(({ seconds }) => {
  const [endsAt] = useState(() => Date.now() + seconds * 1000);
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setLeft(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const sec = left % 60;
  return (
    <Text style={styles.timerText}>
      {pad(h)}:{pad(m)}:{pad(sec)}
    </Text>
  );
});

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = React.memo(({
  products,
  countdownSeconds = 4 * 3600,
  onProductPress,
  onSeeAllPress,
}) => {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <View style={styles.cardWrapper}>
        <ProductCard product={item} cardWidth={150} onPress={onProductPress} />
      </View>
    ),
    [onProductPress],
  );

  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header with Title and Minimalist Countdown */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>Flash Deals</Text>

          {/* Clean Minimalist Timer Badge */}
          <View style={styles.timerBadge}>
            <Clock size={11} color={colors.neutral[600]} />
            <Countdown key={countdownSeconds} seconds={countdownSeconds} />
          </View>
        </View>

        {onSeeAllPress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              haptic.light();
              onSeeAllPress();
            }}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={13} color={colors.primary[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Flash Deal Products */}
      <FlatList
        data={products}
        keyExtractor={(item) => `flash_${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={3}
        windowSize={3}
        renderItem={renderItem}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.sm,
    gap: 4,
  },
  timerText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.neutral[700],
    fontVariant: ['tabular-nums'],
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
  listContent: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    marginRight: 10,
  },
});
