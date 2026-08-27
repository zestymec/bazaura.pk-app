import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Flame, Clock, ChevronRight } from 'lucide-react-native';
import { Product } from '../../types/product';
import { ProductCard } from '../common/ProductCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

interface FlashDealsSectionProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onSeeAllPress?: () => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  products,
  onProductPress,
  onSeeAllPress,
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 5, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDigit = (num: number) => num.toString().padStart(2, '0');
  const flashProducts = products.filter((p) => (p.discountPercent || 0) >= 10);

  return (
    <View style={styles.container}>
      {/* Header with Title and Minimalist Countdown */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>Flash Deals</Text>

          {/* Clean Minimalist Timer Badge */}
          <View style={styles.timerBadge}>
            <Clock size={11} color={colors.neutral[600]} />
            <Text style={styles.timerText}>
              {formatDigit(timeLeft.hours)}:{formatDigit(timeLeft.minutes)}:{formatDigit(timeLeft.seconds)}
            </Text>
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
        data={flashProducts}
        keyExtractor={(item) => `flash_${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              product={item}
              cardWidth={150}
              onPress={() => onProductPress(item)}
            />
          </View>
        )}
      />
    </View>
  );
};

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
